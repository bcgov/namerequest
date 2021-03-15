import { EntityI } from '@/interfaces/models'

export const EntityTypesBCData: EntityI[] = [
  {
    text: 'Sole proprietorship',
    value: 'FR',
    cat: 'Proprietorships',
    blurbs: [
      'A company owned and operated by one person who is personally responsible for all debts and liabilities.',
      'Owner makes decisions, receives all profits, and claims all losses',
      'Reported on your personal taxes',
      'Does not have name protection in BC'
    ],
    chgBlurbs: [
      'Change the business name of an existing sole proprietorship.'
    ]
  },
  {
    text: '"Doing Business As" name (DBA)',
    value: 'DBA',
    cat: 'Proprietorships',
    blurbs: [
      `An existing legal BC entity that would like to be known as another name. Referred to as a "Doing Business As",
        "Operating As" or trade
        name. `,
      'Does not have name protection in BC'
    ],
    chgBlurbs: [
      'Change the business name of a DBA.'
    ]
  },
  {
    text: 'Limited company',
    cat: 'Corporations',
    blurbs: [
      `A company that may have one or more people who own shares with some personal responsibility for debt and
        liabilities.`,
      `Has many of the same rights of an individual`,
      `Reported separately as Corporate tax`,
      `Has name protection in BC`
    ],
    mveBlurbs: [
      `A company that may have one or more people who own shares with some personal responsibility for
        debts and liabilities.`,
      'Has many of the same rights of an individual',
      'Reported separately as Corporate tax',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Restore a limited company that is no longer active with BC Registries.'
    ],
    amlBlurbs: [
      'An amalgamation of two or more corporations to form a new limited company.'
    ],
    chgBlurbs: [
      'Change/Correct the name of an existing limited company.'
    ],
    value: 'CR',
    shortlist: true,
    rank: 1
  },
  {
    text: 'Unlimited liability company',
    cat: 'Corporations',
    blurbs: [
      `A type of corporation that is often used by American corporations as a Canadian subsidiary or to hold Canadian
         assets.`,
      'Shareholders liable for debts and liabilities',
      'Reported separately as Canadian Corporate tax',
      'Has name protection in BC'
    ],
    mveBlurbs: [
      `A type of corporation that is often used by American corporations as a Canadian subsidiary or
        to hold Canadian assets.`,
      'Shareholders liable for debts and liabilities',
      'Reported separately as Canadian Corporate tax',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Restore an unlimited liability company (ULC) that is no longer active with BC Registries.'
    ],
    amlBlurbs: [
      'An amalgamation of two or more corporations to form a new unlimited liability company.'
    ],
    chgBlurbs: [
      'Change/Correct the name of an existing unlimited liability company.'
    ],
    value: 'UL'
  },
  {
    text: 'General partnership',
    cat: 'Partnerships',
    blurbs: [
      `A business owned and operated by two or more people or BC entities who are personally responsible for all debt
         and liability.`,
      'Profits or losses are divided among the partners based on each partner\'s share',
      'A partnership agreement is recommended',
      'Reported on your personal income tax',
      'Does not have name protection in BC'
    ],
    chgBlurbs: [
      'Change the name of an existing general partnership.'
    ],
    value: 'GP'
  },
  {
    text: 'Limited partnership',
    cat: 'Partnerships',
    blurbs: [
      `Frequently used in real estate developments or film industry projects.  This type of partnership ends when
        the project is complete.`,
      'Formed by a general partner (person or entity)',
      'A partnership agreement is recommended',
      'Does not have name protection in BC'
    ],
    chgBlurbs: [
      'Change the name of an existing limited partnership.'
    ],
    value: 'LP'
  },
  {
    text: 'Limited liability partnership',
    cat: 'Partnerships',
    blurbs: [
      'Frequently used by professionals such as doctors or lawyers to form a practice.',
      'Formed by two or more individuals or entities',
      'Partners have limited liability as an LLP has a legal status separate from its partners',
      'A partnership agreement is recommended',
      'Does not have name protection in BC'
    ],
    chgBlurbs: [
      'Change the name of an existing limited liability partnership.'
    ],
    value: 'LL'
  },
  {
    text: 'Cooperative association',
    cat: 'Social Enterprises',
    blurbs: [
      'Membership-based organization, owned and operated by the people who use its services.',
      'Has independent legal status separate from its members',
      'Members take on shares and have limited liability',
      'Reported as Corporate tax',
      'Has name protection in BC'
    ],
    mveBlurbs: [
      'Membership-based organization, owned and operated by the people who use its services.',
      'Has independent legal status separate from its members',
      'Members take on shares and have limited liability',
      'Reported as Corporate tax',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Restore a cooperative association that is no longer active with BC Registries.'
    ],
    amlBlurbs: [
      `An amalgamation of two or more cooperative associations to form a new cooperative
        association.`
    ],
    chgBlurbs: [
      'Change/correct the name of an existing cooperative association.'
    ],
    value: 'CP'
  },
  {
    text: 'Benefit company',
    cat: 'Corporations',
    blurbs: [
      `A type of corporation with special commitments to conduct business in a responsible and sustainable way.`,
      'Must publish and post an audited annual benefit report',
      'Reported as Corporate tax',
      'Has name protection in BC'
    ],
    mveBlurbs: [
      'A type of corporation with special commitments to conduct business in a responsible and sustainable way.',
      'Must publish and post an audited annual benefit report',
      'Reported as Corporate tax',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Restore a benefit company that is no longer active with BC Registries.'
    ],
    amlBlurbs: [
      'An amalgamation of two or more corporations to form a new benefit company.'
    ],
    chgBlurbs: [
      'Change/Correct the name of an existing benefit company.'
    ],
    value: 'BC'
  },
  {
    text: 'Community contribution company',
    cat: 'Social Enterprises',
    blurbs: [
      `A type of corporation that has a benefit to the community. It is intended to bridge the gap between
        for-profit and non-profit companies.`,
      'Reported as Corporate tax',
      'Has name protection in BC'
    ],
    mveBlurbs: [
      'A type of corporation that has a benefit to the community. It is intended to bridge the gap between ' +
      'for-profit and non-profit companies.',
      'Reported as Corporate tax',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Restore a community contribution company (CCC) that is no longer active with BC Registries.'
    ],
    amlBlurbs: [
      `An amalgamation of two or more corporations to form a new community contribution
        company.`
    ],
    chgBlurbs: [
      'Change/correct the name of an existing community contribution company.'
    ],
    value: 'CC'
  },
  {
    text: 'Society',
    cat: 'Social Enterprises',
    blurbs: [
      `A non-profit organization that is also known as a non-share corporation.`,
      'Any funds or profits must be used only for social or community benefit',
      'When incorporated, has independent legal status separate from its members',
      'Members, staff and directors protected from personal liability',
      'Has name protection in BC',
      'Must use Societies Online to register a name and incorporate'
    ],
    mveBlurbs: [
      `A non-profit organization that is also known as a non-share corporation.`,
      'Any funds or profits must be used only for social or community benefit',
      'When incorporated, has independent legal status separate from its members',
      'Members, staff and directors protected from personal liability',
      'Has name protection in BC',
      'Must use Societies Online to register a name and incorporate'
    ],
    chgBlurbs: [
      'Societies must use Societies Online to get their name.'
    ],
    value: 'SO'
  },
  {
    text: 'Private act',
    cat: 'Other',
    blurbs: [
      `A special type of business structure that may often be established through legislation or by economic growth
        initiatives.`,
      'Examples include resorts and ski areas',
      'Has name protection in BC'
    ],
    value: 'PA'
  },
  {
    text: 'Credit union',
    cat: 'Other',
    blurbs: [
      'Credit union',
      'Needs authorization from the BC Financial Services Authority',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Restore a credit union that is no longer active with BC Registries.'
    ],
    chgBlurbs: [
      'Correct/change the name of an existing credit union.'
    ],
    value: 'FI'
  },
  {
    text: 'Parish',
    cat: 'Other',
    blurbs: [
      'Church Parish',
      'Call BC Registries and Online Services at 1-877-526-162 for more information',
      'Has name protection in BC'
    ],
    value: 'PAR'
  }
]

export const EntityTypesXPROData: EntityI[] = [
  {
    text: 'Limited company',
    cat: 'Corporations',
    blurbs: [
      `Corporation established and operating in a Canadian province or territory that plans to operate in
        BC as well.`,
      'Has name protection in BC'
    ],
    intBlurbs: [
      'Corporation established and operating outside of Canada.  Plans to operate in BC as well.',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Reinstate an extraprovincially registered company that is no longer active with BC Registries.'
    ],
    amlBlurbs: [
      [
        `Register an amalgamation that occurred in another jurisdiction where at least one of the companies is
           extraprovincially registered in BC.`
      ],
      [
        `Register an amalgamation or merger that occurred in another jurisdiction where at least one of the companies
          is extraprovincially registered in BC.`
      ]
    ],
    chgBlurbs: [
      [
        'Update the name of an extraprovincial company to reflect a change of name in the home jurisdiction.',
        'Name request is not required for a company incorporated in the Federal jurisdiction'
      ],
      [
        'Update the name of an extraprovincial company to reflect a change of name in the home jurisdiction.'
      ]
    ],
    value: 'XCR',
    shortlist: true,
    rank: 1
  },
  {
    text: 'Unlimited liability company',
    cat: 'Corporations',
    blurbs: [
      'ULC established and operating in Alberta or Nova Scotia and plans to operate in BC as well.',
      'Has name protection in BC'
    ],
    intBlurbs: [
      `Unlimited liability company (ULC) established and operating outside of Canada.  Plans to
        operate in BC as well.`,
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Unlimited liability company'
    ],
    amlBlurbs: [
      [
        'Unlimited liability company'
      ]
    ],
    chgBlurbs: [
      [
        'Unlimited liability company'
      ]
    ],
    value: 'XUL'
  },
  {
    text: 'Limited liability company',
    cat: 'Corporations',
    blurbs: [
      ''
    ],
    intBlurbs: [
      'A Limited liability company (LLC) formed outside of Canada that plans to operate in BC as well.',
      'Has name protection in BC'
    ],
    mveBlurbs: [
      'A Limited liability company (LLC) formed outside of Canada that plans to operate in BC as well.',
      'Does have name protection in BC'
    ],
    rehBlurbs: [
      `Reinstate an extraprovincially registered limited liability company (LLC) that is no longer
        active with BC Registries.`
    ],
    amlBlurbs: [
      [
        '*** REMOVE THIS OPTION FROM AML REQUESTS ***'
      ]
    ],
    chgBlurbs: [
      [
        'Not an available option for CA'
      ],
      [
        `Update the name of an extraprovincial limited liability company (LLC) to reflect a change of
          name in the home jurisdiction.`
      ]
    ],
    value: 'RLC'
  },
  {
    text: 'Limited partnership',
    cat: 'Partnerships',
    blurbs: [
      `Limited partnership (LP) established and operating in a Canadian province or territory that plans
        to operate in BC as well.`,
      'Does not have name protection in BC'
    ],
    intBlurbs: [
      'Limited partnership (LP) established and operating in the US or UK.  Plans to operate in BC as well.',
      'Does not have name protection in BC'
    ],
    mveBlurbs: [
      'Limited partnership'
    ],
    amlBlurbs: [
      [
        'Limited partnership'
      ]
    ],
    chgBlurbs: [
      [
        `Update the name of an extraprovincial limited partnership to reflect a change of name in the home
          jurisdiction.`
      ]
    ],
    value: 'XLP'
  },
  {
    text: 'Limited liability partnership',
    cat: 'Partnerships',
    blurbs: [
      `Limited liability partnership (LLP) established and operating in a Canadian province or territory
        that plans to operate in BC as well.`,
      'Does not have name protection in BC'
    ],
    intBlurbs: [
      `Limited liability partnership (LLP) established and operating in the US or UK.  Plans to operate
        in BC as well.`,
      'Does not have name protection in BC'
    ],
    mveBlurbs: [
      'Limited liability partnership'
    ],
    amlBlurbs: [
      [
        'Limited liability partnership'
      ]
    ],
    chgBlurbs: [
      [
        `Update the name of an extraprovincial limited liability partnership to reflect a change of name in the home
          jurisdiction.`
      ]
    ],
    value: 'XLL'
  },
  {
    text: 'Cooperative association',
    cat: 'Social Enterprises',
    blurbs: [
      `Cooperative association established and operating in a Canadian province or territory or in the federal
         jurisdiction that plans to operate in BC.`,
      'Has name protection in BC'
    ],
    intBlurbs: [
      'Cooperative association established and operating outside of Canada.  Plans to operate in BC.',
      'Has name protection in BC'
    ],
    rehBlurbs: [
      'Restore an extraprovincially registered cooperative association that is no longer active with BC Registries.'
    ],
    amlBlurbs: [
      [
        `Register an amalgamation that occurred in another jurisdiction where at least one of the cooperative
          associations is extraprovincially registered in BC.`
      ]
    ],
    chgBlurbs: [
      [
        `Update the name of an extraprovincial cooperative association to reflect a change of name in the home
          jurisdiction.`
      ]
    ],
    value: 'XCP'
  },
  {
    text: 'Society',
    cat: 'Social Enterprises',
    blurbs: [
      'A non-profit organization that is also known as a non-share corporation.',
      'Has name protection in BC',
      'Must use Societies Online to get their name'
    ],
    intBlurbs: [
      'Societies must use Societies Online to get their name'
    ],
    mveBlurbs: [
      'A non-profit organization that is also known as a non-share corporation.',
      'Any funds or profits must be used only for social or community benefit',
      'When incorporated has independent legal status separate from its members',
      'Has name protection in BC',
      'Must use Societies Online to register a name and incorporate'
    ],
    amlBlurbs: [
      [
        'Society'
      ]
    ],
    chgBlurbs: [
      [
        'Societies must use Societies Online to get their name.'
      ]
    ],
    value: 'XSO'
  }
]
