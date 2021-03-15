import { RequestActionMappingI, MappingI } from '@/interfaces'

const entityTypesBC = ['FR', 'DBA', 'CR', 'UL', 'GP', 'LP', 'LL', 'CP', 'BC', 'CC', 'SO', 'PA', 'FI', 'PAR']

// maps request_action_cd (key) to array of allowable entities (value)
// { [request_action_cd]: entity_type_cd[] }
export const BcMapping: RequestActionMappingI = {
  AML: ['CR', 'UL', 'CC', 'CP', 'BC'],
  REN: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC'],
  REH: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC'],
  CHG: entityTypesBC.filter(ent => ent !== 'PAR' && ent !== 'PA'),
  MVE: ['CR', 'CC', 'CP', 'UL', 'SO', 'BC']
}

export const XproMapping: MappingI = {
  ASSUMED: ['XCR', 'RLC'],
  REN: ['XCR', 'XCP', 'RLC'],
  REH: ['XCR', 'XCP', 'RLC'],
  AML: ['XCR', 'XCP']
}

export const ColinRequestActions: string[] = ['AML', 'CHG', 'CNV', 'REH']

export const ColinRequestTypes: string[] = ['BC', 'CC', 'CR', 'UL']

export const XproColinRequestTypes: string[] = ['XCR', 'XUL']
