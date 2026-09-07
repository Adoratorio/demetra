# Demetra

A utility library for WordPress/API custom interaction, built with native `fetch` and robust queueing.

## Installation

```bash
npm install @adoratorio/demetra
```

## Usage

This package is ESM-only. Import it as a module:

```typescript
import Demetra from '@adoratorio/demetra';

const demetra = new Demetra({
  endpoint: 'https://my-site.com/api.php',
  lang: 'en'
});
```

## Configuration

| Parameter | Type | Default | Description |
| :-------- | :--: | :-----: | :---------- |
| `endpoint` | `string` | `''` | The URL for the custom API endpoint. |
| `uploadEndpoint`| `string` | `''` | Endpoint for uploading files (defaults to `endpoint` swapping `api.php` for `upload.php`). |
| `site` | `string` | `'default'` | Site ID for WordPress multi-site installations. |
| `lang` | `string` | `'en'` | Default language for data retrieval. |
| `version` | `number` | `2` | API version used. |
| `throwOnError` | `boolean` | `true` | Reject with a `DemetraError` (carrying the response) when the API answers with a status code `>= 400`. When `false` the error payload is returned as-is. |
| `timeout` | `number` | `0` | Abort requests after this many ms (`0` disables). |
| `fetchOptions` | `RequestInit` | `{}` | Extra options forwarded to every `fetch` call (`credentials`, `headers`, `signal`, ...). |
| `cacheMaxAge` | `number` | `3600000` | Maximum cache age in ms for the LRU Cache. Error responses are never cached. |
| `maxItems` | `number` | `500` | Maximum number of entries kept in the local cache. |
| `debug` | `boolean` | `false` | Log every response and warn about recoverable issues. |

## Methods

### Fetching Data

All fetch methods follow a similar pattern and return a promise resolving to a generic `WpData<T>` object:

```typescript
// Fetch a specific page
const page = await demetra.fetchPage('homepage', { localCache: true });

// Fetch children
const children = await demetra.fetchChildren([1, 2, 3]);

// Fetch archive
const archive = await demetra.fetchArchive('news', {
  pagination: { start: 0, count: 10 }
});

// Every method accepts `lang`, `site` and `version` in its options; the
// instance defaults are used for the ones left out
const page = await demetra.fetchPage('homepage', { lang: 'it' });
```

Other available endpoints:
*   `fetchExtra(id, options)`
*   `fetchMenu(id, options)`
*   `fetchTaxonomy(id, options)`
*   `fetchLanguages(site, options)`
*   `fetchSitemap(site, options)`
*   `fetchAttachments(site, options)`

### Actions & Forms

```typescript
// Subscribe to MailChimp/Newsletter
await demetra.subscribe('email@example.com');
await demetra.subscribeWithAdditionalData('email@example.com', { name: 'John' });

// Send an email via preconfigured WP form
await demetra.send(formId, 'recipient@example.com', { name: 'John' });

// Upload files (returns WpFile[][])
await demetra.upload(myFile);

// Drop every locally cached response
demetra.clearCache();
```

### Errors

```typescript
import Demetra, { DemetraError } from '@adoratorio/demetra';

try {
  await demetra.fetchPage('missing');
} catch (error) {
  if (error instanceof DemetraError) {
    console.log(error.response.status.code); // e.g. 404
  }
}
```

### Queue System

Demetra includes a built-in request queue to batch API calls.

```typescript
import { DemetraRequestPage } from '@adoratorio/demetra';

// Add to queue. Request options mirror the fetch methods; `lang`, `site` and
// `version` fall back to the instance defaults when the queue is sent
demetra.queue.add(new DemetraRequestPage('about'));
demetra.queue.add(new DemetraRequestPage('contact', { lang: 'it', localCache: true }));

// Execute queue
// 0 = ONCE (Batch in single HTTP call)
// 1 = SIMULTANEOUSLY (Parallel fetch)
// 2 = AWAIT (Sequential fetch)
await demetra.fetchQueue(Demetra.SEND_MODES.ONCE);

// The queue is emptied as soon as it is sent: requests added while a batch is
// in flight belong to the next one
```

## TypeScript Support

Demetra is fully typed and uses generics for response handling, preventing silent errors and mutating cache bugs. All interfaces (`WpData`, `WpFile`, etc.) are exposed.
## Maintenance and compatibility

See [MAINTAINERS.md](MAINTAINERS.md), [CONTRIBUTING.md](CONTRIBUTING.md) and
[CHANGELOG.md](CHANGELOG.md). Historical contributor credits are retained.
The CI runtime is Node 24. Demetra runs in browsers and in Node with a global
`fetch`; a relative endpoint needs a browser. `AbortSignal.timeout` and
`AbortSignal.any` are used when `timeout` and a custom `signal` are combined.
