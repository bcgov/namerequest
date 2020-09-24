import { RequestActionMappingI } from '@/models'

let entityTypesBC = ['FR', 'DBA', 'CR', 'UL', 'GP', 'LP', 'LL', 'CP', 'BC', 'CC', 'SO', 'PA', 'FI', 'PAR']

// maps request_action_cd (key) to array of allowable entities (value)
// { [request_action_cd]: Array<entity_type_cd> }
export const bcMapping: RequestActionMappingI = {
  AML: ['UL', 'CR', 'CC', 'CP', 'BC'],
  REN: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC'],
  REH: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC'],
  CHG: entityTypesBC.filter(ent => ent !== 'PAR' && ent !== 'PA'),
  MVE: ['CR', 'CC', 'CP', 'UL', 'SO', 'BC']
}

export const xproMapping: RequestActionMappingI = {
  ASSUMED: ['XCR', 'RLC', 'XUL'],
  REN: ['XCR', 'XCP', 'RLC', 'XUL'],
  REH: ['XCR', 'XCP', 'RLC', 'XUL'],
  AML: ['XCR', 'XCP', 'XUL']
}

export const $colinRequestActions = ['AML', 'CHG', 'REH', 'REN']
