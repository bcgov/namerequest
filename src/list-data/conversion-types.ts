import { EntityType, NrRequestTypeCodes } from '@/enums'
import { ConversionTypesI } from '@/interfaces/models'

export const ConversionTypes: ConversionTypesI[] = [
  {
    desc: 'Limited company to an unlimited liability company',
    text: 'Limited company to an unlimited liability company',
    entity_type_cd: EntityType.UL,
    blurbs: [
      'Alter business type from a limited company to an unlimited liability company.'
    ],
    value: NrRequestTypeCodes.CONVERT_ULC,
    rank: 1,
    shortlist: true
  },
  {
    desc: 'Limited company to a community contribution company',
    text: 'Limited company to a community contribution company',
    entity_type_cd: EntityType.CC,
    blurbs: [
      'Alter business type from a limited company to a community contribution company.'
    ],
    value: NrRequestTypeCodes.CONVERT_CCC,
    rank: 2,
    shortlist: true
  },
  {
    desc: 'Limited company to a benefit company',
    text: 'Limited company to a benefit company',
    entity_type_cd: EntityType.BC,
    blurbs: [
      'Alter business type from a limited company to a benefit company.'
    ],
    value: NrRequestTypeCodes.CONVERT_BEN,
    shortlist: false
  },
  {
    desc: 'Benefit company to a limited company',
    text: 'Benefit company to a limited company',
    entity_type_cd: EntityType.CR,
    blurbs: [
      'Alter business type from a benefit company to a limited company.'
    ],
    value: NrRequestTypeCodes.CONVERT_CORP,
    shortlist: false
  },
  {
    desc: 'Unlimited liability company to a limited company',
    text: 'Unlimited liability company to a limited company',
    entity_type_cd: EntityType.CR,
    blurbs: [
      'Alter business type from an unlimited liability company to a limited company.'
    ],
    value: NrRequestTypeCodes.CONVERT_ULCB,
    shortlist: false
  },
  {
    desc: 'Unlimited liability company to a benefit company',
    text: 'Unlimited liability company to a benefit company',
    entity_type_cd: EntityType.BC,
    blurbs: [
      'Alter business type from an unlimited liability company to a benefit company.'
    ],
    value: NrRequestTypeCodes.CONVERT_ULBE,
    shortlist: false
  }
]
