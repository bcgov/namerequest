import { EntityTypes, NrRequestActionCodes } from '@/enums'
import { RequestActionMappingI, MappingI } from '@/interfaces'

const EntityTypesBC = [
  EntityTypes.FR,
  EntityTypes.DBA,
  EntityTypes.CR,
  EntityTypes.UL,
  EntityTypes.GP,
  EntityTypes.LP,
  EntityTypes.LL,
  EntityTypes.CP,
  EntityTypes.BC,
  EntityTypes.CC,
  EntityTypes.SO,
  EntityTypes.PA,
  EntityTypes.FI,
  EntityTypes.PAR
]

// maps request_action_cd (key) to array of allowable entities (value)
// { [request_action_cd]: entity_type_cd[] }
export const BcMapping: RequestActionMappingI = {
  AML: [
    EntityTypes.CR,
    EntityTypes.UL,
    EntityTypes.CC,
    EntityTypes.CP,
    EntityTypes.BC,
    EntityTypes.SO
  ],
  REN: [
    EntityTypes.CR,
    EntityTypes.CP,
    EntityTypes.CC,
    EntityTypes.UL,
    EntityTypes.FI,
    EntityTypes.BC,
    EntityTypes.SO
  ],
  REH: [
    EntityTypes.CR,
    EntityTypes.CP,
    EntityTypes.CC,
    EntityTypes.UL,
    EntityTypes.FI,
    EntityTypes.BC,
    EntityTypes.SO
  ],
  // every entity type except Parishes and Private Act
  CHG: EntityTypesBC.filter(ent => ent !== EntityTypes.PAR && ent !== EntityTypes.PA),
  MVE: [
    EntityTypes.CR,
    EntityTypes.CC,
    EntityTypes.CP,
    EntityTypes.UL,
    EntityTypes.SO,
    EntityTypes.BC
  ]
}

export const XproMapping: MappingI = {
  AML: [
    EntityTypes.XCR,
    EntityTypes.XCP
  ],
  ASSUMED: [
    EntityTypes.XCR,
    EntityTypes.RLC
  ],
  REN: [
    EntityTypes.XCR,
    EntityTypes.XCP,
    EntityTypes.RLC
  ],
  REH: [
    EntityTypes.A,
    EntityTypes.LLC,
    EntityTypes.XCP,
    EntityTypes.XS
  ],
  CHG: [
    EntityTypes.A,
    EntityTypes.XP,
    EntityTypes.XL,
    EntityTypes.LLC,
    EntityTypes.XCP,
    EntityTypes.XS
  ]
}

/** Request actions that require business lookup. */
export const BusinessLookupRequestActions = [
  NrRequestActionCodes.CHANGE_NAME,
  NrRequestActionCodes.CONVERSION,
  NrRequestActionCodes.RESTORE
]

/** Entity types that require business lookup. */
export const BusinessLookupEntityTypes = [
  EntityTypes.BC,
  EntityTypes.CC,
  EntityTypes.CR,
  EntityTypes.UL,
  EntityTypes.XCR,
  EntityTypes.XUL
]

/** Entity types that support the numbered company option. */
export const NumberedEntityTypes = [
  EntityTypes.BC,
  EntityTypes.CC,
  EntityTypes.CR,
  EntityTypes.UL,
  EntityTypes.C
]
