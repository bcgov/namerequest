// { [request_action_cd]: Array<entity_type_cd> }
import { RequestActionMappingI } from '@/models'
export const bcMapping: RequestActionMappingI = {
  AML: ['UL', 'CR', 'CC', 'CP', 'BC'],
  REN: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC'],
  REH: ['CR', 'CP', 'CC', 'UL', 'FI', 'BC']
}

export const xproMapping: RequestActionMappingI = {
  ASSUMED: ['XCR', 'RLC', 'XUL'],
  REN: ['XCR', 'XCP', 'RLC', 'XUL'],
  REH: ['XCR', 'XCP', 'RLC', 'XUL']
}
