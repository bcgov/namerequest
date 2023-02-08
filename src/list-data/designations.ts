import { DesignationI } from '@/interfaces'

const CorporateDesignations: DesignationI = {
  words: [
    'CORP.',
    'CORPORATION',
    'INC.',
    'INCORPORATED',
    'LIMITED',
    'LTD.',
    'INCORPOREE',
    'LIMITEE',
    'LTEE'
  ],
  end: true
}

const CooperativeDesignations: DesignationI = {
  words: [
    'CO-OP',
    'CO-OPERATIVE',
    'COOP',
    'COOPERATIVE'
  ],
  end: false
}

export const Designations = {
  BC: CorporateDesignations,
  CC: {
    words: [
      'CCC',
      'COMMUNITY CONTRIBUTION COMPANY',
      ...CorporateDesignations.words
    ],
    end: true
  },
  CP: CooperativeDesignations,
  CR: CorporateDesignations,
  DBA: {
    words: [],
    end: false
  },
  FI: {
    words: [],
    end: false
  },
  FR: {
    words: [],
    end: false
  },
  GP: {
    words: [],
    end: false
  },
  LL: {
    words: [
      'LIMITED LIABILITY PARTNERSHIP',
      'LLP',
      'SENCRL',
      'SRL',
      'SOCIETE A RESPONSABILITE LIMITEE',
      'SOCIETE EN NOM COLLECTIF A RESPONSABILITE LIMITEE'
    ],
    end: true
  },
  LP: {
    words: ['LIMITED PARTNERSHIP'],
    end: true
  },
  PA: {
    words: [],
    end: false
  },
  PAR: {
    words: [],
    end: false
  },
  RLC: {
    words: [
      'L.L.C.',
      'LIMITED LIABILITY CO.',
      'LIMITED LIABILITY COMPANY',
      'LLC'
    ],
    end: true
  },
  SO: {
    words: [],
    end: false
  },
  UL: {
    words: [
      'ULC',
      'UNLIMITED LIABILITY COMPANY'
    ],
    end: true
  },
  XCP: CooperativeDesignations,
  XCR: CorporateDesignations
}

function getAllDesignations () {
  let output = []
  for (let entity in Designations) {
    for (let word of Designations[entity].words) {
      if (!output.includes(word)) {
        output.push(word)
      }
    }
  }
  return output
}

// a string[] containing each designation code used in namex
// eg. [ 'CR', 'BC', 'CCC', etc... ]
export const AllDesignationsList = getAllDesignations()
