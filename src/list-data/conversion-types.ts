import { EntityType, NrRequestTypeCodes } from '@/enums'
import { ConversionTypesI } from '@/interfaces/models'

export const ConversionTypes: ConversionTypesI[] = [
  {
    desc: 'Limited Company to an Unlimited Liability Company',
    text: 'Limited Company to an Unlimited Liability Company',
    entity_type_cd: EntityType.UL,
    origin_entity_type_cd: EntityType.BC,
    blurbs: [
      'Alter business type from a limited company to an unlimited liability company.'
    ],
    value: NrRequestTypeCodes.CONVERT_ULC,
    rank: 1,
    shortlist: true
  },
  {
    desc: 'Limited Company to a Community Contribution Company',
    text: 'Limited Company to a Community Contribution Company',
    entity_type_cd: EntityType.CC,
    origin_entity_type_cd: EntityType.BC,
    blurbs: [
      'Alter business type from a limited company to a community contribution company.'
    ],
    value: NrRequestTypeCodes.CONVERT_CCC,
    rank: 2,
    shortlist: true
  },
  {
    desc: 'Limited Company to a Benefit Company',
    text: 'Limited Company to a Benefit Company',
    entity_type_cd: EntityType.BC,
    origin_entity_type_cd: EntityType.BC,
    blurbs: [
      'Alter business type from a limited company to a benefit company.'
    ],
    value: NrRequestTypeCodes.CONVERT_BEN,
    shortlist: false
  },
  {
    desc: 'Benefit Company to a Limited Company',
    text: 'Benefit Company to a Limited Company',
    entity_type_cd: EntityType.CR,
    origin_entity_type_cd: EntityType.BEN,
    blurbs: [
      'Alter business type from a benefit company to a limited company.'
    ],
    value: NrRequestTypeCodes.CONVERT_CORP,
    shortlist: false
  },
  {
    desc: 'Unlimited Liability Company to a Limited Company',
    text: 'Unlimited Liability Company to a Limited Company',
    entity_type_cd: EntityType.CR,
    origin_entity_type_cd: EntityType.ULC,
    blurbs: [
      'Alter business type from an unlimited liability company to a limited company.'
    ],
    value: NrRequestTypeCodes.CONVERT_ULCB,
    shortlist: false
  },
  {
    desc: 'Unlimited Liability Company to a Benefit Company',
    text: 'Unlimited Liability Company to a Benefit Company',
    entity_type_cd: EntityType.BC,
    origin_entity_type_cd: EntityType.ULC,
    blurbs: [
      'Alter business type from an unlimited liability company to a benefit company.'
    ],
    value: NrRequestTypeCodes.CONVERT_ULBE,
    shortlist: false
  }
]
