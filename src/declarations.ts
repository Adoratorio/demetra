export interface DemetraOptions {
  endpoint : string,
  url : string,
  version : number | undefined,
  project : string,
  site : string | undefined,
  lang : string | undefined,
  debug: boolean | undefined,
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
  fields : Array<String> | undefined,
  next : boolean | undefined,
  prev : boolean | undefined,
  loop : boolean | undefined,
}

export interface Header {
  url : string,
  version : number,
  project : string,
}

export interface Page {
  type : string,
  id : string | number,
  siblings : Siblings | undefined,
}

export interface Menu {
  id : string | number,
}

export interface Archive {
  type : string,
  fields : Array<string> | undefined,
  filters : Array<Filter> | undefined,
  pagination : Pagination | undefined,
}

export interface Request {
  header : Header | undefined,
  lang : string,
  site : string,
  page : Page | null | undefined,
  menu : Menu | null | undefined,
  archive : Archive | null | undefined,
}