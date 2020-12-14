import { RequestActionMappingI } from '@/models'

const entityTypesBC = ['FR', 'DBA', 'CR', 'UL', 'GP', 'LP', 'LL', 'CP', 'BC', 'CC', 'SO', 'PA', 'FI', 'PAR']

// maps request_action_cd (key) to array of allowable entities (value)
// { [request_action_cd]: Array<entity_type_cd> }
export const bcMapping: RequestActionMappingI = {
  AML: ['CR', 'UL', 'CC', 'CP', 'BC'],
  REN: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC'],
  REH: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC'],
  CHG: entityTypesBC.filter(ent => ent !== 'PAR' && ent !== 'PA'),
  MVE: ['CR', 'CC', 'CP', 'UL', 'SO', 'BC']
}

export const xproMapping: RequestActionMappingI = {
  ASSUMED: ['XCR', 'RLC'],
  REN: ['XCR', 'XCP', 'RLC'],
  REH: ['XCR', 'XCP', 'RLC'],
  AML: ['XCR', 'XCP']
}

export const $colinRequestActions = ['AML', 'CHG', 'CNV', 'REH']
export const $colinRequestTypes = ['BC', 'CC', 'CR', 'UL']
export const $xproColinRequestTypes = ['XCR', 'XUL']
