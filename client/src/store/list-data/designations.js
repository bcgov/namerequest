const corporateDesignations = {
  words: [
    'CORP',
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
      'OCIETE EN NOM COLLECTIF A RESPONSABILITE LIMITEE',
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
    end: false
  },
  UL: {
    words: [
      'ULC',
      'UNLIMITED LIABILITY COMPANY'
    ],
    end: true
  },
  BC: corporateDesignations
}

export default designations
