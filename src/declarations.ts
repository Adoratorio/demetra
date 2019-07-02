export interface DemetraOptions {
  endpoint : string,
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

export interface Siblings {
  fields : Array<String>,
  next : boolean,
  prev : boolean,
  loop : boolean,
}

export interface Header {
  url : string,
  version : number,
  project : string,
}

export interface Page {
  type : string,
  id : string | number,
  siblings : Siblings,
}

export interface Menu {
  id : string | number,
}

export interface Archive {
  type : string,
  fields : Array<string>,
  filters : Array<Filter>,
  pagination : Pagination,
}

export interface Request {
  header : Header | null,
  lang : string,
  site : string,
  page : Page | null,
  menu : Menu | null,
  archive : Archive | null,
}