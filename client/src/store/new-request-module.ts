import axios, { AxiosError, AxiosResponse } from 'axios'
import querystring from 'qs'
import Vue from 'vue'
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import {
  AnalysisJSONI,
  ApplicantI,
  ConditionalReqI,
  ConsentConflictI,
  ConversionTypesI,
  DraftReqI,
  EntityI,
  ExistingRequestSearchI,
  LocationT,
  NameDesignationI,
  NameRequestI,
  NewRequestNameSearchI,
  RequestActionMappingI,
  RequestActionsI,
  RequestNameI,
  ReservedReqI,
  SelectOptionsI,
  StatsI,
  SubmissionTypeT,
  WaitingAddressSearchI
} from '@/models'

import store from '@/store'
import {
  $colinRequestActions,
  $colinRequestTypes,
  $xproColinRequestTypes,
  bcMapping,
  xproMapping
} from '@/store/list-data/request-action-mapping'
import $canJurisdictions, { $mrasJurisdictions } from './list-data/canada-jurisdictions'
import $designations from './list-data/designations'
import $intJurisdictions from './list-data/intl-jurisdictions'
import canadaPostAPIKey from './config'

import { removeExcessSpaces, sanitizeName } from '@/plugins/utilities'
import { NameRequestPayment } from '@/modules/payment/models'

import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'
import * as types from '@/store/types'
import { NrAction } from '@/enums'
import { featureFlags } from '@/plugins/featureFlags'

const qs: any = querystring
const ANALYSIS_TIMEOUT_MS = 3 * 60 * 1000 // 3 minutes
let source: any

export class ApiError extends Error {}

function isAxiosError (err: AxiosError | Error): err is AxiosError {
  return (err as AxiosError).isAxiosError !== undefined
}

/**
 * Throws an error with error message extracted and formatted.
 * @param err error object from the catch statement
 * @param defaultMessage optional fallback message
 */
async function handleApiError (err, defaultMessage = '') {
  if (isAxiosError(err)) {
    let message = ''
    const responseData = err?.response?.data
    const hasResponseData = !!responseData
    if (hasResponseData && responseData instanceof Blob) {
      // Handle any cases where the API error response is a Blob (eg. request for PDF receipt fails)
      const errorText = await responseData.text()
      const errorJson = JSON.parse(errorText)
      if (errorJson && errorJson.message) {
        message = errorJson.message
      }
    } else if (hasResponseData && responseData instanceof String) {
      message = responseData.toString()
      // Handle any cases where the API error response is a string
    } else if (hasResponseData && responseData.message) {
      // Handle API errors, they will be supplied as an object { message: 'Ipsum lorem dolor' }
      message = responseData.message
    } else {
      message = defaultMessage
    }

    // Clean the error message, replace line breaks with HTML breaks
    const regex = /(?:\r\n|\r|\n)/g
    message = message.replace(regex, '<br>')
    throw new ApiError(message)
  } else {
    const { message } = err
    throw new ApiError(message || defaultMessage)
  }
}

/** Test
 {
    name1: 'ACME Construction',
    name2: 'ACME Home Construction',
    name3: 'ACME Commercial Construction',
    designation1: 'Ltd.',
    designation2: 'Ltd.',
    designation3: 'Ltd.'
 }
 */
const parseNameChoices = (nameChoices) => {
  return Object.keys(nameChoices)
    .reduce((names, key, idx) => {
      // Key will be either 'name' or 'designation'
      const nameIdx = key.match(/[\d]+$/)[0]
      const typeKey = key.substring(0, key.lastIndexOf(nameIdx))
      names[nameIdx] = names[nameIdx] || { name: undefined, designation: undefined }
      names[nameIdx][typeKey] = nameChoices[key]
      return names
    }, [])
    .map((choice) => {
      return (choice.name && choice.designation)
        ? `${choice.name} ${choice.designation}`
        : (choice.name && !choice.designation)
          ? `${choice.name}`
          : undefined
    })
    .filter((name) => !!name)
}

let debouncedCheckMRAS: any
let debouncedCheckCOLIN: any

interface RequestNameMapI extends RequestNameI {}

export const ROLLBACK_ACTIONS = {
  CANCEL: 'cancel',
  RESTORE: 'restore',
  ROLLBACK_PAYMENT: 'rollback-payment'
}

@Module({ dynamic: true, namespaced: false, store, name: 'newRequestModule' })
export class NewRequestModule extends VuexModule {
  actingOnOwnBehalf: boolean = true
  addressSuggestions: object | null = null
  allowAutoApprove: boolean = false
  analysisJSON: AnalysisJSONI | null = null
  applicant: ApplicantI = {
    addrLine1: '',
    addrLine2: '',
    addrLine3: '',
    city: '',
    clientFirstName: '',
    clientLastName: '',
    contact: '',
    countryTypeCd: 'CA',
    declineNotificationInd: null,
    emailAddress: '',
    faxNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    partyId: '',
    phoneNumber: '',
    postalCd: '',
    stateProvinceCd: ''
  }
  assumedNameOriginal: string = ''
  conditionsModalVisible: boolean = false
  conflictId: string | null = null
  conversionType: string = ''
  conversionTypeAddToSelect: ConversionTypesI | null = null
  conversionTypes: ConversionTypesI[] = [
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
  corpNum: string = ''
  corpSearch: string = ''
  designationIssueTypes = [
    'designation_non_existent',
    'designation_mismatch',
    'designation_misplaced',
    'end_designation_more_than_once'
  ]
  displayedComponent: string = 'Tabs'
  doNotAnalyzeEntities: string[] = ['PAR', 'CC', 'CP', 'PA', 'FI', 'XCP', 'SO']
  editMode: boolean = false
  entity_type_cd: string = 'CR'
  entityTypeAddToSelect: SelectOptionsI | null = null
  entityTypesBCData: EntityI[] = [
    {
      text: 'Sole proprietorship',
      value: 'FR',
      cat: 'Proprietorships',
      blurbs: [
        'A company owned and operated by one person who is personally responsible for all debt and liability.',
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
        `A type of corporation which has a benefit to  the community.  They are intended to bridge the gap between 
        for-profit and non-profit companies.`,
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
        'When incorporated has independent legal status separate from its members',
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
  entityTypesXPROData: EntityI[] = [
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
      mveBlurbs: [
        `A company that may have one or more people who own shares with some personal responsibility for
        debt and liabilities.`,
        'Has many of the same rights of an individual',
        'Reported separately as Corporate tax',
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
      mveBlurbs: [
        `A type of corporation that is often used by American corporations as a Canadian subsidiary or
        to hold Canadian assets.`,
        'Shareholders liable for debts and liabilities',
        'Reported separately as Canadian Corporate tax',
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
      mveBlurbs: [
        'Membership-based organization, owned and operated by the people who use its services.',
        'Has independent legal status separate from its members',
        'Members take on shares and have limited liability',
        'Reported as Corporate tax',
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
  errors: string[] = []
  existingRequestSearch: ExistingRequestSearchI = {
    emailAddress: '',
    nrNum: '',
    phoneNumber: ''
  }
  extendedRequestType: SelectOptionsI | null = null
  getNameReservationFailed: boolean = false
  helpMeChooseModalVisible: boolean = false
  incorporateLoginModalVisible: boolean = false
  affiliationErrorModalVisible: boolean = false
  isPersonsName: boolean = false
  issueIndex: number = 0
  location: LocationT = 'BC'
  locationInfoModalVisible: boolean = false
  mrasSearchInfoModalVisible: boolean = false
  mrasSearchResultCode: number = null
  name: string = ''
  nameOriginal: string = ''
  nameChoices = {
    name1: '',
    designation1: '',
    name2: '',
    designation2: '',
    name3: '',
    designation3: ''
  }
  nameIsEnglish: boolean = true
  nameAnalysisTimedOut: boolean = false
  noCorpNum: boolean = false
  nr: Partial<NameRequestI> = {} as NameRequestI
  nrData = {
    additionalInfo: '',
    corpNum: '',
    homeJurisNum: '',
    natureBusinessInfo: '',
    previousRequestId: '',
    tradeMark: '',
    xproJurisdiction: ''
  }
  nrOriginal: Partial<NameRequestI> = {} as NameRequestI
  nrRequestNameMap: RequestNameMapI[] = []
  nrRequiredModalVisible: boolean = false
  pickEntityModalVisible: boolean = false
  pickRequestTypeModalVisible: boolean = false
  priorityRequest: boolean = false
  request_action_cd: string = 'NEW'
  request_jurisdiction_cd: string = ''
  requestExaminationOrProvideConsent = {
    0: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false,
      assumed_name: false
    },
    1: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false,
      assumed_name: false
    },
    2: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false,
      assumed_name: false
    },
    3: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false,
      assumed_name: false
    }
  }
  requestActions: RequestActionsI[] = [
    {
      text: 'Start a new',
      shortDesc: 'New Request',
      value: 'NEW',
      blurbs: `Create a new business in British Columbia or register a business you formed in another province or 
              territory, country or federal jurisdiction so that you may also conduct business here in BC.`
    },
    {
      text: 'Move (continue) into BC a',
      shortDesc: 'Move Request',
      value: 'MVE',
      blurbs: `Transfer a corporation you formed in another jurisdiction so that it becomes a BC company.`
    },
    // COMMENTED OUT FOR FUTURE IMPLEMENTATION
    // {
    //   text: 'Assume a New Name in BC',
    //   shortDesc: 'Assumed Name Request',
    //   value: 'ASSUMED',
    //   blurb: `You have an existing business in another province. You are closing your business there and moving your
    //           business to BC, however, the name of your business is already in use in BC`
    // },
    {
      text: 'Restore or Reinstate a',
      shortDesc: 'Restore-Historical Request',
      value: 'REH',
      blurbs: `You have a corporation, cooperative association, society or financial institution that has been dissolved
              or cancelled.  You want to start up again and use the same name or a new name.  You will need the
              incorporation number assigned to you by BC Registries and Online Services.`
    },
    {
      text: 'Amalgamate two or more',
      shortDesc: 'Amalgamation Request',
      value: 'AML',
      blurbs: 'Amalgamating one or more companies to result in a new BC Company.'
    },
    {
      text: 'Change the name of an existing',
      shortDesc: 'Change of Name Request',
      value: 'CHG',
      blurbs: `You have an existing business that is registered or incorporated in BC and you want to change your name.
              You will need the incorporation or firm number assigned to you by BC Registries and Online Services.`
    },
    {
      text: 'Change (alter) the business type of a',
      shortDesc: 'Conversion Request',
      value: 'CNV',
      blurbs: `You want to alter from one type of corporation to another.  For example you are a limited company and 
              want to become an unlimited liability company.   You will need the incorporation number assigned to you 
              by BC Registries and Online Services.`
    }
    // COMMENTED OUT FOR FUTURE IMPLEMENTATION
    // {
    //   text: 'Restore with a New Name',
    //   shortDesc: 'Restore-New Request',
    //   value: 'REN',
    //   blurb: `You have a business that has been dissolved or cancelled. You want to start up again with a new name.
    //           You will need your incorporation or firm number assigned to you by Registries.`
    // }
  ]
  requestActionOriginal: string = ''
  showActualInput: boolean = false
  stats: StatsI | null = null
  submissionTabNumber: number = 0
  submissionType: SubmissionTypeT | null = null
  tabNumber: number = 0
  userCancelledAnalysis: boolean = false
  waitingAddressSearch: WaitingAddressSearchI | null = null

  private store: any

  get showPriorityRequest () {
    return (!this.editMode && this.nrState === 'DRAFT') || (!this.editMode && this.submissionType === 'examination')
  }
  get showCorpNum (): 'colin' | 'mras' | false {
    if (($colinRequestActions.includes(this.request_action_cd) && $colinRequestTypes.includes(this.entity_type_cd)) ||
      this.entity_type_cd === 'DBA') {
      return 'colin'
    }
    if ($colinRequestActions.includes(this.request_action_cd) && $xproColinRequestTypes.includes(this.entity_type_cd)) {
      return 'colin'
    }
    let mrasEntities = ['XCR', 'XLP', 'UL', 'CR', 'CP', 'BC', 'CC']
    let { xproJurisdiction } = this.nrData

    if ($mrasJurisdictions.includes(xproJurisdiction) && mrasEntities.includes(this.entity_type_cd)) {
      if (this.location === 'CA' && ['NEW', 'ASSUMED'].includes(this.request_action_cd)) {
        return 'mras'
      }
      if (this.location === 'BC' && ['MVE'].includes(this.request_action_cd)) {
        return 'mras'
      }
    }
    return false
  }
  get corpNumForEdit () {
    return this.corpNumForReservation
  }
  get corpNumForReservation () {
    // this differs from getCorpNumForEdit by not supplying the empty keys for corpNum and homeJurisNum
    // which are necessary to denote deletion during the PATCH operation that is for editing but which
    // are not supported in the POST/PUT operation
    if (!this.showCorpNum) {
      return {
        corpNum: '',
        homeJurisNum: this.nrData.homeJurisNum
      }
    }
    if (this.showCorpNum === 'colin') {
      return {
        corpNum: this.corpNum,
        homeJurisNum: ''
      }
    }
    return {
      corpNum: this.corpNum,
      homeJurisNum: this.nrData.homeJurisNum
    }
  }
  get currentIssue () {
    const { analysisJSON } = this
    if (!analysisJSON) return {}

    if (analysisJSON && analysisJSON.issues && Array.isArray(analysisJSON.issues)) {
      return analysisJSON.issues[this.issueIndex]
    }
    return {}
  }
  get showXproJurisdiction () {
    if (this.location !== 'BC') {
      return true
    }
    if (this.request_action_cd === 'MVE') {
      return true
    }
    return false
  }
  get allDesignationWords () {
    let output = []
    for (let des in $designations) {
      $designations[des].words.forEach(word => {
        if (!output.includes(word)) {
          output.push(word)
        }
      })
    }
    return output
  }
  get consentConflicts (): ConsentConflictI {
    let output: ConsentConflictI = {
      name: ''
    }

    const { analysisJSON } = this
    if (!analysisJSON) return output

    for (let key in this.requestExaminationOrProvideConsent) {
      if (this.requestExaminationOrProvideConsent[key].conflict_self_consent) {
        output.name = analysisJSON.issues[key].conflicts[0].name
        if (analysisJSON.issues[key].conflicts[0].id) {
          output.corpNum = analysisJSON.issues[key].conflicts[0].id
        }
      }
    }
    return output
  }
  get consentWords () {
    let consentWords = []

    const { analysisJSON } = this
    if (!analysisJSON) return consentWords

    for (let step in this.requestExaminationOrProvideConsent) {
      if (this.requestExaminationOrProvideConsent[step].obtain_consent) {
        let words = analysisJSON.issues[step].name_actions.map(action => action.word)
        consentWords = consentWords.concat(words)
      }
    }
    return consentWords
  }
  get conversionTypeOptions () {
    let options = [...this.conversionTypes].filter(type => type.shortlist)
    let n = 3

    if (this.conversionTypeAddToSelect) {
      this.conversionTypeAddToSelect.rank = 4
      options = options.concat(this.conversionTypeAddToSelect)
      n = 4
    }
    options = options.concat({ text: 'View All Conversions', value: 'INFO', rank: n })
    return options.sort((a, b) => {
      if (a.rank < b.rank) {
        return -1
      }
      if (a.rank > b.rank) {
        return 1
      }
      return 0
    })
  }
  get designationItems () {
    if (this.entity_type_cd && $designations[this.entity_type_cd]) {
      let { words } = $designations[this.entity_type_cd]
      return words.map(des => ({ value: des, text: des }))
    }
    return []
  }
  get designationObject () {
    if (this.entity_type_cd && $designations[this.entity_type_cd]) {
      return $designations[this.entity_type_cd]
    }
    return ''
  }
  get entityTypesBC (): Array<EntityI> {
    try {
      let generateEntities = (entities) => {
        let output = []
        for (let entity of entities) {
          let obj = this.entityTypesBCData.find(ent => ent.value === entity)
          // "CR" type is shortlisted. if CR exists in filtered entity_types, preserve its rank and shortlist keys
          if (entity === 'CR') {
            output.push(obj)
            continue
          }
          let objSansRankAndShortlist = {}
          for (let key in obj) {
            if (!['shortlist', 'rank'].includes(key)) {
              objSansRankAndShortlist[key] = obj[key]
            }
          }
          output.push(objSansRankAndShortlist)
        }
        // but we must have at least one shortlist item.  this will kick in when CR is not one of the filtered entities
        if (!output.some(ent => ent.rank === 1)) {
          output[0]['rank'] = 1
          output[0]['shortlist'] = true
        }
        return output
      }
      // see 'src/store/list-data/request-action-mapping.ts'
      let mapping: RequestActionMappingI = bcMapping
      let cds = Object.keys(mapping)
      if (cds.includes(this.request_action_cd)) {
        return generateEntities(mapping[this.request_action_cd])
      }
      return this.entityTypesBCData
    } catch (error) {
      console.error('entityTypesBC() =', error) // eslint-disable-line no-console
      return this.entityTypesBCData
    }
  }
  get entityTypesXPRO (): Array<EntityI> {
    let { entityTypesXPROData } = this
    if (this.location === 'CA') {
      entityTypesXPROData = entityTypesXPROData.filter(ent => ent.value !== 'RLC')
    }
    try {
      let generateEntities = (entities) => {
        let output = []
        for (let entity of entities) {
          // using this.entityTypesXPROData instead of scoped entityTypesXPROData here so that RLC can be included
          let obj = this.entityTypesXPROData.find(ent => ent.value === entity)
          // "CR" type is shortlisted. if XCR exists in filtered entity_types, preserve its rank and shortlist keys
          if (entity === 'XCR') {
            output.push(obj)
            continue
          }
          if (this.location === 'CA' && entity === 'RLC') {
            continue
          }
          let objSansRankAndShortlist = {}
          for (let key in obj) {
            if (!['shortlist', 'rank'].includes(key)) {
              objSansRankAndShortlist[key] = obj[key]
            }
          }
          output.push(objSansRankAndShortlist)
        }
        // but we must have at least one shortlist item.  this will kick in when XCR is not one of the filtered entities
        if (!output.some(ent => ent.rank === 1)) {
          output[0]['rank'] = 1
          output[0]['shortlist'] = true
        }
        return output
      }
      // see 'src/store/list-data/request-action-mapping.ts'
      let mapping: RequestActionMappingI = xproMapping
      let cds = Object.keys(mapping)

      if (cds.includes(this.request_action_cd)) {
        return generateEntities(mapping[this.request_action_cd])
      }
      return entityTypesXPROData
    } catch (error) {
      console.error('entityTypesXPRO() =', error) // eslint-disable-line no-console
      return entityTypesXPROData
    }
  }
  get entityTextFromValue () {
    if (this.entity_type_cd) {
      let list = [...this.entityTypesBC, ...this.entityTypesXPRO]
      let type = list.find(t => t.value === this.entity_type_cd)
      return type?.text
    }
    return ''
  }
  get locationText () {
    return this.locationOptions.find(options => options.value === this.location)?.text
  }
  get isXproMras () {
    return (['CA', 'IN'].includes(this.location) && this.request_action_cd !== 'MVE')
  }
  get requestText () {
    return this.requestActions.find(options => options.value === this.request_action_cd)?.text
  }
  get entityTypeOptions () {
    let bcOptions: SelectOptionsI[] = this.entityTypesBC.filter(x => {
      if (this.request_action_cd === 'REH' && this.location === 'BC') {
        // Shortlist order: Limited company, Cooperative association
        if (x.value === 'CP') {
          x.shortlist = true
          x.rank = 2
        } else if (['FR', 'GP', 'UL'].includes(x.value)) {
          x.shortlist = null
          x.rank = null
        }
      } else if (this.request_action_cd === 'AML' && this.location === 'BC') {
        // Shortlist order: Limited company, Unlimited liability company
        if (x.value === 'UL') {
          x.shortlist = true
          x.rank = 2
        } else if (['FR', 'GP', 'CP'].includes(x.value)) {
          x.shortlist = null
          x.rank = null
        }
      } else {
        // Shortlist order: Limited Company, Sole proprietorship, General partnership
        if (['UL', 'CP'].includes(x.value)) {
          x.shortlist = null
          x.rank = null
        } else if (x.value === 'FR') {
          x.shortlist = true
          x.rank = 2
        } else if (x.value === 'GP') {
          x.shortlist = true
          x.rank = 3
        }
      }
      if (x.shortlist) {
        return x
      }
    })
    let xproOptions: SelectOptionsI[] = this.entityTypesXPRO.filter(x => {
      if (this.request_action_cd === 'NEW' && ['CA', 'IN'].includes(this.location)) {
        // Shortlist order: Limited company, Limited partnership
        if (x.value === 'XLP') {
          x.shortlist = true
          x.rank = 2
        } else if (x.value === 'XCP') {
          x.shortlist = null
          x.rank = null
        }
      } else if (this.request_action_cd === 'MVE' && ['CA', 'IN'].includes(this.location)) {
        // Shortlist order: Limited company, Cooperative association
        if (x.value === 'XLP') {
          x.shortlist = null
          x.rank = null
        } else if (x.value === 'XCP') {
          x.shortlist = true
          x.rank = 2
        }
      } else if (this.request_action_cd === 'CHG' && ['CA', 'IN'].includes(this.location)) {
        // Shortlist order: Limited company, Limited partnership, Limited liability partnership
        if (x.value === 'XLP') {
          x.shortlist = true
          x.rank = 2
        } else if (x.value === 'XLL') {
          x.shortlist = true
          x.rank = 3
        } else if (x.value === 'XCP') {
          x.shortlist = null
          x.rank = null
        }
      }
      if (x.shortlist) {
        return x
      }
    })
    let options: SelectOptionsI[] = this.location === 'BC' ? [...bcOptions] : [...xproOptions]
    let n = 4

    if (this.entityTypeAddToSelect) {
      this.entityTypeAddToSelect.rank = 4
      options = options.concat(this.entityTypeAddToSelect)
      n = 5
    }
    options = options.concat({ text: 'View all business types', value: 'INFO', rank: n })

    return options.sort((a, b) => {
      if (a.rank < b.rank) {
        return -1
      }
      if (a.rank > b.rank) {
        return 1
      }
      return 0
    })
  }
  get isAssumedName () {
    return !!this.assumedNameOriginal
  }
  get locationOptions () {
    // To save template conditional logic, some locations have duplicate descriptions to align with there request
    let options = [
      { text: 'BC', value: 'BC' },
      {
        text: 'Extraprovincial (Canada based)',
        altText: 'Canadian',
        value: 'CA',
        blurbs: [
          `Your existing business is currently located in any Province or Territory other than BC.`,
          `Your existing business is currently located in any Province or Territory other than BC.`,
          `One or more of the businesses that need to be restored or reinstated are based in Canada and were 
           extraprovincially registered in BC.`,
          `One or more of the businesses that have amalgamated are Canadian and are extraprovincially 
           registered in BC.`,
          `Your existing Canada based business is extraprovincially registered in BC and has changed its name in the 
           home jurisdiction.`
        ]
      },
      {
        text: 'Extraprovincial (Internationally based)',
        altText: 'International',
        value: 'IN',
        blurbs: [
          `Your existing business is currently located outside of Canada.`,
          `Your existing business is currently located outside of Canada.`,
          `One or more of the businesses that need to be restored or reinstated are internationally based and 
           were extraprovincially registered in BC.`,
          `One or more of the businesses that have amalgamated are internationally based and are extra 
           provincially registered in BC.`,
          `Your existing internationally based business is extraprovincially registered in BC and has changed its name 
           in the home jurisdiction.`
        ]
      }
    ]
    if (['CNV'].includes(this.request_action_cd)) {
      return options.filter(location => location.value === 'BC')
    }
    if (['ASSUMED'].includes(this.request_action_cd)) {
      return options.filter(location => location.value !== 'BC')
    }
    if (['MVE'].includes(this.request_action_cd)) {
      let moveOptions = options.filter(location => location.value !== 'BC')
      return moveOptions.map(x => ({ ...x, text: x.altText }))
    }
    return options
  }
  get nameIsSlashed () {
    if (this.name) {
      let { name } = this
      if (name.includes('/') && name.split('/').length === 2) {
        name = name.replace(/(\s+|(?=.))\/(\s+|(?=.))/g, '/')
        let leftSideWords = name.split('/')[0].split(' ')
        let rightSideWords = name.split('/')[1].split(' ')
        if (leftSideWords.length >= 2 && rightSideWords.length >= 2) {
          return true
        }
      }
    }
    return false
  }

  get nrId () {
    const { nr } = this
    let nrId
    if (nr) {
      nrId = nr.id
    }
    return nrId
  }
  get nrNum () {
    const { nr } = this
    let nrNum
    if (nr) {
      nrNum = nr.nrNum
    }
    return nrNum
  }
  get nrState () {
    const { nr } = this
    let state
    if (nr) {
      state = nr.state
    }
    return state
  }
  get pickEntityTableBC () {
    let categories = []
    for (let type of this.entityTypesBC) {
      let i = categories.indexOf(type.cat)
      if (i === -1) {
        categories.push(type.cat)
      }
    }
    const getEntities = (category) => {
      return this.entityTypesBC.filter(type => type.cat === category)
    }
    let output = categories.map(cat =>
      ({
        text: cat,
        entities: getEntities(cat)
      })
    )
    return output
  }
  get pickEntityTableXPRO () {
    let categories = []
    for (let type of this.entityTypesXPRO) {
      let i = categories.indexOf(type.cat)
      if (i === -1) {
        categories.push(type.cat)
      }
    }
    const getEntities = (category) => {
      return this.entityTypesXPRO.filter(type => type.cat === category)
    }
    let output = categories.map(cat =>
      ({
        text: cat,
        entities: getEntities(cat)
      })
    )
    return output
  }
  get requestTextFromValue () {
    if (this.request_action_cd) {
      return this.requestTypeOptions.find(req => req.value === this.request_action_cd).text
    }
    return null
  }
  get requestTypeOptions () {
    let option = this.requestActions.find(type => type.value === 'NEW')
    option.rank = 1
    let options = [option]
    let n = 2
    if (this.extendedRequestType) {
      this.extendedRequestType.rank = 2
      options.push(this.extendedRequestType)
      n = 3
    }
    let { requestTypeCd } = this.nr
    if (this.editMode && ['AS', 'AL', 'XASO', 'XCASO', 'UA'].includes(requestTypeCd)) {
      options.push({ text: 'Assume an', value: 'ASSUMED', rank: n })
      n++
    }
    options.push({ text: 'View All Request Actions', value: 'INFO', rank: n })

    return options.sort((a, b) => {
      if (a.rank < b.rank) {
        return -1
      }
      if (a.rank > b.rank) {
        return 1
      }
      return 0
    })
  }
  get splitNameDesignation (): NameDesignationI {
    if (this.name && this.designationObject && this.designationObject.end) {
      let { words } = this.designationObject
      for (let word of words) {
        if (this.name.endsWith(word)) {
          let designation = word
          let name = this.name.replace(word, '')
          name = name.trim()
          return ({ name, designation })
        }
      }
    }
    return ({
      name: '',
      designation: ''
    })
  }
  get xproRequestTypeCd () {
    if (this.isAssumedName) {
      switch (this.entity_type_cd) {
        case 'RLC':
          return 'AL'
        case 'XCR':
          return 'AS'
        default:
          return ''
      }
    }
    return ''
  }
  /**
   * This getter combines the NR response data objects names against nameChoices,
   * which contains the actual form values, building the request object required for a Name.
   * nameChoices are identified by the 'choice' index, which is what we use to map values.
   */
  get conditionalNameReservation (): ConditionalReqI {
    const { applicant, nrData, nrNames } = this
    let names
    if (nrNames && nrNames.length > 0) {
      // If we're updating use these mapped names -> nrRequestNames
      const { nrRequestNames } = this
      names = nrRequestNames
    } else {
      // Otherwise we're creating a new conditional, there won't be a multiple name inputs, build as follows...
      const name: RequestNameI = {
        name: this.name,
        choice: 1,
        designation: this.splitNameDesignation.designation,
        name_type_cd: this.isAssumedName ? 'AS' : 'CO',
        consent_words: this.consentWords.length > 0 ? this.consentWords : '',
        conflict1: this.consentConflicts.name,
        conflict1_num: this.consentConflicts.corpNum ? this.consentConflicts.corpNum : ''
      }

      names = [name]
    }

    const data: ConditionalReqI = {
      applicants: [applicant],
      names: names,
      ...nrData,
      priorityCd: 'N',
      // @ts-ignore TODO: This is not typed correctly!
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd,
      request_type_cd: this.xproRequestTypeCd ? this.xproRequestTypeCd : '',
      stateCd: 'COND-RESERVE',
      english: this.nameIsEnglish,
      nameFlag: this.isPersonsName,
      submit_count: 0,
      ...this.corpNumForReservation
    }
    return data
  }
  get draftNameReservation (): DraftReqI {
    const { nrRequestNames, applicant } = this

    let nrData = {}
    for (let key in this.nrData) {
      if (this.nrData[key]) {
        nrData[key] = this.nrData[key]
      }
    }

    const data: DraftReqI = {
      applicants: [applicant],
      names: nrRequestNames,
      ...nrData,
      priorityCd: this.priorityRequest ? 'Y' : 'N',
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd,
      stateCd: 'DRAFT',
      english: this.nameIsEnglish,
      nameFlag: this.isPersonsName,
      submit_count: 0,
      ...this.corpNumForReservation
    }
    if (this.xproRequestTypeCd) {
      data['request_type_cd'] = this.xproRequestTypeCd
    }
    if (this.isAssumedName) {
      if (!data['additionalInfo']) {
        data['additionalInfo'] = ''
      } else {
        data['additionalInfo'] += '\n\n'
      }
      if (!data['additionalInfo'].includes('*** Registered Name:')) {
        let notice = `*** Registered Name: ${this.assumedNameOriginal} ***`
        data['additionalInfo'] += ' ' + notice
      }
    }
    for (let step in this.requestExaminationOrProvideConsent) {
      if (this.requestExaminationOrProvideConsent[step].obtain_consent ||
        this.requestExaminationOrProvideConsent[step].conflict_self_consent) {
        if (!data['additionalInfo']) {
          data['additionalInfo'] = ''
        }
        if (!data['additionalInfo'].includes('*** Consent will be supplied')) {
          data['additionalInfo'] += '\n\n'
          let notice = `*** Consent will be supplied ***`
          data['additionalInfo'] += ' ' + notice
        }
      }
      if (this.location !== 'BC') {
        if (this.requestExaminationOrProvideConsent[step].obtain_consent ||
          this.requestExaminationOrProvideConsent[step].send_to_examiner) {
          if (!data['additionalInfo']) {
            data['additionalInfo'] = ''
          }
          if (!data['additionalInfo'].includes('*** Legal Name:')) {
            data['additionalInfo'] += '\n\n'
            let notice = `*** Legal Name: ${this.nameChoices.name1} ***`
            data['additionalInfo'] += ' ' + notice
          }
        }
      }
    }
    return data
  }
  get editNameReservation () {
    let { applicant } = this

    let nrData = {}
    for (let key in this.nrData) {
      if (this.nrData[key]) {
        nrData[key] = this.nrData[key]
      }
    }
    let data = {
      applicants: [applicant],
      request_action_cd: this.request_action_cd,
      entity_type_cd: this.entity_type_cd,
      ...nrData,
      ...this.corpNumForEdit
    }
    if (this.xproRequestTypeCd) {
      data['request_type_cd'] = this.xproRequestTypeCd
    }
    if (this.nr.state === 'DRAFT') {
      data['names'] = this.nrRequestNames
    }
    return data
  }
  get jurisdictionText () {
    return this.location === 'CA'
      ? $canJurisdictions.find(jur => jur.value === this.request_jurisdiction_cd)?.text
      : $intJurisdictions.find(jur => jur.value === this.request_jurisdiction_cd)?.text
  }
  get nrNames () {
    const { nr } = this
    let names = []
    if (nr) {
      names = nr.names
    }
    return names
  }
  get nrRequestNames (): RequestNameI[] {
    const { nameChoices, nrNames } = this
    const defaultValues = {
      name_type_cd: this.isAssumedName ? 'AS' : 'CO',
      consent_words: '',
      conflict1: '',
      conflict1_num: ''
    }

    // Check to make sure there are nameChoices that have been set
    const nameChoicesAreSet = (parseNameChoices(nameChoices).length > 0)

    let requestNames = []
    if (nameChoicesAreSet) {
      // We only allow three choices
      let choiceIdx = 1
      while (choiceIdx <= 3) {
        if (nameChoices[`name${choiceIdx}`] as boolean) {
          let combinedName = nameChoices[`name${choiceIdx}`]
          if (($designations[this.entity_type_cd] && $designations[this.entity_type_cd].end)) {
            let des = nameChoices[`designation${choiceIdx}`]
            if (des && !combinedName.endsWith(des)) {
              combinedName = combinedName + ' ' + des
            }
            requestNames.push({
              name: combinedName,
              designation: nameChoices[`designation${choiceIdx}`],
              choice: choiceIdx,
              ...defaultValues
            })
          } else {
            requestNames.push({
              name: combinedName,
              designation: '',
              choice: choiceIdx,
              ...defaultValues
            })
          }
        }
        choiceIdx++
      }
    } else {
      // Just use the 'name' property to fill in the requestName
      if (this.location === 'BC' && $designations[this.entity_type_cd].end) {
        requestNames.push({
          name: this.name,
          designation: this.splitNameDesignation.designation,
          choice: 1,
          ...defaultValues
        })
      } else {
        requestNames.push({
          name: this.name,
          designation: '',
          choice: 1,
          ...defaultValues
        })
      }
    }

    requestNames = requestNames.map((requestName, idx) => {
      if (nrNames) {
        const existingName = nrNames.find(nrName => nrName.choice === requestName.choice)
        if (existingName) {
          return {
            ...existingName,
            // Merge in requestName form values
            ...requestName,
            // Merge conflicts and consent words
            consent_words: !existingName.consent_words
              ? this.consentWords.length > 0 ? this.consentWords : ''
              : existingName.consent_words,
            conflict1: !existingName.conflict1
              ? this.consentConflicts.name
              : existingName.conflict1,
            conflict1_num: existingName.conflict1_num ? existingName.conflict1_num : ''
          } as RequestNameI
        }
      }

      return { ...requestName } as RequestNameI
    })

    return requestNames
  }
  get reservedNameReservation (): ReservedReqI {
    const { applicant, nrData, nrRequestNames } = this

    // TODO: Not sure if this is needed anymore!
    /* const name: RequestNameI = {
     name: this.name,
     choice: 1,
     designation: this.splitNameDesignation.designation,
     name_type_cd: 'CO'
     } */

    const data: ReservedReqI = {
      applicants: [applicant],
      names: nrRequestNames,
      ...nrData,
      priorityCd: 'N',
      // @ts-ignore TODO: This is not typed correctly!
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd,
      stateCd: 'RESERVED',
      english: this.nameIsEnglish,
      nameFlag: this.isPersonsName,
      submit_count: 0,
      ...this.corpNumForReservation
    }
    return data
  }
  /** Map the appropriate Blurb based on the request action and location */
  get entityBlurbs (): any {
    switch (this.request_action_cd) {
      // NEW REQUEST
      case 'NEW':
        if (['BC'].includes(this.location)) {
          return this.entityTypesBCData
        }
        if (['CA'].includes(this.location)) {
          return this.entityTypesXPROData
        }
        if (['IN'].includes(this.location)) {
          return this.entityTypesXPROData.map(x => ({ ...x, blurbs: x.intBlurbs }))
        }
        break
      // MOVE REQUEST
      case 'MVE':
        if (['CA', 'IN'].includes(this.location)) {
          return this.entityTypesXPROData.map(x => ({ ...x, blurbs: x.mveBlurbs }))
        }
        break
      // RESTORE OR REINSTATE REQUEST
      case 'REH':
        if (['BC'].includes(this.location)) {
          return this.entityTypesBCData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
        }
        if (['CA', 'IN'].includes(this.location)) {
          return this.entityTypesXPROData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
        }
        break
      // AMALGAMATE REQUEST
      case 'AML':
        if (['BC'].includes(this.location)) {
          return this.entityTypesBCData.map(x => ({ ...x, blurbs: x.amlBlurbs }))
        }
        if (['CA'].includes(this.location)) {
          return this.entityTypesXPROData.map(x => ({ ...x, blurbs: x.amlBlurbs[0] }))
        }
        if (['IN'].includes(this.location)) {
          // If international blurb is the same as national, map that blurb
          return this.entityTypesXPROData.map(x => ({ ...x, blurbs: x.amlBlurbs[1] || x.amlBlurbs[0] }))
        }
        break
      // CHANGE NAME REQUEST
      case 'CHG':
        if (['BC'].includes(this.location)) {
          return this.entityTypesBCData.map(x => ({ ...x, blurbs: x.chgBlurbs }))
        }
        if (['CA'].includes(this.location)) {
          return this.entityTypesXPROData.map(x => ({ ...x, blurbs: x.chgBlurbs[0] }))
        }
        if (['IN'].includes(this.location)) {
          // If international blurb is the same as national, map that blurb
          return this.entityTypesXPROData.map(x => ({ ...x, blurbs: x.chgBlurbs[1] || x.chgBlurbs[0] }))
        }
        break
      // CONVERSION REQUEST
      case 'CNV':
        if (['BC'].includes(this.location)) {
          return this.conversionTypes
        }
        break
      default:
        return ''
    }
    return ''
  }
  @Action
  setActiveComponent (component: string) {
    enum Tabs {
      NewSearch,
      ExistingRequestSearch
    }
    if (typeof Tabs[component] === 'number') {
      this.mutateTabNumber(Tabs[component])
      this.mutateDisplayedComponent('Tabs')
      return
    }

    enum SubmissionTabs {
      EntityNotAutoAnalyzed,
      NamesCapture,
      ApplicantInfo1,
      ApplicantInfo2,
      ApplicantInfo3 = ApplicantInfo2,
      InvalidActionMessage,
      Timeout
    }
    if (typeof SubmissionTabs[component] === 'number') {
      this.mutateSubmissionTabNumber(SubmissionTabs[component])
      this.mutateDisplayedComponent('SubmissionTabs')
      return
    }
    /*
     component can be:
     "AnalyzeCharacters",
     "AnalyzePending",
     "AnalyzeResults",
     "ExistingRequestDisplay",
     "ExistingRequestEdit",
     "LowerContainer",
     "SearchPending",
     "Stats",
     "Success"
     */
    this.mutateDisplayedComponent(component)
  }
  @Action
  async getAddressDetails (id) {
    const url = 'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json3.ws'
    let params = {
      Key: canadaPostAPIKey,
      Id: id
    }

    try {
      let resp = await axios.post(url, qs.stringify(params), {
        headers: { 'Content-type': 'application/x-www-form-urlencoded' }
      })
      if (resp.data.Items && Array.isArray(resp.data.Items)) {
        let addressData = resp.data.Items.find(item => item.Language === 'ENG')
        let canadaPostFieldsMapping = {
          CountryIso2: 'countryTypeCd',
          PostalCode: 'postalCd',
          ProvinceCode: 'stateProvinceCd',
          City: 'city',
          Line1: 'addrLine1',
          Line2: 'addrLine2'
        }
        for (let ln of ['2', '3']) {
          if (!addressData[`Line${ln}`]) {
            this.mutateApplicant({ key: `addrLine${ln}`, value: '' })
          }
        }
        if (addressData['ProvinceCode']) {
          if (addressData['ProvinceCode'].length > 2) {
            this.mutateApplicant({ key: 'stateProvinceCd', value: '' })
            if (!addressData['ProvinceName']) {
              canadaPostFieldsMapping['ProvinceCode'] = 'addrLine3'
            } else {
              delete canadaPostFieldsMapping.ProvinceCode
              canadaPostFieldsMapping['ProvinceName'] = 'addrLine3'
            }
          }
        } else {
          delete canadaPostFieldsMapping.ProvinceCode
          this.mutateApplicant({ key: 'stateProvinceCd', value: '' })
          if (addressData['ProvinceName']) {
            canadaPostFieldsMapping['ProvinceName'] = 'addrLine3'
          }
        }
        let fields = Object.keys(canadaPostFieldsMapping)
        for (let field of fields) {
          if (addressData[field]) {
            let value = addressData[field].toUpperCase()
            let mappedField = canadaPostFieldsMapping[field]
            this.mutateApplicant({ key: mappedField, value })
          }
        }
      }
      return
    } catch (error) {
      console.log('getAddressDetails() =', error) // eslint-disable-line no-console
    }
  }
  @Action
  async getAddressSuggestions (appKV) {
    if (!appKV.value) {
      return
    }
    const url = 'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws'
    let params = {
      Key: canadaPostAPIKey,
      SearchTerm: appKV.value,
      MaxSuggestions: 3,
      Country: this.applicant.countryTypeCd
    }
    try {
      let resp = await axios.post(url, qs.stringify(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      if (Array.isArray(resp.data.Items)) {
        let filteredItems = resp.data.Items.filter(item => item.Next === 'Retrieve')
        if (this.applicant.addrLine1) {
          this.mutateAddressSuggestions(filteredItems)
        }
        return
      }
      this.mutateAddressSuggestions(null)
      return
    } catch (error) {
      console.log('getAddressSuggestions() =', error) // eslint-disable-line no-console
    }
  }
  @Action
  async getNameAnalysis () {
    try {
      this.mutateDisplayedComponent('AnalyzePending')
      this.resetRequestExaminationOrProvideConsent()

      const params: NewRequestNameSearchI = {
        name: this.name,
        location: this.location,
        // @ts-ignore TODO: This is not typed correctly!
        entity_type_cd: this.entity_type_cd,
        request_action_cd: this.request_action_cd
      }
      const { CancelToken } = axios
      const source = CancelToken.source()

      const resp = await axios.get('name-analysis', {
        params,
        cancelToken: source.token,
        timeout: ANALYSIS_TIMEOUT_MS
      })

      const json = resp.data
      this.mutateAnalysisJSON(json)
      if (Array.isArray(json.issues) && json.issues.length > 0) {
        let corpConflict = json.issues.find(issue => issue.issue_type === 'corp_conflict')
        if (corpConflict && Array.isArray(corpConflict.conflicts) && corpConflict.conflicts.length > 0) {
          let firstConflict = corpConflict.conflicts[0]
          if (firstConflict.id) {
            this.mutateConflictId(firstConflict.id)
          }
        }
      }
      this.mutateDisplayedComponent('AnalyzeResults')
    } catch (error) {
      console.error('getNameAnalysis() =', error) // eslint-disable-line no-console
      // FUTURE: fix error handling in case of network error (#5898)
      // (should not display "send to examination")
      if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error') {
        this.mutateNameAnalysisTimedOut(true)
        this.mutateName(this.name)
        this.mutateDisplayedComponent('SendToExamination')
        return
      }
      if (this.userCancelledAnalysis) {
        this.setActiveComponent('NamesCapture')
        return
      }
      this.mutateDisplayedComponent('Tabs')
    }
  }
  @Action
  async getNameAnalysisXPRO () {
    try {
      this.mutateDisplayedComponent('AnalyzePending')
      this.resetRequestExaminationOrProvideConsent()

      const params: NewRequestNameSearchI = {
        name: this.name,
        location: this.location,
        // @ts-ignore TODO: This is not typed correctly!
        entity_type_cd: this.entity_type_cd,
        request_action_cd: this.request_action_cd
      }
      const { CancelToken } = axios
      const source = CancelToken.source()

      const resp = await axios.get('/xpro-name-analysis', {
        params,
        cancelToken: source.token,
        timeout: ANALYSIS_TIMEOUT_MS
      })

      const json = resp.data
      this.mutateAnalysisJSON(json)
      if (Array.isArray(json.issues) && json.issues.length > 0) {
        let corpConflict = json.issues.find(issue => issue.issue_type === 'corp_conflict')
        if (corpConflict && Array.isArray(corpConflict.conflicts) && corpConflict.conflicts.length > 0) {
          let firstConflict = corpConflict.conflicts[0]
          if (firstConflict.id) {
            this.mutateConflictId(firstConflict.id)
          }
        }
      }
      this.mutateDisplayedComponent('AnalyzeResults')
    } catch (error) {
      console.error('getNameAnalysisXPRO() =', error) // eslint-disable-line no-console
      // FUTURE: fix error handling in case of network error (#5898)
      // (should not display "send to examination")
      if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error') {
        this.mutateNameAnalysisTimedOut(true)
        this.mutateName(this.name)
        this.mutateDisplayedComponent('SendToExamination')
        return
      }
      if (this.userCancelledAnalysis) {
        this.setActiveComponent('NamesCapture')
        return
      }
      this.mutateDisplayedComponent('Tabs')
    }
  }

  /**
   * Confirms whether the specified action is allowed.
   * @param action the action to confirm
   * @returns True if confirmed, otherwise False
   */
  @Action
  async confirmAction (action: string): Promise<boolean> {
    try {
      const nrData = await this.getNameRequest(this.nr.id)
      if (!nrData) throw new Error('Got error from getNameRequest()')
      this.setNrResponse(nrData)
      return Boolean(nrData.actions.includes(action))
    } catch (error) {
      console.error('confirmAction() =', error) // eslint-disable-line no-console
      await errorModule.setAppError(
        { id: 'confirm-action-error', error: 'Could not confirm action' }
      )
      return false
    }
  }

  @Action
  async findNameRequest (): Promise<void> {
    try {
      this.resetAnalyzeName()
      this.mutateDisplayedComponent('SearchPending')

      const params: ExistingRequestSearchI = {
        nrNum: this.existingRequestSearch.nrNum,
        phoneNumber: this.existingRequestSearch.phoneNumber,
        emailAddress: this.existingRequestSearch.emailAddress
      }
      const { CancelToken } = axios
      const source = CancelToken.source()

      const resp = await axios.get('/namerequests', {
        params,
        cancelToken: source.token
      })

      if (!resp || !resp.data || resp.data.length === 0) {
        this.mutateNameRequest(
          {
            text: 'No records were found that match the information you entered.<br>' +
              'Please verify the NR Number and the phone / email and try again.',
            failed: true
          }
        )
        // go back to calling page
        this.mutateDisplayedComponent('Tabs')
        return
      }
      this.mutateNameRequest(resp.data)
      this.mutateDisplayedComponent('ExistingRequestDisplay')
    } catch (error) {
      console.error('findNameRequest(), error =', error) // eslint-disable-line no-console
      this.mutateNameRequest(
        {
          text: 'A network error occurred. Please check your network connection and try again.',
          failed: true
        }
      )
      // go back to calling page
      this.mutateDisplayedComponent('Tabs')
    }
  }

  @Action
  async addRequestActionComment (data) {
    try {
      let requestAction = this.requestActionOriginal || this.request_action_cd
      let { shortDesc } = this.requestActions.find(request => request.value === requestAction)
      let msg = `*** ${shortDesc} ***`
      if (!data['additionalInfo']) {
        // if data.additionalInfo is empty, just assign it to message
        data['additionalInfo'] = msg
        return data
      }
      if (data['additionalInfo'].includes(msg)) {
        // if message is already part of additionalInfo, do nothing, return
        return data
      }
      // by here we know there is some text in additionalInfo but it does not contain the exact msg we must add
      // so we check if there is a previous request_action message which no longer matches msg because we are editing
      let allShortDescs = this.requestActions.map(request => `*** ${request.shortDesc} ***`)
      if (allShortDescs.some(desc => data['additionalInfo'].includes(desc))) {
        let desc = allShortDescs.find(sd => data['additionalInfo'].includes(sd))
        data['additionalInfo'] = data['additionalInfo'].replace(desc, msg)
        return data
      }
      // if there is no previous request_action message then we just preserve whatever text there is and append msg
      data['additionalInfo'] += ` \n\n ${msg}`
      return data
    } catch (error) {
      console.error('addRequestActionComment() =', error) // eslint-disable-line no-console
      await errorModule.setAppError(
        { id: 'add-request-action-error', error: 'An error occurred when building the name request' }
      )
      return null
    }
  }

  /**
   * Fetches an existing NR from the API.
   * NB: To store the returned NR object into app state, use loadExistingNameRequest().
   * @param nrId the NR id
   * @returns the NR object (or null in case of error)
   */
  @Action
  async getNameRequest (nrId: number): Promise<any> {
    try {
      const response = await axios.get(`/namerequests/${nrId}`, {
        headers: { 'Content-Type': 'application/json' }
      })
      return response.data
    } catch (error) {
      console.error('getNameRequest() =', error) // eslint-disable-line no-console
      await errorModule.setAppError(
        { id: 'fetch-name-request-error', error: 'Could not fetch name request' }
      )
      return null
    }
  }

  /**
   * Stores NR data into app state and displays the ExistingRequestDisplay component.
   * NB: To fetch the NR from the API, use getNameRequest().
   * @param nrData the NR data object
   */
  @Action
  async loadExistingNameRequest (nrData: any) {
    const handleEmptyResults = () => {
      this.mutateNameRequest(
        {
          text: 'No records were found that match the information you entered.<br>' +
            'Please verify the NR Number and the phone / email and try again.',
          failed: true
        }
      )
      this.mutateDisplayedComponent('Tabs')
    }

    const handleResults = (data) => {
      const { names } = data
      this.resetApplicantDetails()
      this.setNrResponse(data)
      this.updateReservationNames(names)

      // this.mutateNameRequest(data)
      this.mutateDisplayedComponent('ExistingRequestDisplay')
    }

    if (!nrData) {
      handleEmptyResults()
    } else {
      handleResults(nrData)
    }
  }

  @Action
  async getStats () {
    try {
      let resp = await axios.get('/statistics')
      this.mutateStats(resp.data)
    } catch (error) {
      console.error('getStats() =', error) // eslint-disable-line no-console
    }
  }

  @Action
  async checkoutNameRequest (): Promise<boolean> {
    try {
      const { nrId } = this
      const checkedOutBy = sessionStorage.getItem('checkedOutBy')
      const checkedOutDt = sessionStorage.getItem('checkedOutDt')

      let response: any
      if (checkedOutBy) {
        response = await axios.patch(`/namerequests/${nrId}/checkout`, {
          checkedOutBy: checkedOutBy,
          checkedOutDt: checkedOutDt
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } else {
        response = await axios.patch(`/namerequests/${nrId}/checkout`, {}, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }

      const data = response.data || { checkedOutBy: null, checkedOutDt: null }
      sessionStorage.setItem('checkedOutBy', data.checkedOutBy)
      sessionStorage.setItem('checkedOutDt', data.checkedOutDt)
      return true
    } catch (err) {
      console.error('checkoutNameRequest() =', err) // eslint-disable-line no-console
      await handleApiError(err, 'Could not check out the name request').catch(async error => {
        if (error instanceof ApiError) {
          await errorModule.setAppError(
            { id: 'checkout-name-requests-api-error', error: error.message } as ErrorI
          )
        } else {
          await errorModule.setAppError(
            { id: 'checkout-name-requests-error', error: error.message } as ErrorI
          )
        }
      })
      return false
    }
  }

  @Action
  async checkinNameRequest (): Promise<boolean> {
    try {
      const { nrId } = this
      const checkedOutBy = sessionStorage.getItem('checkedOutBy')
      const checkedOutDt = sessionStorage.getItem('checkedOutDt')

      if (checkedOutBy) {
        await axios.patch(`/namerequests/${nrId}/checkin`, {
          checkedOutBy: checkedOutBy,
          checkedOutDt: checkedOutDt
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        sessionStorage.removeItem('checkedOutBy')
        sessionStorage.removeItem('checkedOutDt')

        return true
      }
    } catch (err) {
      console.error('checkinNameRequest() =', err) // eslint-disable-line no-console
      await handleApiError(err, 'Could not check in the name request').catch(async error => {
        if (error instanceof ApiError) {
          await errorModule.setAppError(
            { id: 'checkin-name-requests-api-error', error: error.message } as ErrorI
          )
        } else {
          await errorModule.setAppError(
            { id: 'checkin-name-requests-error', error: error.message } as ErrorI
          )
        }
      })
      return false
    }
  }

  @Action
  async patchNameRequests (): Promise<boolean> {
    try {
      const { nrId } = this
      const nr = this.editNameReservation
      const requestData = nr && await this.addRequestActionComment(nr)

      const response = requestData && await axios.patch(`/namerequests/${nrId}/edit`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this.mutateNameRequest(response.data)
      this.mutateDisplayedComponent('Success')
      return true
    } catch (err) {
      console.error('patchNameRequests() =', err) // eslint-disable-line no-console
      await handleApiError(err, 'Could not update the name request').catch(async error => {
        if (error instanceof ApiError) {
          await errorModule.setAppError({ id: 'patch-name-requests-api-error', error: error.message } as ErrorI)
        } else {
          await errorModule.setAppError({ id: 'patch-name-requests-error', error: error.message } as ErrorI)
        }
      })
      return false
    }
  }

  @Action
  async patchNameRequestsByAction (action: NrAction): Promise<boolean> {
    try {
      const { nrId } = this
      const response = await axios.patch(`/namerequests/${nrId}/${action}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this.mutateNameRequest(response.data)
      this.mutateDisplayedComponent('Success')
      return true
    } catch (err) {
      console.error('patchNameRequestsByAction() =', err) // eslint-disable-line no-console
      await handleApiError(err, 'Could not update the name request').catch(async error => {
        if (error instanceof ApiError) {
          await errorModule.setAppError(
            { id: 'patch-name-requests-by-action-api-error', error: error.message } as ErrorI
          )
        } else {
          await errorModule.setAppError(
            { id: 'patch-name-requests-by-action-error', error: error.message } as ErrorI
          )
        }
      })
      return false
    }
  }

  @Action({ root: true })
  async postNameRequests (type: string): Promise<boolean> {
    if (this.isAssumedName) type = 'assumed'
    try {
      let data: any
      switch (type) {
        case 'assumed':
        case 'draft':
          data = this.draftNameReservation
          break
        case 'conditional':

          data = this.conditionalNameReservation
          break
        case 'reserved':
          data = this.reservedNameReservation
          break
      }

      const requestData: any = data && await this.addRequestActionComment(data)
      try {
        const response: AxiosResponse = requestData && await axios.post(`/namerequests`, requestData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.setNrResponse(response.data)

        const { dispatch } = this.context
        // Set rollback on expire for new NRs
        await dispatch(types.SET_ROLLBACK_ON_EXPIRE, true)
        // Check in on expire is for existing NRs, make sure it isn't set!
        await dispatch(types.SET_CHECK_IN_ON_EXPIRE, false)
        return true
      } catch (err) {
        console.error('postNameRequests() =', err) // eslint-disable-line no-console
        await handleApiError(err, 'Could not create the name request')
        return false
      }
    } catch (error) {
      console.error('postNameRequests() =', error) // eslint-disable-line no-console
      if (error instanceof ApiError) {
        await errorModule.setAppError({ id: 'post-name-requests-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'post-name-requests-error', error: error.message } as ErrorI)
      }
      return false
    }
  }
  @Action
  async putNameReservation (nrId) {
    let { nrState } = this
    if (this.isAssumedName) nrState = 'ASSUMED'

    try {
      let data: any
      switch (nrState) {
        case 'DRAFT':
          data = this.draftNameReservation
          break
        case 'COND-RESERVE':
          data = this.conditionalNameReservation
          break
        case 'RESERVED':
          data = this.reservedNameReservation
          break
        case 'ASSUMED':
          data = this.editNameReservation
          break
      }
      if (this.showCorpNum && this.corpNum) {
        data['corpNum'] = this.corpNum
      }

      const requestData = data && await this.addRequestActionComment(data)

      try {
        const response = requestData && await axios.put(`/namerequests/${nrId}`, requestData, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        this.setNrResponse(response.data)
        return true
      } catch (err) {
        console.error('putNameReservation() =', err) // eslint-disable-line no-console
        await handleApiError(err, 'Could not update the name request')
      }
    } catch (error) {
      console.error('putNameReservation() =', error) // eslint-disable-line no-console
      if (error instanceof ApiError) {
        await errorModule.setAppError({ id: 'put-name-requests-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'put-name-requests-error', error: error.message } as ErrorI)
      }
      return false
    }
  }
  @Action
  async completePayment ({ nrId, paymentId, action }): Promise<NameRequestPayment> {
    // TODO: Type the param!
    // TODO: In completePayment, generate a temp UUID or nonce
    //  that gets passed to the NR Payment API

    const paymentResponse: NameRequestPayment = {
      paymentSuccess: false
    }

    try {
      const response = await axios.patch(`/payments/${nrId}/payment/${paymentId}/${action}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 200) {
        paymentResponse.payment = response.data
        paymentResponse.httpStatusCode = response.status.toString()
        paymentResponse.paymentSuccess = true
      } else {
        paymentResponse.httpStatusCode = response.status.toString()
        paymentResponse.paymentSuccess = false
      }

      return paymentResponse
    } catch (error) {
      console.error('completePayment() =', error) // eslint-disable-line no-console
      if (error instanceof ApiError) {
        await errorModule.setAppError({ id: 'complete-payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'complete-payment-error', error: error.message } as ErrorI)
      }
    }
  }
  @Action
  async rollbackNameRequest ({ nrId, action }): Promise<any> {
    try {
      const validRollbackActions = [
        ROLLBACK_ACTIONS.CANCEL
      ]

      if (validRollbackActions.indexOf(action) === -1) return
      const response = await axios.patch(`/namerequests/${nrId}/rollback/${action}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.status !== 200) {
        throw new ApiError('Could not rollback or cancel the name request')
      }
    } catch (error) {
      console.error('rollbackNameRequest() =', error) // eslint-disable-line no-console
      if (error instanceof ApiError) {
        await errorModule.setAppError({ id: 'rollback-name-request-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'rollback-name-request-error', error: error.message } as ErrorI)
      }
    }
  }
  @Action
  userClickedStopAnalysis () {
    this.mutateUserCancelledAnalysis(true)
    this.mutateSubmissionType('examination')
  }
  @Action
  resetAnalyzeName () {
    this.clearAssumedNameOriginal()
    if (!this.userCancelledAnalysis) {
      this.mutateAnalysisJSON(null)
    }
    this.mutateCorpNum('')
    this.mutateEditMode(false)
    this.mutateRequestActionOriginal('')
    this.mutateSubmissionType('normal')
    this.mutateShowActualInput(false)
    this.resetApplicantDetails()
    this.resetNrData()
    this.resetRequestExaminationOrProvideConsent()
    this.resetNameChoices()
    this.mutateNameRequest({})
    this.mutateNameAnalysisTimedOut(false)
  }
  @Action
  cancelAnalyzeName (destination: string) {
    if (source && source.cancel) {
      source.cancel()
      source = null
    }
    if (destination === 'Tabs') {
      this.mutateName(this.nameOriginal)
      this.mutateUserCancelledAnalysis(false)
    }
    this.setActiveComponent(destination)
    if (destination !== 'NamesCapture') {
      this.resetAnalyzeName()
    }
  }
  @Action
  async cancelEditExistingRequest () {
    this.mutateDisplayedComponent('ExistingRequestDisplay')
    this.resetApplicantDetails()
    this.mutateNameChoicesToInitialState()
    this.mutateName('')
    this.resetNrData()
    this.mutateEditMode(false)
  }
  @Action
  async editExistingRequest () {
    this.mutateEditMode(true)
    this.populateApplicantData()
    this.populateNrData()
    if (['clientFirstName', 'clientLastName', 'contact'].some(field => !!this.nr.applicants[field])) {
      this.mutateActingOnOwnBehalf(false)
    }
    let { entity_type_cd } = this.nr
    if (this.entityTypesBC.some(type => type.value === entity_type_cd)) {
      this.mutateLocation('BC')
    } else if (this.nr.xproJurisdiction) {
      let { xproJurisdiction } = this.nr
      let location: LocationT
      for (let key of ['value', 'text']) {
        if ($canJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
          location = 'CA'
          break
        }
        if ($intJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
          location = 'IN'
          break
        }
      }
      this.mutateLocation(location)
    }
    this.mutateEntityType(entity_type_cd)
    if (!this.entityTypeOptions.some(option => option.value === entity_type_cd)) {
      let obj = this.entityTypesBC.find(entity => entity.value === entity_type_cd)
        ? this.entityTypesBC.find(entity => entity.value === entity_type_cd)
        : this.entityTypesXPRO.find(entity => entity.value === entity_type_cd)
      this.mutateEntityTypeAddToSelect(obj)
    }
    let { requestTypeCd, request_action_cd } = this.nr
    if (['AS', 'AL', 'XASO', 'XCASO', 'UA'].includes(requestTypeCd)) {
      request_action_cd = 'ASSUMED'
    }
    if (request_action_cd !== 'NEW') {
      this.mutateRequestAction(request_action_cd)
      let reqObj = this.requestActions.find(type => type.value === request_action_cd)
      this.mutateExtendedRequestType(reqObj)
    }
    if (this.nr.corpNum) {
      this.mutateCorpNum(this.nr.corpNum)
    }
    if (this.nr.state === 'DRAFT') {
      this.mutateSubmissionTabComponent('NamesCapture')
    } else {
      this.mutateSubmissionTabComponent('ApplicantInfo1')
    }
    this.mutateDisplayedComponent('ExistingRequestEdit')
  }
  @Action({ rawError: true })
  async startAnalyzeName () {
    this.resetAnalyzeName()
    this.mutateUserCancelledAnalysis(false)
    let name
    if (this.name) {
      name = sanitizeName(this.name)
    }
    ['entity_type_cd', 'request_action_cd', 'location'].forEach(field => {
      if (this[field] === 'INFO') {
        this.setErrors(field)
      }
    })
    if (['CA'].includes(this.location) && !['MVE'].includes(this.request_action_cd) && !this.request_jurisdiction_cd) {
      this.setErrors('jurisdiction')
      return
    }
    if (!this.corpSearch) {
      if (!this.name) {
        this.setErrors('name')
        return
      }
      if (this.name.length < 3) {
        this.setErrors('length')
        return
      }
    }
    if (this.errors.length > 0) {
      return
    }
    this.mutateNameOriginal(name) // Set original name for reset baseline
    if (this.isXproMras) {
      this.mutateNRData({ key: 'xproJurisdiction', value: this.jurisdictionText })
      if (!this.noCorpNum) {
        const profile = await this.fetchMRASProfile()
        if (profile) {
          name = sanitizeName(profile?.LegalEntity?.names?.legalName)
          this.mutateName(name)
          this.mutateNRData({ key: 'homeJurisNum', value: this.corpSearch })
        } else {
          this.mutateNoCorpNum(true)
          return
        }
      }
    }
    let testName = this.name.toUpperCase()
    testName = removeExcessSpaces(testName)
    if ((name !== testName) || name.match(/^[\[\]\^*\+-\/\=&\(\)\.,"'#@\!\?;:]/)) {
      this.mutateDisplayedComponent('AnalyzeCharacters')
      this.mutateName(name)
      return
    }
    if (this.nameIsSlashed) {
      this.mutateName(name)
      this.mutateDisplayedComponent('SendToExamination')
      return
    }
    this.mutateName(name)
    if (this.location === 'BC') {
      if (this.nameIsEnglish && !this.isPersonsName && !this.doNotAnalyzeEntities.includes(this.entity_type_cd)) {
        if (['NEW', 'DBA', 'CHG'].includes(this.request_action_cd)) {
          featureFlags.getFlag('disable-analysis')
            ? this.mutateDisplayedComponent('SendToExamination')
            : this.getNameAnalysis()
          return
        }
      }
      this.mutateDisplayedComponent('SendToExamination')
      return
    } else {
      if (['AML', 'CHG', 'DBA', 'MVE', 'NEW', 'REH', 'REN', 'REST'].includes(this.request_action_cd)) {
        if (this.doNotAnalyzeEntities.includes(this.entity_type_cd)) {
          this.mutateDisplayedComponent('SendToExamination')
          return
        }
        featureFlags.getFlag('disable-analysis')
          ? this.mutateDisplayedComponent('SendToExamination')
          : this.getNameAnalysisXPRO()
      }
    }
  }
  @Action
  updateApplicantDetails (appKV) {
    this.mutateApplicant(appKV)
    if (!appKV.value || appKV.key !== 'addrLine1') {
      this.mutateAddressSuggestions(null)
      return
    }
  }
  @Action
  getCorpNum (corpNum: string) {
    if (this.showCorpNum) {
      if (this.showCorpNum === 'mras') {
        return this.checkMRAS(corpNum)
      } else {
        return this.checkCOLIN(corpNum)
      }
    }
  }
  @Action
  checkCOLIN (corpNum: string) {
    // Remove BC prefix as Colin only supports base number with no prefix for BC's
    const cleanedCorpNum = corpNum.replace(/^BC+/i, '')
    let url = `colin/${cleanedCorpNum}`
    return axios.post(url, {})
  }
  @Action
  checkMRAS (corpNum: string) {
    let { xproJurisdiction } = this.nrData
    let { SHORT_DESC } = $canJurisdictions.find(jur => jur.text === xproJurisdiction)

    let url = `mras-profile/${SHORT_DESC}/${this.corpNum}`
    return axios.get(url)
  }

  /** Fetch the MRAS Profile and handle varied responses */
  @Action
  fetchMRASProfile (): Promise<any> {
    let url = `mras-profile/${this.request_jurisdiction_cd}/${this.corpSearch}`
    return axios.get(url).then(response => {
      if (response?.status === 200) {
        return response?.data
      }
    }).catch(error => {
      console.error('fetchMRASProfile() =', error) // eslint-disable-line no-console
      this.mutateName('')
      this.mutateMrasSearchResult(error.response.status)
      this.mutateMrasSearchInfoModalVisible(true)
    })
  }

  @Mutation
  clearErrors () {
    this.errors = []
  }
  @Mutation
  mutateActingOnOwnBehalf (value) {
    this.actingOnOwnBehalf = value
  }
  @Mutation
  mutateAddressSuggestions (value) {
    if (!value) {
      this.addressSuggestions = null
      return
    }
    for (let n = 0; n < value.length; n++) {
      value[n].Text = value[n].Text.toUpperCase()
      value[n].Description = value[n].Description.toUpperCase()
    }
    this.addressSuggestions = Object.assign([], value)
  }
  @Mutation
  mutateAnalysisJSON (json: AnalysisJSONI) {
    this.analysisJSON = json
  }
  @Mutation
  mutateApplicant (appKV) {
    if (Array.isArray(appKV)) {
      for (let address of appKV) {
        address.value = address.value.toUpperCase()
        this.applicant[address.name] = address.value
      }
    }
    if (appKV.key !== 'emailAddress') {
      appKV.value = appKV.value.toUpperCase()
    }
    this.applicant[appKV.key] = appKV.value
  }
  @Mutation
  mutateConflictId (id) {
    this.conflictId = id
  }
  @Mutation
  mutateConversionType (value) {
    this.conversionType = value
  }
  @Mutation
  mutateConversionTypeAddToSelect (value) {
    this.conversionTypeAddToSelect = value
  }
  @Mutation
  mutateCorpNum (corpNum: string) {
    this.corpNum = corpNum
  }
  @Mutation
  mutateCorpSearch (corpNum: string) {
    this.corpSearch = corpNum
  }
  @Mutation
  mutateDisplayedComponent (comp: string) {
    this.displayedComponent = comp
  }
  @Mutation
  mutateEditMode (value) {
    this.editMode = value
  }
  @Mutation
  mutateEntityType (type: string) {
    this.entity_type_cd = type
  }
  @Mutation
  mutateEntityTypeAddToSelect (option: SelectOptionsI) {
    this.entityTypeAddToSelect = option
  }
  @Mutation
  resetEntityTypeAddToSelect () {
    this.entityTypeAddToSelect = null
  }
  @Mutation
  mutateExistingRequestSearch ({ key, value }) {
    this.existingRequestSearch[key] = value
  }
  @Mutation
  mutateExistingRequestSearchToInitialState () {
    this.existingRequestSearch = {
      emailAddress: '',
      nrNum: '',
      phoneNumber: ''
    }
  }
  @Mutation
  mutateExtendedRequestType (option: SelectOptionsI) {
    this.extendedRequestType = option
  }
  @Mutation
  mutateGetNameReservationFailed (value) {
    this.getNameReservationFailed = value
  }
  @Mutation
  mutateHelpMeChooseModalVisible (value: boolean) {
    this.helpMeChooseModalVisible = value
  }
  @Mutation
  mutateIncorporateLoginModalVisible (value: boolean) {
    this.incorporateLoginModalVisible = value
  }
  @Mutation
  mutateAffiliationErrorModalVisible (value: boolean) {
    this.affiliationErrorModalVisible = value
  }
  @Mutation
  mutateIsPersonsName (value) {
    this.isPersonsName = value
  }
  @Mutation
  mutateLocation (location: LocationT) {
    if (location === this.location) {
      return
    }
    if (location === 'INFO') {
      this.location = location
      return
    }
    if (this.location === 'CA' || this.location === 'IN') {
      if (location === 'CA' || location === 'IN') {
        this.location = location
        return
      }
    }
    this.entityTypeAddToSelect = null
    if (location === 'BC') {
      this.entity_type_cd = 'CR'
    } else {
      this.entity_type_cd = 'XCR'
    }
    this.location = location
  }
  @Mutation
  mutateLocationInfoModalVisible (value: boolean) {
    this.locationInfoModalVisible = value
  }
  @Mutation
  mutateMrasSearchResult (code: number) {
    this.mrasSearchResultCode = code
  }
  @Mutation
  mutateMrasSearchInfoModalVisible (value: boolean) {
    this.mrasSearchInfoModalVisible = value
  }
  @Mutation
  mutateJurisdiction (value) {
    this.request_jurisdiction_cd = value
  }
  @Mutation
  mutateName (name: string) {
    this.name = name
  }
  @Mutation
  mutateNameOriginal (name: string) {
    this.nameOriginal = name
  }
  @Mutation
  mutateNoCorpNum (noCorpNum: boolean) {
    this.noCorpNum = noCorpNum
  }
  @Mutation
  mutateNROriginal (nr) {
    this.nrOriginal = nr
  }
  @Mutation
  mutateNameChoices (choiceObj) {
    this.nameChoices[choiceObj.key] = choiceObj.value
  }
  @Mutation
  mutateNameChoicesToInitialState () {
    Vue.set(this, 'nameChoices', {
      name1: '',
      designation1: '',
      name2: '',
      designation2: '',
      name3: '',
      designation3: ''
    })
  }
  @Mutation
  mutateNameIsEnglish (value) {
    this.nameIsEnglish = value
  }
  @Mutation
  mutateNameRequest (nr) {
    this.nr = nr
  }
  @Mutation
  mutateNameRequestByKey (kv) {
    Vue.set(
      this.nr,
      kv.key,
      kv.value
    )
  }
  @Mutation
  mutateNRData ({ key, value }) {
    this.nrData[key] = value
  }
  @Mutation
  mutateNRDataByKey (kv) {
    Vue.set(
      this.nrData,
      kv.key,
      kv.value
    )
  }
  @Mutation
  mutateNrRequiredModalVisible (value: boolean) {
    this.nrRequiredModalVisible = value
  }
  @Mutation
  mutatePickEntityModalVisible (value: boolean) {
    this.pickEntityModalVisible = value
  }
  @Mutation
  mutatePickRequestTypeModalVisible (value: boolean) {
    this.pickRequestTypeModalVisible = value
  }
  @Mutation
  mutatePriorityRequest (value) {
    this.priorityRequest = value
  }
  @Mutation
  mutateRequestAction (action: string) {
    this.request_action_cd = action
    if (action === 'MVE' && this.location === 'BC') {
      this.location = 'CA'
      this.entity_type_cd = 'XCR'
    }
  }
  @Mutation
  mutateRequestExaminationOrProvideConsent ({ index, type, value }) {
    this.requestExaminationOrProvideConsent[index][type] = value
  }
  @Mutation
  mutateShowActualInput (value) {
    this.showActualInput = value
  }
  @Mutation
  mutateStats (stats) {
    this.stats = stats
  }
  @Mutation
  mutateSubmissionTabComponent (comp) {
    enum Components {
      EntityNotAutoAnalyzed,
      NamesCapture,
      ApplicantInfo1,
      ApplicantInfo2
    }
    let tab = parseInt(Components[comp])
    this.submissionTabNumber = tab
  }
  @Mutation
  mutateSubmissionTabNumber (value) {
    this.submissionTabNumber = value
  }
  @Mutation
  mutateSubmissionType (type) {
    this.submissionType = type
  }
  @Mutation
  mutateTabNumber (tab: number) {
    this.tabNumber = tab
  }
  @Mutation
  mutateWaitingAddressSearch (appKV: WaitingAddressSearchI) {
    this.waitingAddressSearch = appKV
  }
  @Mutation
  populateApplicantData () {
    for (let key in this.nr.applicants) {
      Vue.set(
        this.applicant,
        key,
        this.nr.applicants[key]
      )
    }
  }
  @Mutation
  populateNrData () {
    for (let key in this.nrData) {
      if (this.nr[key]) {
        Vue.set(
          this.nrData,
          key,
          this.nr[key]
        )
      }
    }
    this.entity_type_cd = this.nr.entity_type_cd
  }
  @Mutation
  resetEditFormValues () {
    this.nr = this.nrOriginal
  }
  @Mutation
  resetApplicantDetails () {
    for (let key in this.applicant) {
      if (key === 'countryTypeCd') {
        this.applicant[key] = 'CA'
        continue
      }
      this.applicant[key] = ''
    }
  }
  @Mutation
  resetNrData () {
    for (let key in this.nrData) {
      Vue.set(
        this.nrData,
        key,
        ''
      )
    }
  }
  @Mutation
  resetRequestExaminationOrProvideConsent () {
    for (let n of [0, 1, 2]) {
      for (let type of ['send_to_examiner', 'obtain_consent', 'conflict_self_consent']) {
        this.requestExaminationOrProvideConsent[n][type] = false
      }
    }
  }
  @Mutation
  setErrors (value: string) {
    if (Array.isArray(this.errors) && this.errors.length > 0) {
      this.errors = this.errors.concat(value)
      return
    }
    this.errors = [value]
  }
  @Mutation
  setNrResponse (data: any) {
    try {
      this.nr = data

      const { nr } = this
      const { applicants = [] } = nr

      const setApplicantDetails = (applicant) => {
        const data = Object.assign({}, applicant) as ApplicantI
        Object.keys(data as ApplicantI).forEach(key => {
          this.applicant[key] = data[key]
        })
      }

      if (applicants instanceof Array) {
        setApplicantDetails(applicants[0])
      } else if (applicants) {
        setApplicantDetails(applicants)
      }
      // else applicants is null/undefined
    } catch (error) {
      console.error('setNrResponse() =', error) // eslint-disable-line no-console
    }
  }
  @Mutation
  updateReservationNames (nrName: [] = []) {
    const { nameChoices } = this
    nrName.forEach(({ choice, name = '', designation = '' }) => {
      nameChoices[`name${choice}`] = name
      nameChoices[`designation${choice}`] = designation
    })
  }
  @Mutation
  mutateAssumedNameOriginal () {
    this.assumedNameOriginal = this.name
  }
  @Mutation
  mutateRequestActionOriginal (action: string) {
    this.requestActionOriginal = action
  }
  @Mutation
  resetNameChoices () {
    for (let key in this.nameChoices) {
      Vue.set(
        this.nameChoices,
        key,
        ''
      )
    }
  }
  @Mutation
  mutateNameAnalysisTimedOut (value: boolean) {
    this.nameAnalysisTimedOut = value
  }
  @Mutation
  mutateConditionsModalVisible (value: boolean) {
    this.conditionsModalVisible = value
  }
  @Mutation
  clearAssumedNameOriginal () {
    this.assumedNameOriginal = ''
  }
  getEntities (category) {
    return this.entityTypesBC.filter(type => type.cat === category)
  }
  @Mutation
  mutateUserCancelledAnalysis (value: boolean) {
    this.userCancelledAnalysis = value
  }
}

export default getModule(NewRequestModule) as any
