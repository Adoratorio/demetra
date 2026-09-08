# Demetra

A client for Adoratorio’s WordPress API, with request batching and response caching.

This README describes the 3.0.0 development version in this repository. For the published 2.7.1 package, use the [versioned README](https://github.com/Adoratorio/demetra/blob/v2.7.1/README.md).

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
| `fetchOptions` | `DemetraFetchOptions` | `{}` | Fetch options such as `credentials`, `headers` and `signal`; `method` and `body` are controlled by Demetra. |
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
const translatedPage = await demetra.fetchPage('homepage', { lang: 'it' });
```

Other available endpoints:
*   `fetchExtra(id, options)`
*   `fetchMenu(id, options)`
*   `fetchTaxonomy(id, options)`
*   `fetchLanguages(site, options)`
*   `fetchSitemap(site, options)`
*   `fetchAttachments(site, options)`

### Fetch parameters and defaults

All fetch helpers return `Promise<WpData<T>>` and accept a response type parameter, for example `fetchPage<MyPage>('homepage')`. Their second argument is an optional options object, defaulting to `{}`.

| Method | Required first argument |
| :----- | :---------------------- |
| `fetchPage` | `id: string \| number` |
| `fetchChildren` | `id: string \| number \| string[] \| number[]` |
| `fetchArchive`, `fetchExtra`, `fetchMenu` | `id: string` |
| `fetchTaxonomy` | `id: string \| string[]` |
| `fetchLanguages`, `fetchSitemap`, `fetchAttachments` | `site: string`; this argument takes precedence over `options.site`. |

| Option | Default | Applies to |
| :----- | :------ | :--------- |
| `lang`, `site`, `version` | Instance defaults at sending time | All requests, unless explicitly set on the request. |
| `wpCache` | `true` | All fetch helpers; requests server-side caching. |
| `localCache` | `false` | All fetch helpers; allows reuse from the local response cache. |
| `i18n` | `true` | Page, children and archive requests. Other helper option types include it, but those request classes do not serialize it. |
| `type` | `'page'` | Page requests. |
| `siblings` | `{ fields: [], prev: false, next: false, loop: false }` | Page requests; `fields` is `string[]`, the other fields are booleans. |
| `fields` | `[]` | Archive requests; `string[]` of requested fields. |
| `pagination` | `{ start: 0, count: -1 }` | Archive requests; both properties are numbers. |
| `filters` | `[]` | Archive requests; `{ compare: string, key: string, value: string }[]`. |
| `taxonomy` | `undefined` | Archive requests; optional `{ slug: string, id: string }`. |
| `filter_lang` | `undefined` | Sitemap requests; optional boolean, omitted unless supplied. |

Nested request options such as `pagination` and `siblings` replace their defaults as a whole; supply the required fields. The response envelope contains `status: { code: number, message: string, cache: boolean }` and `data: T`. Upload responses instead contain `status: { code: number, message: string }` and `data: { uploadId: number, url: string, path: string }`.

### Forms, subscriptions and uploads

| Method | Parameters | Return |
| :----- | :--------- | :----- |
| `subscribe` | `email: string`, `options = {}` | `Promise<WpData>` |
| `subscribeWithAdditionalData` | `email: string`, `data: Map<string, string> \| Record<string, string>`, `options = {}` | `Promise<WpData>` |
| `send` | `id: number`, `recipients: string`, `data: object`, `files?: File[]`, `options = {}` | `Promise<WpData>` |
| `upload` | `files: File \| File[]` | `Promise<WpFile[][]>` |

The final options argument on subscription and form helpers accepts `lang`, `site` and `version`. To pass form options without files, use `send(id, recipients, data, undefined, options)`. Files supplied to `send()` are uploaded first and their returned URLs are included in the form request. `upload()` returns one response array per uploaded file.

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

An empty or invalid `endpoint` throws during construction. Network errors, aborts and malformed response envelopes reject their promises. API error responses reject with `DemetraError` by default; `throwOnError: false` returns those API payloads but does not suppress network or validation failures. Error responses are never cached.

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

### Queue management and request classes

`queue.add(request)` and `queue.clear()` return `void`. `queue.requests` exposes the pending `AnyDemetraRequest[]`. `fetchQueue(sendMode = Demetra.SEND_MODES.ONCE)` returns `Promise<WpData[]>`: ONCE sends one batch, SIMULTANEOUSLY sends requests concurrently, and AWAIT sends them sequentially. Results retain request order. The queue is cleared before sending, including when a later request fails; failed requests are not automatically restored.

The package exports `DemetraQueue` and request classes for `Languages`, `SiteMap`, `Page`, `Children`, `Archive`, `Extra`, `Menu`, `Taxonomy`, `Attachments`, `Send` and `Subscribe`, each prefixed with `DemetraRequest`. Fetch request classes accept the corresponding helper's options. `DemetraRequestArchive`, `DemetraRequestExtra` and `DemetraRequestMenu` additionally accept numeric IDs in their constructors.

`DemetraRequestSend(id, options = {})` accepts `recipients` (default `''`), `data` (default `{}`) and `urls` (default `[]`, containing `{ path, url }` strings), plus base options. `DemetraRequestSubscribe(email, options = {})` accepts `data` (a Map, record or null; stored as a plain object, default `{}`), plus base options.

Requests expose `id`, `mode`, `lang`, `site`, `version` and a computed `hash`; cacheable requests also expose `wpCache` and `localCache`. Demetra fills missing `lang`, `site` and `version` through `applyDefaults({ lang, site, version })`, which returns the request. Reusing a prepared request retains the values filled on its first send. See [request types](src/Requests/types.ts) and [request implementations](src/Requests) for their specialized fields.

The exported base class `DemetraRequest(mode, id, options = {})` takes a `WP_MODES` value and a `RequestId`; its options are `lang`, `site` and `version`. The specialized classes set their own mode and identifier from their constructor arguments, even when their broad option types also expose `mode` or `id`.

### Runtime settings

`endpoint`, `uploadEndpoint`, `lang` and `site` are get/set properties. Changing `endpoint` validates the URL and switches the cache namespace; it also updates an automatically derived upload endpoint. An explicitly assigned upload endpoint is retained. `clearCache()` returns `void` and clears local responses.

Local caching is opt-in per request through `localCache: true`. A cached response is cloned before delivery and reports `status.code: 304`, `status.cache: true` and `status.message: 'Data loaded from local cache'`.

## TypeScript Support

Demetra includes generic response types and exports interfaces such as `WpData` and `WpFile`.

## Compatibility

Demetra runs in browsers and in Node.js environments with a global `fetch`. Relative endpoints require a browser. Combining a timeout with a custom signal requires `AbortSignal.timeout` and `AbortSignal.any`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, checks and pull requests.
Version history is documented in the [changelog](CHANGELOG.md) and [GitHub releases](https://github.com/Adoratorio/demetra/releases).

## Maintainers

Maintained by [Adoratorio](https://github.com/Adoratorio).

- [Andrea Gottardi](https://github.com/AndreaGottardi)
- [Daniele Borra](https://github.com/borradaniele)
- [Andrea Biason](https://github.com/biazo5)

Contributor credits are preserved in [package.json](package.json) and the Git history.

## License

[MIT](LICENSE).
