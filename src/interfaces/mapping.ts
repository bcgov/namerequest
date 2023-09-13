import { EntityTypes } from '@/enums'

export interface MappingI {
  ASSUMED: EntityTypes[]
  [propName: string]: EntityTypes[] // misc properties that are arrays of entity types
}
