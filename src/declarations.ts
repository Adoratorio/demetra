export interface DemetraOptions {
  url : string,
  version : number,
  project : string,
  site : string,
  lang : string,
  debug: boolean,
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