const corporateDesignations = {
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

const cooperativeDesignations = {
  words: [
    'CO-OP',
    'CO-OPERATIVE',
    'COOP',
    'COOPERATIVE'
  ],
  end: false
}

const designations = {
  BC: corporateDesignations,
  CC: {
    words: [
      'CCC',
      'COMMUNITY CONTRIBUTION COMPANY',
      ...corporateDesignations.words
    ],
    end: true
  },
  CP: cooperativeDesignations,
  CR: corporateDesignations,
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
      'SLR',
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
  UL: {
    words: [
      'ULC',
      'UNLIMITED LIABILITY COMPANY'
    ],
    end: true
  },
  XCP: cooperativeDesignations,
  XCR: corporateDesignations
}

function getAllDesignations () {
  let output = []
  for (let entity in designations) {
    for (let word of designations[entity].words) {
      if (!output.includes(word)) {
        output.push(word)
      }
    }
  }
  return output
}

export const allDesignationsList = getAllDesignations()
export default designations
