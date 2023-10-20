import { EntityTypes, NrRequestActionCodes } from '@/enums'
import { RequestActionMappingI } from '@/interfaces'

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

export const XproMapping: RequestActionMappingI = {
  AML: [
    EntityTypes.XCP, // maps to Corp Type "XCP"
    EntityTypes.XCR // maps to Corp Type "XCR"
  ],
  ASSUMED: [
    EntityTypes.RLC, // maps to Corp Type "LLC"
    EntityTypes.XCR // maps to Corp Type "XCR"
  ],
  REN: [
    EntityTypes.RLC, // maps to Corp Type "LLC"
    EntityTypes.XCP, // maps to Corp Type "XCP"
    EntityTypes.XCR // maps to Corp Type "XCR"
  ],
  REH: [
    EntityTypes.RLC, // maps to Corp Type "LLC"
    EntityTypes.XCP, // maps to Corp Type "XCP"
    EntityTypes.XSO, // maps to Corp Type "XS"
    EntityTypes.XUL // maps to Corp Type "A"
  ],
  CHG: [
    EntityTypes.RLC, // maps to Corp Type "LLC"
    EntityTypes.XCP, // maps to Corp Type "XCP"
    EntityTypes.XLL, // maps to Corp Type "XL"
    EntityTypes.XLP, // maps to Corp Type "XP"
    EntityTypes.XSO, // maps to Corp Type "XS"
    EntityTypes.XUL // maps to Corp Type "A"
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
  EntityTypes.A,
  EntityTypes.BC, // Benefit Company
  EntityTypes.BEN, // invalid?
  EntityTypes.C,
  EntityTypes.CC,
  EntityTypes.CCC,
  EntityTypes.CUL,
  EntityTypes.CP,
  EntityTypes.CR, // BC Limited Company
  EntityTypes.FR, // Sole Proprietorship
  EntityTypes.GP,
  EntityTypes.LLC,
  EntityTypes.LP,
  EntityTypes.PA,
  EntityTypes.PAR,
  EntityTypes.SO,
  EntityTypes.UL,
  EntityTypes.XCP,
  EntityTypes.XCR,
  EntityTypes.XL,
  EntityTypes.XP,
  EntityTypes.XSO,
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
