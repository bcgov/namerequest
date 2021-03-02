import { ConversionTypesI } from '@/models'

export const ConversionTypes: ConversionTypesI[] = [
  {
    desc: 'Limited company to an unlimited liability company',
    text: 'Limited company to an unlimited liability company',
    entity_type_cd: 'UL',
    blurbs: [
      'Alter business type from a limited company to an unlimited liability company.'
    ],
    value: 'UC',
    rank: 1,
    shortlist: true
  },
  {
    desc: 'Limited company to a community contribution company',
    text: 'Limited company to a community contribution company',
    entity_type_cd: 'CC',
    blurbs: [
      'Alter business type from a limited company to a community contribution company.'
    ],
    value: 'CCV',
    rank: 2,
    shortlist: true
  },
  {
    desc: 'Limited company to a benefit company',
    text: 'Limited company to a benefit company',
    entity_type_cd: 'BC',
    blurbs: [
      'Alter business type from a limited company to a benefit company.'
    ],
    value: 'BECV',
    shortlist: false
  },
  {
    desc: 'Benefit company to a limited company',
    text: 'Benefit company to a limited company',
    entity_type_cd: 'CR',
    blurbs: [
      'Alter business type from a benefit company to a limited company.'
    ],
    value: 'BECR',
    shortlist: false
  }
]
