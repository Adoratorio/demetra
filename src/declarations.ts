export interface DemetraOptions {
  lang : string,
  endpoint : string,
  uploadEndpoint? : string,
  version : number,
  site : string,
  debug : boolean,
  cache : boolean,
}

export interface Pagination {
  start : number,
  count : number,
}

export interface Filter {
  compare : string,
  key : string,
  value : string,
}

export interface Siblings {
  fields : Array<String>,
  next? : boolean,
  prev? : boolean,
  loop? : boolean,
}

export interface Request {
  mode : string,
  lang : string,
  version : string | number,
  site : string,
  id? : string | number,
  type? : string,
  i18n?: boolean,
  siblings? : Siblings,
  fields? : Array<string>,
  filters? : Array<Filter>,
  pagination? : Pagination,
  cache? : boolean,
  data? : string,
  email? : string,
  recipients? : string,
  attachments? : Array<string>
}