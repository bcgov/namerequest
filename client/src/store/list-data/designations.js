const corporateDesignations = {
  words: [
    'CORP.',
    'CORPORATION',
    'INC.',
    'INCORPORATED',
    'INCORPOREE',
    'LIMITED',
    'LIMITEE',
    'LTD.',
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
  CR: corporateDesignations,
  XCR: corporateDesignations,
  RLC: {
    words: [
      'L.L.C.',
      'LIMITED LIABILITY CO.',
      'LIMITED LIABILITY COMPANY',
      'LLC'
    ],
    end: true
  },
  LL: {
    words: [
      'LLP',
      'LIMITED LIABILITY PARTNERSHIP',
      'SOCIETE A RESPONSABILITE LIMITEE',
      'SOCIETE EN NOM COLLECTIF A RESPONSABILITE LIMITEE',
      'SLR',
      'SENCRL'
    ],
    end: true
  },
  CP: cooperativeDesignations,
  XCP: cooperativeDesignations,
  CC: {
    words: [
      'CCC',
      'COMMUNITY CONTRIBUTION COMPANY',
      ...corporateDesignations.words
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
  BC: corporateDesignations,
  PA: {
    words: [],
    end: false
  },
  FI: {
    words: [],
    end: false
  },
  PAR: {
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
  DBA: {
    words: [],
    end: false
  }
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
