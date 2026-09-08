# Changelog

The changes below describe the planned 3.0.0 update. The published npm version is 2.7.1; no GitHub release has been published.

## Unreleased

### Documentation

- Document request defaults, optional form arguments, queue classes, runtime setters and development-version compatibility.

- Refine contributor guidance and consolidate maintainer contacts in the README.

### Planned for 3.0.0

#### Breaking changes

- Native `fetch` with LRU response caching replaces axios.

#### Changes

- Error responses are never cached; API errors reject with `DemetraError` (`throwOnError`).
- Request classes read `lang`, `site` and `version` from their options; the instance fills in its defaults when sending.
- The queue is snapshotted and cleared when sent; requests queued meanwhile belong to the next batch.
- Cache entries are keyed by endpoint: switching endpoint never serves another backend's data, even for responses still in flight; a derived upload endpoint follows the endpoint, an explicit one is kept.
- Uploads keep the configured headers but let the runtime set the multipart `Content-Type`.
- Response envelopes (`status`, `data`) are validated for requests and uploads.
- Archive `taxonomy` and sitemap `filter_lang` are sent when provided; endpoint validation accepts any http(s) URL.
- `timeout` and `fetchOptions` are forwarded to fetch; `clearCache()`.
- `js-md5` replaced by an inline string hash.

#### Maintenance

- Include source files and inline source maps for consumer debugging.
- Typecheck tests and verify packed exports.
