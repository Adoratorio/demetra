import md5 from 'md5';

import serialize from './object-to-formdata';
import { isUndefined } from './validators';
import { DemetraRequestOptions, FetchOptions } from './declarations';
import { FETCH_OPTIONS, WP_MODES } from './defaults';

class DemetraRequest {
  public readonly options: DemetraRequestOptions;

  public static addConfig(data: FormData): RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      body: data,
    };
  }

  public static serialize(options : DemetraRequestOptions[] | File | FileList): FormData {
    return serialize(options, { indices: true }, undefined, 'requests') as unknown as FormData;
  }

  constructor(mode : WP_MODES, id: number | string, options?: Partial<FetchOptions>) {
    this.options = { ...FETCH_OPTIONS.get(mode), ...options };
    this.options.id = id;
    this.options.mode = mode;

    this.validate();
  }

  private validate(): void {
    if (isUndefined(this.options.mode)) {
      throw new Error('Missing mode');
    }

    if (isUndefined(this.options.id)) {
      throw new Error('Missing id');
    }
  }

  public get localCache(): boolean {
    return this.options.localCache || false;
  }

  public get key(): string {
    return md5(JSON.stringify(this.options));
  }

  public get data(): FormData {
    if (Array.isArray(this.options)) {
      return DemetraRequest.serialize(this.options)
    }

    return DemetraRequest.serialize([this.options])
  }

  public get config(): RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      body: this.data,
    };
  }
}

export default DemetraRequest;
