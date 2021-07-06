/** Enum for Request (action) codes. Not to be confused with NR Action codes. */
export enum RequestCode {
  NEW = 'NEW', // new request
  MVE = 'MVE', // move request
  REH = 'REH', // restore or reinstate request
  AML = 'AML', // amalgamate request
  CHG = 'CHG', // change name request
  CNV = 'CNV', // conversion request
  DBA = 'DBA', // doing business as request
  ASSUMED = 'ASSUMED', // assumed name request
  REN = 'REN', // restore with new name request
  INFO = 'INFO', // special value for sub-menu
  REST = 'REST', // TODO: possibly typo - same as RESTORE?
}
