import { DemetraRequestOptions } from './declarations';
import DEFAULTS from './defaults';
import MODES from './modes'
import { isUndefined } from './validators';

import { serialize } from 'object-to-formdata';

class DemetraRequest {
  public readonly options : DemetraRequestOptions;
  public static addConfig(data : FormData) : RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: data,
    }
  }

  constructor(mode : string, id : number | string, options? : Partial<DemetraRequestOptions>) {
    this.options = { ...DEFAULTS.get(mode), ...options };
    this.options.id = id;
    this.options.mode = mode

    this.validate();

  }

  private validate() : void {
    if (isUndefined(this.options.mode)) {
      throw new Error('Missing mode');
    }

    if (MODES.hasOwnProperty(this.options.mode)) {
      throw new Error('Invalid mode');
    }

    if (isUndefined(this.options.id)) {
      throw new Error('Missing id');
    }
  }

  public get data() : FormData {
    return serialize(
      this.options,
    );
  }

  public get config() : RequestInit {
    return {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: this.data,
    }
  }
}

export default DemetraRequest;
