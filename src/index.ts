import { LRUCache } from 'lru-cache';
import { validateUrl } from './validators.ts';
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

class Demetra {
  public static readonly SEND_MODES: typeof SEND_MODES = SEND_MODES;

  readonly #cache: LRUCache<string, WpData>;
  public readonly queue: DemetraQueue;
  readonly #options: DemetraOptions;

  constructor(options: Partial<DemetraOptions> = {}) {
    const defaults: DemetraOptions = {
      endpoint: '',
      uploadEndpoint: '',
      site: 'default',
      lang: 'en',
      debug: false,
      version: 2,
      cacheMaxAge: 1000 * 60 * 60,
      maxItems: 500,
    };

    this.#options = { ...defaults, ...options };
    this.queue = new DemetraQueue();
    this.#cache = new LRUCache({ max: this.#options.maxItems, ttl: this.#options.cacheMaxAge });

    if (this.#options.endpoint.length <= 0 || !validateUrl(this.#options.endpoint)) {
      throw new Error('Invalid endpoint');
    }

    if (this.#options.uploadEndpoint.length <= 0) {
      this.#options.uploadEndpoint = this.#options.endpoint.replace('/api.php', '/upload.php');
    }
  }

  public async fetchQueue(sendModes: SEND_MODES = SEND_MODES.ONCE): Promise<object[]> {
    if (
      sendModes !== SEND_MODES.ONCE &&
      sendModes !== SEND_MODES.SIMULTANEOUSLY &&
      sendModes !== SEND_MODES.AWAIT
    ) {
      throw new Error('Invalid SEND_MODES');
    }

    let response = undefined;

    if (sendModes === SEND_MODES.ONCE) {
      response = this.#sendOnce();
    }
    if (sendModes === SEND_MODES.SIMULTANEOUSLY) {
      response = this.#sendSimultaneously();
    }
    if (sendModes === SEND_MODES.AWAIT) {
      response = this.#sendConsequentially();
    }

    try {
      return (await response) || [];
    } finally {
      this.queue.clear();
    }
  }

  public async fetchLanguages<T = unknown>(
    site: string,
    options?: Partial<DemetraRequestLanguagesOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestLanguages(
      site,
      options,
      options?.lang || this.#options.lang,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchSitemap<T = unknown>(
    site: string,
    options?: Partial<DemetraRequestSiteMapOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestSiteMap(
      site,
      options,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchPage<T = unknown>(
    id: string | number,
    options?: Partial<DemetraRequestPageOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestPage(
      id,
      options,
      options?.lang || this.#options.lang,
      options?.site || this.#options.site,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchChildren<T = unknown>(
    id: number | number[] | string | string[],
    options?: Partial<DemetraRequestChildrenOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestChildren(
      id,
      options,
      options?.lang || this.#options.lang,
      options?.site || this.#options.site,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchArchive<T = unknown>(
    id: string,
    options?: Partial<DemetraRequestArchiveOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestArchive(
      id,
      options,
      options?.lang || this.#options.lang,
      options?.site || this.#options.site,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchExtra<T = unknown>(
    id: string,
    options?: Partial<DemetraRequestExtraOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestExtra(
      id,
      options,
      options?.lang || this.#options.lang,
      options?.site || this.#options.site,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchMenu<T = unknown>(
    id: string,
    options?: Partial<DemetraRequestMenuOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestMenu(
      id,
      options,
      options?.lang || this.#options.lang,
      options?.site || this.#options.site,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchTaxonomy<T = unknown>(
    id: string | string[],
    options?: Partial<DemetraRequestTaxonomyOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestTaxonomy(
      id,
      options,
      options?.lang || this.#options.lang,
      options?.site || this.#options.site,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async fetchAttachments<T = unknown>(
    site: string,
    options?: Partial<DemetraRequestAttachmentsOptions>,
  ): Promise<WpData<T>> {
    const params = new DemetraRequestAttachments(
      site,
      options,
      options?.version || this.#options.version,
    );

    return this.#fetch<T>(params);
  }

  public async subscribe(email: string, lang?: string, site?: string): Promise<WpData> {
    const params = new DemetraRequestSubscribe(
      email,
      null,
      lang || this.#options.lang,
      site || this.#options.site,
      this.#options.version,
    );

    return this.#fetch(params);
  }

  public async subscribeWithAdditionalData(
    email: string,
    data: Map<string, string>,
    lang?: string,
    site?: string,
  ): Promise<WpData> {
    const params = new DemetraRequestSubscribe(
      email,
      data,
      lang || this.#options.lang,
      site || this.#options.site,
      this.#options.version,
    );

    return this.#fetch(params);
  }

  public async send(id: number, recipients: string, data: object, files?: File[]): Promise<WpData> {
    const urls: { path: string; url: string }[] = [];

    if (files && files.length > 0) {
      const uploadResponses: WpFile[][] = await this.upload(files);
      uploadResponses.forEach((requestResponses) => {
        requestResponses.forEach((file) => {
          if (typeof file !== 'object') {
            throw new Error('Invalid response. It must be an object');
          }
          urls.push(file.data);
        });
      });
    }

    const params = new DemetraRequestSend(
      id,
      recipients,
      data,
      urls,
      this.#options.lang,
      this.#options.site,
      this.#options.version,
    );

    return this.#fetch(params);
  }

  async #fetch<T = unknown>(params: AnyDemetraRequest): Promise<WpData<T>> {
    const hasLocalCache = 'localCache' in params && params.localCache;

    // Check local cache
    if (hasLocalCache && this.#cache.has(params.hash)) {
      const cached = this.#cache.get(params.hash);
      if (typeof cached === 'undefined') {
        throw new Error('Unexpected empty cache entry');
      }
      return this.#parseFromLocalCache(cached) as WpData<T>;
    }

    const requests = [params];
    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(this.#options.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = (await response.json()) as WpData<T>[];

    json.forEach((res) => {
      this.#debugLog(res);
      this.#handleError(res);
    });

    const [result] = json;

    if (typeof result === 'undefined') {
      throw new Error('Empty response from API');
    }

    if (hasLocalCache) {
      this.#cache.set(params.hash, structuredClone(result));
    }

    return result;
  }

  public async upload(files: File[] | File): Promise<WpFile[][]> {
    if (typeof this.#options.uploadEndpoint === 'undefined') {
      throw new Error('No upload endpoint defined');
    }

    files = Array.isArray(files) ? files : [files];

    const responses: Promise<Response>[] = files.map((file) => {
      const formData = new FormData();
      formData.append('file', file);
      const request = new Request(this.#options.uploadEndpoint, { method: 'POST', body: formData });
      return fetch(request);
    });

    const promisesResponses = await Promise.all(responses);
    const jsons: Promise<WpFile[]>[] = promisesResponses.map((response) => {
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      return response.json();
    });

    return Promise.all(jsons);
  }

  async #sendOnce(): Promise<object[]> {
    const cachedDates: { index: number; data: WpData }[] = [];
    const uncachedRequests: AnyDemetraRequest[] = [];

    this.queue.requests.forEach((request, index) => {
      if ('localCache' in request && request.localCache && this.#cache.has(request.hash)) {
        const cached = this.#cache.get(request.hash);
        if (typeof cached === 'undefined') {
          throw new Error('Unexpected empty cache entry');
        }
        cachedDates.push({ index, data: this.#parseFromLocalCache(cached) });
      } else {
        uncachedRequests.push(request);
      }
    });

    const headers = {
      'Content-Type': 'application/json',
    };

    let responses: WpData[] = [];

    // Skip the network round-trip entirely when everything was served from cache
    if (uncachedRequests.length > 0) {
      const response = await fetch(this.#options.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ requests: uncachedRequests }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      responses = (await response.json()) as WpData[];

      uncachedRequests.forEach((request, index) => {
        if ('localCache' in request && request.localCache) {
          this.#cache.set(request.hash, structuredClone(responses[index]));
        }
      });
    }

    // Merge cached data with fetch data in the original index
    cachedDates.forEach((cachedData) => {
      responses.splice(cachedData.index, 0, cachedData.data);
    });

    responses.forEach((res) => {
      this.#debugLog(res);
      this.#handleError(res);
    });

    return responses;
  }

  async #sendSimultaneously(): Promise<WpData[]> {
    const promises: Promise<WpData>[] = this.queue.requests.map((request) => this.#fetch(request));
    return Promise.all(promises);
  }

  async #sendConsequentially(): Promise<WpData[]> {
    const requests = [...this.queue.requests];
    const responses: WpData[] = [];

    for (const request of requests) {
      // AWAIT mode is sequential by design (see #sendSimultaneously for the parallel
      // variant): each request must resolve before the next starts, so awaiting in the
      // loop is intentional, not a missed Promise.all.
      // eslint-disable-next-line no-await-in-loop
      responses.push(await this.#fetch(request));
    }

    return responses;
  }

  #debugLog(response: WpData): void {
    if (this.#options.debug) {
      console.log(response);
    }
  }

  #handleError(response: WpData): void {
    if (response.status.code >= 400) {
      if (!this.#options.debug) {
        console.warn(`${response.status.code} - ${response.status.message}`);
      } else {
        throw new Error(`${response.status.code} - ${response.status.message}`);
      }
    }
  }

  #parseFromLocalCache(cached: WpData): WpData {
    const cloned = structuredClone(cached);
    cloned.status.code = 304;
    cloned.status.message = 'Data loaded from local cache';
    cloned.status.cache = true;
    return cloned;
  }

  // Getters and setters
  public get endpoint(): string {
    return this.#options.endpoint;
  }

  public set endpoint(url: string) {
    this.#options.endpoint = url;
  }

  public get uploadEndpoint(): string {
    return this.#options.uploadEndpoint;
  }

  public set uploadEndpoint(url: string) {
    this.#options.uploadEndpoint = url;
  }

  public get lang(): string {
    return this.#options.lang;
  }

  public set lang(lang: string) {
    this.#options.lang = lang;
  }
}

export { SEND_MODES, WP_MODES } from './types.ts';
export type {
  Cache,
  DemetraOptions,
  DemetraRequestArchiveOptions,
  DemetraRequestAttachmentsOptions,
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
  FetchSitemapOptions,
  FetchTaxonomyOptions,
  Filter,
  Lang,
  Pagination,
  Siblings,
  WpData,
  WpFile,
} from './types.ts';
export {
  DemetraRequestPage,
  DemetraRequestChildren,
  DemetraRequestArchive,
  DemetraRequestMenu,
  DemetraRequestExtra,
  DemetraRequestTaxonomy,
  DemetraRequestSiteMap,
  DemetraRequestLanguages,
  DemetraRequestAttachments,
} from './Requests/index.ts';

export default Demetra;
