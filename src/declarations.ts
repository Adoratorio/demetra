export interface DemetraOptions {
  endpoint? : string,
  uploadEndpoint? : string,
  site : string,
  lang : string,
  debug : boolean,
}

export interface DemetraRequestOptions {
  id: string | number,
  mode: string,
  type? : string,
  lang? : string,
  i18n?: boolean,
  siblings? : Siblings,
  fields? : Array<string>,
  filters? : Array<Filter>,
  pagination? : Pagination,
  wpCache? : boolean,
  localCache? : boolean,
  recipients? : string,
  attachments? : Array<string>
}

export interface Pagination {
  start : number ,
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
