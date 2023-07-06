import { EntityType } from '@/enums'

export interface MappingI {
  ASSUMED: EntityType[]
  [propName: string]: EntityType[] // misc properties that are arrays of entity types
}
