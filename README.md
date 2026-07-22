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
| `cacheMaxAge` | `number` | `3600000` | Maximum cache age in ms for the LRU Cache. |
| `maxItems` | `number` | `500` | Maximum number of entries kept in the local cache. |
| `debug` | `boolean` | `false` | Enable console logging. |

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

// Send an email via preconfigured WP form
await demetra.send(formId, 'recipient@example.com', { name: 'John' });

// Upload files (returns WpFile[][])
await demetra.upload(myFile);
```

### Queue System

Demetra includes a built-in request queue to batch API calls.

```typescript
import { DemetraRequestPage } from '@adoratorio/demetra';

// Add to queue
demetra.queue.add(new DemetraRequestPage('about'));
demetra.queue.add(new DemetraRequestPage('contact'));

// Execute queue
// 0 = ONCE (Batch in single HTTP call)
// 1 = SIMULTANEOUSLY (Parallel fetch)
// 2 = AWAIT (Sequential fetch)
await demetra.fetchQueue(Demetra.SEND_MODES.ONCE);
```

## TypeScript Support

Demetra is fully typed and uses generics for response handling, preventing silent errors and mutating cache bugs. All interfaces (`WpData`, `WpFile`, etc.) are exposed.