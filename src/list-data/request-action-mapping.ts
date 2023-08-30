import { EntityType, NrRequestActionCodes } from '@/enums'
import { RequestActionMappingI, MappingI } from '@/interfaces'

const entityTypesBC = [
  EntityType.FR,
  EntityType.DBA,
  EntityType.CR,
  EntityType.UL,
  EntityType.GP,
  EntityType.LP,
  EntityType.LL,
  EntityType.CP,
  EntityType.BC,
  EntityType.CC,
  EntityType.SO,
  EntityType.PA,
  EntityType.FI,
  EntityType.PAR
]

// maps request_action_cd (key) to array of allowable entities (value)
// { [request_action_cd]: entity_type_cd[] }
export const BcMapping: RequestActionMappingI = {
  AML: [
    EntityType.CR,
    EntityType.UL,
    EntityType.CC,
    EntityType.CP,
    EntityType.BC,
    EntityType.SO
  ],
  REN: [
    EntityType.CR,
    EntityType.CP,
    EntityType.CC,
    EntityType.UL,
    EntityType.FI,
    EntityType.BC,
    EntityType.SO
  ],
  REH: [
    EntityType.CR,
    EntityType.CP,
    EntityType.CC,
    EntityType.UL,
    EntityType.FI,
    EntityType.BC,
    EntityType.SO
  ],
  CHG: entityTypesBC.filter(ent => ent !== EntityType.PAR && ent !== EntityType.PA),
  MVE: [
    EntityType.CR,
    EntityType.CC,
    EntityType.CP,
    EntityType.UL,
    EntityType.SO,
    EntityType.BC
  ]
}

export const XproMapping: MappingI = {
  ASSUMED: [
    EntityType.XCR,
    EntityType.RLC
  ],
  REN: [
    EntityType.XCR,
    EntityType.XCP,
    EntityType.RLC
  ],
  REH: [
    EntityType.XCR,
    EntityType.XCP,
    EntityType.RLC
  ]
}

// *** FUTURE: get rid of these when we remove getShowCorpNum()
export const ColinRequestActions = [
  NrRequestActionCodes.AMALGAMATE,
  NrRequestActionCodes.CHANGE_NAME,
  NrRequestActionCodes.CONVERSION,
  NrRequestActionCodes.RESTORE
]

// *** TODO: should these be from FF instead?
export const ColinRequestTypes = [
  EntityType.BC,
  EntityType.CC,
  EntityType.CR,
  EntityType.UL
]

export const XproColinRequestTypes = [
  EntityType.XCR,
  EntityType.XUL
]

export const MrasEntities = [
  EntityType.BC,
  EntityType.CC,
  EntityType.CP,
  EntityType.CR,
  EntityType.UL,
  EntityType.XCR,
  EntityType.XLP
]
