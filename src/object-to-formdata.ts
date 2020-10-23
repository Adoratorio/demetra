/* eslint-disable */
import { SerializeOptions } from './declarations';
import {
  isUndefined,
  isNull,
  isBoolean,
  isObject,
  isArray,
  isDate,
  isBlob,
  isFile
} from './validators'

const serialize = (obj : Record<string, any> = {}, cfg : SerializeOptions = {}, fd : FormData | undefined = new FormData(), pre  = '') : FormData => {
  cfg.indices = isUndefined(cfg.indices) ? false : cfg.indices;

  cfg.nullsAsUndefineds = isUndefined(cfg.nullsAsUndefineds)
    ? false
    : cfg.nullsAsUndefineds;

  cfg.booleansAsIntegers = isUndefined(cfg.booleansAsIntegers)
    ? false
    : cfg.booleansAsIntegers;

  cfg.allowEmptyArrays = isUndefined(cfg.allowEmptyArrays)
    ? false
    : cfg.allowEmptyArrays;


  if (isUndefined(obj)) {
    return fd;
  }
  if (isNull(obj)) {
    if (!cfg.nullsAsUndefineds) {
      fd.append(pre, '');
    }
  } else if (isBoolean(obj)) {
    if (cfg.booleansAsIntegers) {
      fd.append(pre, obj ? '1' : '0');
    } else {
      fd.append(pre, obj ? 'true' : 'false');
    }
  } else if (Array.isArray(obj)) {
    if (obj.length) {
      obj.forEach((value : any, index : number) => {
        const key = `${pre  }[${  cfg.indices ? index : ''  }]`;

        serialize(value, cfg, fd, key);
      });
    } else if (cfg.allowEmptyArrays) {
      fd.append(`${pre  }[]`, '');
    }
  } else if (obj instanceof Date) {
    fd.append(pre, obj.toISOString());
  } else if (isObject(obj) && !isFile(obj) && !isBlob(obj)) {
    Object.keys(obj).forEach((prop) => {
      const value = obj[prop];

      if (isArray(value)) {
        while (prop.length > 2 && prop.lastIndexOf('[]') === prop.length - 2) {
          prop = prop.substring(0, prop.length - 2);
        }
      }

      const key = pre ? `${pre  }[${  prop  }]` : prop;

      serialize(value, cfg, fd, key);
    });
  } else {
    // @ts-ignore
    fd.append(pre, obj);
  }

  return fd;
};

export default serialize
