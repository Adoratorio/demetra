import { LRUCache } from 'lru-cache';
import { DemetraError } from './errors.ts';
import { isWpData, isWpFile, validateUrl } from './validators.ts';
import {
  SEND_MODES,
  type DemetraOptions,
  type DemetraRequestLanguagesOptions,
  type DemetraRequestSiteMapOptions,
  type DemetraRequestArchiveOptions,
  type DemetraRequestExtraOptions,
  type DemetraRequestMenuOptions,
  type DemetraRequestPageOptions,
  type DemetraRequestChildrenOptions,
  type DemetraRequestTaxonomyOptions,
  type DemetraRequestAttachmentsOptions,
  type DemetraRequestBaseOptions,
  type RequestId,
  type WpData,
  type WpFile,
} from './types.ts';
import {
  DemetraQueue,
  DemetraRequestLanguages,
  DemetraRequestSiteMap,
  DemetraRequestPage,
  DemetraRequestChildren,
  DemetraRequestArchive,
  DemetraRequestExtra,
  DemetraRequestMenu,
  DemetraRequestTaxonomy,
  DemetraRequestSend,
  DemetraRequestSubscribe,
  DemetraRequestAttachments,
  type AnyDemetraRequest,
} from './Requests/index.ts';

const HTTP_ERROR = 400;
const HTTP_NOT_MODIFIED = 304;

class Demetra {
  public static readonly SEND_MODES: typeof SEND_MODES = SEND_MODES;

  readonly #cache: LRUCache<string, WpData>;
  public readonly queue: DemetraQueue;
  readonly #options: DemetraOptions;
  // Whether the upload endpoint was derived from the endpoint (and follows it)
  #derivedUploadEndpoint = false;

  constructor(options: Partial<DemetraOptions> = {}) {
    const defaults: DemetraOptions = {
      endpoint: '',
      uploadEndpoint: '',
      site: 'default',
      lang: 'en',
      debug: false,
      throwOnError: true,
      timeout: 0,
      fetchOptions: {},
      version: 2,
      cacheMaxAge: 1000 * 60 * 60,
      maxItems: 500,
    };

    this.#options = { ...defaults, ...options };
    this.queue = new DemetraQueue();
    this.#cache = new LRUCache({ max: this.#options.maxItems, ttl: this.#options.cacheMaxAge });

    if (this.#options.endpoint.length <= 0 || !validateUrl(this.#options.endpoint)) {
      throw new Error('[Demetra] Invalid endpoint');
    }

    if (this.#options.endpoint.startsWith('/') && typeof window === 'undefined') {
      this.#debugWarn('A relative endpoint cannot be fetched outside of a browser environment');
    }

    if (this.#options.uploadEndpoint.length <= 0) {
      this.#deriveUploadEndpoint();
    }
  }

  #deriveUploadEndpoint(): void {
    this.#options.uploadEndpoint = this.#options.endpoint.replace('/api.php', '/upload.php');
    this.#derivedUploadEndpoint = true;
  }

  // Cache entries belong to the endpoint they were fetched from: a response
  // arriving after an endpoint switch is stored under the old key
  #cacheKey(request: AnyDemetraRequest, endpoint = this.#options.endpoint): string {
    return `${endpoint}#${request.hash}`;
  }

  #debugWarn(message: string): void {
    if (this.#options.debug) {
      console.warn(`[Demetra] ${message}`);
    }
  }

  #debugLog(response: WpData): void {
    if (this.#options.debug) {
      console.log('[Demetra]', response);
    }
  }

  public async fetchQueue(sendMode: SEND_MODES = SEND_MODES.ONCE): Promise<WpData[]> {
    // Snapshot and clear right away: requests queued while this batch is in
    // flight belong to the next one
    const requests = this.queue.requests.map((request) => this.#prepare(request));
    this.queue.clear();

    switch (sendMode) {
      case SEND_MODES.ONCE: {
        return this.#sendOnce(requests);
      }
      case SEND_MODES.SIMULTANEOUSLY: {
        return Promise.all(requests.map((request) => this.#fetch(request)));
      }
      case SEND_MODES.AWAIT: {
        return this.#sendSequentially(requests);
      }
      default: {
        throw new Error('[Demetra] Invalid SEND_MODES');
      }
    }
  }

  public async fetchLanguages<T = unknown>(
    site: string,
    options: Partial<DemetraRequestLanguagesOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestLanguages(site, options));
  }

  public async fetchSitemap<T = unknown>(
    site: string,
    options: Partial<DemetraRequestSiteMapOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestSiteMap(site, options));
  }

  public async fetchPage<T = unknown>(
    id: string | number,
    options: Partial<DemetraRequestPageOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestPage(id, options));
  }

  public async fetchChildren<T = unknown>(
    id: RequestId,
    options: Partial<DemetraRequestChildrenOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestChildren(id, options));
  }

  public async fetchArchive<T = unknown>(
    id: string,
    options: Partial<DemetraRequestArchiveOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestArchive(id, options));
  }

  public async fetchExtra<T = unknown>(
    id: string,
    options: Partial<DemetraRequestExtraOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestExtra(id, options));
  }

  public async fetchMenu<T = unknown>(
    id: string,
    options: Partial<DemetraRequestMenuOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestMenu(id, options));
  }

  public async fetchTaxonomy<T = unknown>(
    id: string | string[],
    options: Partial<DemetraRequestTaxonomyOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestTaxonomy(id, options));
  }

  public async fetchAttachments<T = unknown>(
    site: string,
    options: Partial<DemetraRequestAttachmentsOptions> = {},
  ): Promise<WpData<T>> {
    return this.#fetch<T>(new DemetraRequestAttachments(site, options));
  }

  public async subscribe(email: string, options: DemetraRequestBaseOptions = {}): Promise<WpData> {
    return this.#fetch(new DemetraRequestSubscribe(email, options));
  }

  public async subscribeWithAdditionalData(
    email: string,
    data: Map<string, string> | Record<string, string>,
    options: DemetraRequestBaseOptions = {},
  ): Promise<WpData> {
    return this.#fetch(new DemetraRequestSubscribe(email, { ...options, data }));
  }

  public async send(
    id: number,
    recipients: string,
    data: object,
    files?: File[],
    options: DemetraRequestBaseOptions = {},
  ): Promise<WpData> {
    const urls: { path: string; url: string }[] = [];

    if (files && files.length > 0) {
      const uploadResponses = await this.upload(files);
      uploadResponses.forEach((requestResponses) => {
        requestResponses.forEach((file) => {
          if (typeof file !== 'object' || file === null) {
            throw new Error('[Demetra] Invalid upload response. It must be an object');
          }
          urls.push(file.data);
        });
      });
    }

    return this.#fetch(new DemetraRequestSend(id, { ...options, recipients, data, urls }));
  }

  public async upload(files: File[] | File): Promise<WpFile[][]> {
    const list = Array.isArray(files) ? files : [files];
    const { fetchOptions, uploadEndpoint } = this.#options;

    // Keep the configured headers (auth, ...) but let the runtime set the
    // multipart Content-Type with its boundary
    const headers = new Headers(fetchOptions.headers);
    headers.delete('Content-Type');

    const responses = await Promise.all(
      list.map((file) => {
        const body = new FormData();
        body.append('file', file);
        return fetch(uploadEndpoint, {
          ...fetchOptions,
          ...this.#signal(),
          method: 'POST',
          headers,
          body,
        });
      }),
    );

    return Promise.all(
      responses.map(async (response) => {
        if (!response.ok) {
          throw new Error(`[Demetra] Upload failed: ${response.status} ${response.statusText}`);
        }
        const json = (await response.json()) as unknown;
        if (!Array.isArray(json) || !json.every(isWpFile)) {
          throw new Error('[Demetra] Unexpected upload response: expected a list of files');
        }
        return json;
      }),
    );
  }

  // Fill in the instance defaults the request does not set itself
  #prepare<R extends AnyDemetraRequest>(request: R): R {
    const { lang, site, version } = this.#options;
    request.applyDefaults({ lang, site, version });
    return request;
  }

  #signal(): { signal?: AbortSignal } {
    const { timeout, fetchOptions } = this.#options;
    const signals: AbortSignal[] = [];
    if (fetchOptions.signal) {
      signals.push(fetchOptions.signal);
    }
    if (timeout > 0) {
      signals.push(AbortSignal.timeout(timeout));
    }
    const [first] = signals;
    if (typeof first === 'undefined') {
      return {};
    }
    return { signal: signals.length === 1 ? first : AbortSignal.any(signals) };
  }

  // One POST carrying any number of requests; the API answers with one entry per request
  async #post(requests: AnyDemetraRequest[]): Promise<WpData[]> {
    const { endpoint, fetchOptions } = this.#options;
    const headers = new Headers(fetchOptions.headers);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(endpoint, {
      ...fetchOptions,
      ...this.#signal(),
      method: 'POST',
      headers,
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      throw new Error(`[Demetra] HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as unknown;
    if (!Array.isArray(json) || json.length !== requests.length) {
      throw new Error('[Demetra] Unexpected response: expected one entry per request');
    }
    if (!json.every(isWpData)) {
      throw new Error('[Demetra] Unexpected response: every entry must carry a status and data');
    }
    return json;
  }

  async #fetch<T = unknown>(request: AnyDemetraRequest): Promise<WpData<T>> {
    this.#prepare(request);

    const cached = this.#fromCache(request);
    if (cached) {
      return cached as WpData<T>;
    }

    const { endpoint } = this.#options;
    const [result] = await this.#post([request]);
    if (typeof result === 'undefined') {
      throw new Error('[Demetra] Empty response from API');
    }

    this.#store(request, result, endpoint);
    this.#debugLog(result);
    this.#handleError(result);

    return result as WpData<T>;
  }

  async #sendOnce(requests: AnyDemetraRequest[]): Promise<WpData[]> {
    const results: (WpData | undefined)[] = Array.from({ length: requests.length });
    const pending: { index: number; request: AnyDemetraRequest }[] = [];

    requests.forEach((request, index) => {
      const cached = this.#fromCache(request);
      if (cached) {
        results[index] = cached;
      } else {
        pending.push({ index, request });
      }
    });

    // Skip the network round-trip entirely when everything was served from cache
    if (pending.length > 0) {
      const { endpoint } = this.#options;
      const responses = await this.#post(pending.map((entry) => entry.request));
      pending.forEach(({ index, request }, position) => {
        const response = responses[position];
        if (typeof response === 'undefined') {
          throw new Error('[Demetra] Empty response from API');
        }
        this.#store(request, response, endpoint);
        results[index] = response;
      });
    }

    const responses = results.filter((result): result is WpData => typeof result !== 'undefined');
    responses.forEach((response) => {
      this.#debugLog(response);
      this.#handleError(response);
    });

    return responses;
  }

  async #sendSequentially(requests: AnyDemetraRequest[]): Promise<WpData[]> {
    const responses: WpData[] = [];

    for (const request of requests) {
      // AWAIT mode is sequential by design (see SIMULTANEOUSLY for the parallel
      // variant): each request must resolve before the next starts, so awaiting in the
      // loop is intentional, not a missed Promise.all.
      // eslint-disable-next-line no-await-in-loop
      responses.push(await this.#fetch(request));
    }

    return responses;
  }

  #isLocallyCacheable(request: AnyDemetraRequest): boolean {
    return 'localCache' in request && request.localCache;
  }

  #fromCache(request: AnyDemetraRequest): WpData | undefined {
    if (!this.#isLocallyCacheable(request)) {
      return undefined;
    }
    const cached = this.#cache.get(this.#cacheKey(request));
    return cached ? this.#parseFromLocalCache(cached) : undefined;
  }

  // Error responses are never cached
  #store(request: AnyDemetraRequest, response: WpData, endpoint: string): void {
    if (this.#isLocallyCacheable(request) && response.status.code < HTTP_ERROR) {
      this.#cache.set(this.#cacheKey(request, endpoint), structuredClone(response));
    }
  }

  #handleError(response: WpData): void {
    if (response.status.code < HTTP_ERROR) {
      return;
    }
    if (this.#options.throwOnError) {
      throw new DemetraError(response);
    }
    this.#debugWarn(`${response.status.code} - ${response.status.message}`);
  }

  #parseFromLocalCache(cached: WpData): WpData {
    const cloned = structuredClone(cached);
    cloned.status.code = HTTP_NOT_MODIFIED;
    cloned.status.message = 'Data loaded from local cache';
    cloned.status.cache = true;
    return cloned;
  }

  public clearCache(): void {
    this.#cache.clear();
  }

  // Getters and setters
  public get endpoint(): string {
    return this.#options.endpoint;
  }

  // Switching endpoint keeps the cache isolated per endpoint (see #cacheKey)
  // and follows with the upload endpoint only when it was derived
  public set endpoint(url: string) {
    if (!validateUrl(url)) {
      throw new Error('[Demetra] Invalid endpoint');
    }
    this.#options.endpoint = url;
    if (this.#derivedUploadEndpoint) {
      this.#deriveUploadEndpoint();
    }
  }

  public get uploadEndpoint(): string {
    return this.#options.uploadEndpoint;
  }

  public set uploadEndpoint(url: string) {
    this.#options.uploadEndpoint = url;
    this.#derivedUploadEndpoint = false;
  }

  public get lang(): string {
    return this.#options.lang;
  }

  public set lang(lang: string) {
    this.#options.lang = lang;
  }

  public get site(): string {
    return this.#options.site;
  }

  public set site(site: string) {
    this.#options.site = site;
  }
}

export { DemetraError } from './errors.ts';
export { SEND_MODES, WP_MODES } from './types.ts';
export type {
  Cache,
  DemetraFetchOptions,
  DemetraOptions,
  DemetraRequestArchiveOptions,
  DemetraRequestAttachmentsOptions,
  DemetraRequestBaseOptions,
  DemetraRequestChildrenOptions,
  DemetraRequestExtraOptions,
  DemetraRequestGlobalOptions,
  DemetraRequestLanguagesOptions,
  DemetraRequestMenuOptions,
  DemetraRequestPageOptions,
  DemetraRequestSiteMapOptions,
  DemetraRequestTaxonomyOptions,
  FetchArchiveOptions,
  FetchAttachmentsOptions,
  FetchChildrenOptions,
  FetchExtraOptions,
  FetchLanguagesOptions,
  FetchMenuOptions,
  FetchPageOptions,
  FetchSendOptions,
  FetchSitemapOptions,
  FetchSubscribeOptions,
  FetchTaxonomyOptions,
  Filter,
  Lang,
  Pagination,
  RequestId,
  Siblings,
  Taxonomy,
  WpData,
  WpFile,
} from './types.ts';
export {
  DemetraQueue,
  DemetraRequest,
  DemetraRequestPage,
  DemetraRequestChildren,
  DemetraRequestArchive,
  DemetraRequestMenu,
  DemetraRequestExtra,
  DemetraRequestTaxonomy,
  DemetraRequestSiteMap,
  DemetraRequestLanguages,
  DemetraRequestAttachments,
  DemetraRequestSend,
  DemetraRequestSubscribe,
  type AnyDemetraRequest,
} from './Requests/index.ts';

export default Demetra;
