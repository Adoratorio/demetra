import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Demetra, {
  DemetraError,
  DemetraRequestPage,
  DemetraRequestSubscribe,
  SEND_MODES,
  type WpData,
} from '../src/index.ts';
import { validateUrl } from '../src/validators.ts';

interface Sent {
  url: string;
  init: RequestInit;
  requests: Record<string, unknown>[];
}

const sent: Sent[] = [];

function ok(data: unknown, code = 200): WpData {
  return { status: { code, message: 'OK', cache: false }, data };
}

// Answers every request in the batch with `responder(request)`
function mockFetch(responder: (request: Record<string, unknown>) => WpData): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as { requests: Record<string, unknown>[] };
      sent.push({ url, init, requests: body.requests });
      return Response.json(body.requests.map(responder));
    }),
  );
}

beforeEach(() => {
  sent.length = 0;
  mockFetch((request) => ok({ id: request.id }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('validateUrl', () => {
  it('accepts any http(s) URL shape and root-relative paths', () => {
    expect(validateUrl('https://my-site.com/api.php')).toBe(true);
    expect(validateUrl('https://my-site.com/wp-content/themes/x/api.php')).toBe(true);
    expect(validateUrl('http://localhost:8080/api')).toBe(true);
    expect(validateUrl('/api.php')).toBe(true);
    expect(validateUrl('ftp://my-site.com/api.php')).toBe(false);
    expect(validateUrl('my-site.com/api.php')).toBe(false);
  });
});

describe('Demetra requests', () => {
  it('fills the instance defaults into requests and keeps explicit values', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php', lang: 'it', site: 's1' });
    await demetra.fetchPage('home');
    await demetra.fetchPage('home', { lang: 'de' });

    expect(sent[0]?.requests[0]).toMatchObject({
      mode: 'page',
      id: 'home',
      lang: 'it',
      site: 's1',
      version: 2,
    });
    expect(sent[1]?.requests[0]).toMatchObject({ lang: 'de', site: 's1' });
    expect(sent[0]?.init.method).toBe('POST');
    expect(new Headers(sent[0]?.init.headers).get('content-type')).toBe('application/json');
  });

  it('forwards fetchOptions and wires a timeout signal', async () => {
    const demetra = new Demetra({
      endpoint: 'https://x.test/api.php',
      timeout: 1000,
      fetchOptions: { credentials: 'include', headers: { 'X-Token': 'abc' } },
    });
    await demetra.fetchPage('home');

    expect(sent[0]?.init.credentials).toBe('include');
    expect(new Headers(sent[0]?.init.headers).get('x-token')).toBe('abc');
    expect(sent[0]?.init.signal).toBeInstanceOf(AbortSignal);
  });

  it('sends the archive taxonomy only when given', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });
    await demetra.fetchArchive('news');
    await demetra.fetchArchive('news', { taxonomy: { slug: 'cat', id: '3' } });

    expect(sent[0]?.requests[0]).not.toHaveProperty('taxonomy');
    expect(sent[1]?.requests[0]).toMatchObject({ taxonomy: { slug: 'cat', id: '3' } });
  });

  it('sends subscribe data given as a Map as a plain object', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });
    await demetra.subscribeWithAdditionalData('a@b.c', new Map([['name', 'Ann']]));

    expect(sent[0]?.requests[0]).toMatchObject({
      mode: 'subscribe',
      email: 'a@b.c',
      data: { name: 'Ann' },
    });
    expect(new DemetraRequestSubscribe('a@b.c').data).toEqual({});
  });

  it('derives a stable hash from the request fields', () => {
    const a = new DemetraRequestPage('home', { lang: 'it' });
    const b = new DemetraRequestPage('home', { lang: 'it' });
    const c = new DemetraRequestPage('home', { lang: 'en' });
    expect(a.hash).toBe(b.hash);
    expect(a.hash).not.toBe(c.hash);
  });
});

describe('Demetra errors', () => {
  it('rejects with a DemetraError carrying the response by default', async () => {
    mockFetch(() => ({ status: { code: 404, message: 'Not found', cache: false }, data: null }));
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });

    const request = demetra.fetchPage('missing');
    await expect(request).rejects.toBeInstanceOf(DemetraError);
    await expect(request).rejects.toMatchObject({ response: { status: { code: 404 } } });
  });

  it('returns the error payload when throwOnError is off, without caching it', async () => {
    let calls = 0;
    mockFetch(() => {
      calls += 1;
      return { status: { code: 500, message: 'Boom', cache: false }, data: null };
    });
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php', throwOnError: false });

    const first = await demetra.fetchPage('home', { localCache: true });
    const second = await demetra.fetchPage('home', { localCache: true });

    expect(first.status.code).toBe(500);
    expect(second.status.code).toBe(500);
    expect(calls).toBe(2);
  });

  it('rejects on HTTP failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 502 })),
    );
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });
    await expect(demetra.fetchPage('home')).rejects.toThrow('HTTP Error: 502');
  });
});

describe('Demetra local cache', () => {
  it('serves repeated requests from the cache as 304 clones', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });

    const first = await demetra.fetchPage<{ id: string }>('home', { localCache: true });
    (first.data as { id: string }).id = 'mutated';
    const second = await demetra.fetchPage<{ id: string }>('home', { localCache: true });
    const third = await demetra.fetchPage<{ id: string }>('home');

    expect(sent).toHaveLength(2);
    expect(second.status).toMatchObject({ code: 304, cache: true });
    expect(second.data.id).toBe('home');
    expect(third.status.code).toBe(200);

    demetra.clearCache();
    await demetra.fetchPage('home', { localCache: true });
    expect(sent).toHaveLength(3);
  });
});

describe('Demetra queue', () => {
  it('batches uncached requests and merges cached ones back in order', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });
    await demetra.fetchPage('b', { localCache: true });
    sent.length = 0;

    demetra.queue.add(new DemetraRequestPage('a'));
    demetra.queue.add(new DemetraRequestPage('b', { localCache: true }));
    demetra.queue.add(new DemetraRequestPage('c'));
    const responses = await demetra.fetchQueue(SEND_MODES.ONCE);

    expect(sent).toHaveLength(1);
    expect(sent[0]?.requests.map((request) => request.id)).toEqual(['a', 'c']);
    expect(responses.map((response) => (response.data as { id: string }).id)).toEqual([
      'a',
      'b',
      'c',
    ]);
    expect(responses[1]?.status.code).toBe(304);
    expect(sent[0]?.requests[0]).toMatchObject({ lang: 'en', site: 'default' });
  });

  it('keeps requests queued while a batch is in flight', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });
    demetra.queue.add(new DemetraRequestPage('a'));
    const pending = demetra.fetchQueue();
    demetra.queue.add(new DemetraRequestPage('late'));
    await pending;

    expect(demetra.queue.requests.map((request) => request.id)).toEqual(['late']);
  });

  it('runs AWAIT mode sequentially and SIMULTANEOUSLY in parallel', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });
    demetra.queue.add(new DemetraRequestPage('a'));
    demetra.queue.add(new DemetraRequestPage('b'));
    const sequential = await demetra.fetchQueue(SEND_MODES.AWAIT);
    expect(sent).toHaveLength(2);
    expect(sequential).toHaveLength(2);

    demetra.queue.add(new DemetraRequestPage('c'));
    demetra.queue.add(new DemetraRequestPage('d'));
    const parallel = await demetra.fetchQueue(SEND_MODES.SIMULTANEOUSLY);
    expect(sent).toHaveLength(4);
    expect(parallel.map((response) => (response.data as { id: string }).id)).toEqual(['c', 'd']);
  });

  it('rejects an unknown send mode', async () => {
    const demetra = new Demetra({ endpoint: 'https://x.test/api.php' });
    await expect(demetra.fetchQueue(9 as never)).rejects.toThrow('Invalid SEND_MODES');
  });
});
