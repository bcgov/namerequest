import axios from 'axios'
import designations from './list-data/designations'
import CanJurisdictions from './list-data/canada-jurisdictions.js'
import IntJurisdictions from './list-data/intl-jurisdictions.js'
import querystring from 'qs'
import store from '@/store'
import {
  AnalysisJSONI,
  ApplicantI,
  ConditionalReqI,
  ConsentConflictI, ConversionTypesI,
  DraftReqI,
  EntityI,
  ExistingRequestSearchI,
  LocationT,
  NameDesignationI,
  NameRequestI,
  NewRequestNameSearchI,
  RequestNameI,
  ReservedReqI,
  SelectOptionsI,
  StatsI,
  SubmissionTypeT,
  WaitingAddressSearchI
} from '@/models'
import canadaPostAPIKey from './config'
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { removeExcessSpaces, sanitizeName } from '@/plugins/utilities'
import Vue from 'vue'

const qs: any = querystring
let source: any

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

interface RequestNameMapI extends RequestNameI {}

@Module({ dynamic: true, namespaced: false, store, name: 'newRequestModule' })
export class NewRequestModule extends VuexModule {
  paymentURL: string = ''
  actingOnOwnBehalf: boolean = true
  addressSuggestions: object | null = null
  analysisJSON: AnalysisJSONI | null = null
  applicant: ApplicantI = {
    addrLine1: '',
    addrLine2: '',
    city: '',
    clientFirstName: '',
    clientLastName: '',
    contact: '',
    countryTypeCd: '',
    emailAddress: '',
    faxNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phoneNumber: '',
    postalCd: '',
    stateProvinceCd: ''
  }
  assumedName: boolean = false
  nrData = {
    additionalInfo: '',
    corpNum: '',
    homeJurisNum: '',
    natureBusinessInfo: '',
    previousRequestId: '',
    tradeMark: '',
    xproJurisdiction: ''
  }
  conflictId: string | null = null
  changesInBaseName: boolean = false
  conversionType: string = ''
  conversionTypeAddToSelect: ConversionTypesI | null = null
  conversionTypes: ConversionTypesI[] = [
    {
      desc: 'BC Corporation ⇨ Unlimited Liability Company',
      text: 'BC Corp. ⇨ U.L.C.',
      entity_type_cd: 'UL',
      blurb: 'Convert from a <b>BC Corporation</b> to an <b>Unlimited Liability Company</b>',
      value: 'UC',
      rank: 1,
      shortlist: true
    },
    {
      desc: 'BC Corporation ⇨ Community Contribution Company',
      text: 'BC Corp. ⇨ Comunity Contribution Co.',
      entity_type_cd: 'CC',
      blurb: 'blah',
      value: 'CCV',
      rank: 2,
      shortlist: true
    },
    {
      desc: 'BC Corporation ⇨ BC Benefit Company',
      text: 'BC Corp. ⇨ Benefit Company',
      entity_type_cd: 'BC',
      blurb: 'blah',
      value: 'BECV',
      shortlist: false
    },
    {
      desc: 'BC Benefit Company ⇨ BC Corporation',
      text: 'Benefit Company ⇨ BC Corp.',
      entity_type_cd: 'CR',
      blurb: 'blah',
      value: 'BECR',
      shortlist: false
    }
  ]
  designationIsFixed: boolean = false
  disableSuggestions: boolean = false
  displayedComponent: string = 'Tabs'
  doNotAnalyzeEntities: string[] = ['PAR', 'CC', 'CP', 'PA', 'FI', 'XCP']
  editMode: boolean = false
  entity_type_cd: string = 'CR'
  entityTypeAddToSelect: SelectOptionsI | null = null
  entityTypesBC: EntityI[] = [
    {
      text: 'Sole Proprietorship',
      value: 'FR',
      cat: 'Proprietorships',
      blurb: [
        'A company owned and operated by one person who is personally responsible for all debt and liability',
        'Reported on your personal taxes',
        'Does not have name protection in BC'
      ],
      shortlist: true,
      rank: 3
    },
    {
      text: 'Doing Business As',
      value: 'DBA',
      cat: 'Proprietorships',
      blurb: [
        `An existing company that would like to be known as another name. Referred to as a "Doing Business As" or trade 
        name. `,
        'Does not have name protection in BC'
      ]
    },
    {
      text: 'Corporation',
      cat: 'Corporations',
      blurb: [
        `A company that may have one or more people who own shares with some personal responsibility for debt and
        liabilities.`,
        'Reported separately as Corporate tax',
        'Has name protection in BC'
      ],
      value: 'CR',
      shortlist: true,
      rank: 1
    },
    {
      text: 'Unlimited Liability Co.',
      cat: 'Corporations',
      blurb: [
        'Similar to BC Corporations.  Often used by American Corporations for tax planning.',
        'Reported separately as Canadian Corporate tax',
        'Has name protection in BC'
      ],
      value: 'UL'
    },
    {
      text: 'General Partnership',
      cat: 'Partnerships',
      blurb: [
        'A company owned and operated by two or more people who are personally responsible for all debt and liability.',
        'A partnership agreement is recommended',
        'Reported on your personal income tax',
        'Does not have name protection in BC'
      ],
      value: 'GP',
      shortlist: true,
      rank: 2
    },
    {
      text: 'Limited Partnership',
      cat: 'Partnerships',
      blurb: [
        `Frequently used in real estate developments or film industry projects.  This type of partnership ends when 
        the project is complete`,
        'A partnership agreement is recommended',
        'Does not have name protection in BC'
      ],
      value: 'LP'
    },
    {
      text: 'Limited Liability Partnership',
      cat: 'Partnerships',
      blurb: [
        'Frequently used by professionals such as doctors or laywers to form a practice',
        'A partnership agreement is recommended',
        'Does not have name protection in BC'
      ],
      value: 'LL'
    },
    {
      text: 'Co-operative',
      cat: 'Social Enterprises',
      blurb: [
        'Membership-based organization, owned and operated by the people who use its services',
        'Members have no liability',
        'Reported as Corporate tax',
        'Has name protection in BC'
      ],
      value: 'CP'
    },
    {
      text: 'Benefit Co.',
      cat: 'Corporations',
      blurb: [
        `Similar to BC Corporations but with commitments to conduct business in a responsible and sustainable way.`,
        'Reported as Corporate tax',
        'Has name protection in BC'
      ],
      value: 'BC'
    },
    {
      text: 'Community Contribution Co.',
      cat: 'Social Enterprises',
      blurb: [
        `Similar to BC Corporations, Community Contribution Companies are intended to bridge the gap between for-profit
         and non-profit companies`,
        'Reported as Corporate tax',
        'Has name protection in BC'
      ],
      value: 'CC'
    },
    {
      text: 'Society',
      cat: 'Social Enterprises',
      blurb: [
        `A non-profit organization.`,
        'Has name protection in BC',
        'Must use Societies Online to register a name and incorporate'
      ],
      value: 'SO'
    },
    {
      text: 'Private Act',
      cat: 'Other',
      blurb: [
        `A special type of business structure that may often be established through legislation or by economic growth 
        initiatives`,
        'Examples include resorts and ski areas',
        'Has name protection in BC'
      ],
      value: 'PA'
    },
    {
      text: 'Financial Institution',
      cat: 'Other',
      blurb: [
        'Credit Unions',
        'Has name protection in BC'
      ],
      value: 'FI'
    },
    {
      text: 'Parish',
      cat: 'Other',
      blurb: [
        'Church Parish',
        'Something to say here',
        'Perhaps another point'
      ],
      value: 'PAR'
    }
  ]
  entityTypesXPRO: EntityI[] = [
    {
      text: 'Corporation',
      cat: 'Corporations',
      blurb: [
        'Corporation established and operating in another province or country. Plans to operate in BC as well.',
        'Has name protection in BC'
      ],
      value: 'XCR',
      shortlist: true,
      rank: 1
    },
    {
      text: 'Unlimited Liability Co.',
      cat: 'Corporations',
      blurb: [
        'ULC established and operating in another province or country. Plans to operate in BC as well. ',
        'Has name protection in BC'
      ],
      value: 'XUL'
    },
    {
      text: 'Limited Liability Co.',
      cat: 'Corporations',
      blurb: [
        'A US Corporation that plans to operate in BC as well.',
        'Does not have name protection in BC'
      ],
      value: 'RLC',
      shortlist: true,
      rank: 2
    },
    {
      text: 'Limited Partnership',
      cat: 'Partnerships',
      blurb: [
        'LP established and operating in another province or country. Plans to operate in BC as well.',
        'Does not have name protection in BC'
      ],
      value: 'XLP'
    },
    {
      text: 'Limited Liability Partnership',
      cat: 'Partnerships',
      blurb: [
        'LLP established and operating in another province or country. Plans to operate in BC as well.',
        'Does not have name protection in BC'
      ],
      value: 'XLL'
    },
    {
      text: 'Co-operative',
      cat: 'Social Enterprises',
      blurb: [
        'Co-operative established and operating in another province or country. Plans to operate in BC.',
        'Has Name protection in BC'
      ],
      value: 'XCP',
      shortlist: true,
      rank: 3
    },
    {
      text: 'Society',
      cat: 'Social Enterprises',
      blurb: ['Societies must use Societies Online to get their name'],
      value: 'XSO'
    }
  ]
  errors: string[] = []
  examinationRequestedIndex = {
    0: false,
    1: false,
    2: false
  }
  existingRequestSearch: ExistingRequestSearchI = {
    emailAddress: '',
    nrNum: '',
    phoneNumber: ''
  }
  extendedRequestType: SelectOptionsI | null = null
  getNameReservationFailed: boolean = false
  helpMeChooseModalVisible: boolean = false
  isAssumedName: boolean = false
  isPersonsName: boolean = false
  issueIndex: number = 0
  location: LocationT = 'BC'
  locationInfoModalVisible: boolean = false
  name: string = ''
  nameChoices = {
    name1: '',
    designation1: '',
    name2: '',
    designation2: '',
    name3: '',
    designation3: ''
  }
  nrRequestNameMap: RequestNameMapI[] = []
  nr: Partial<NameRequestI> = {} as NameRequestI
  nameIsEnglish: boolean = true
  nrRequiredModalVisible: boolean = false
  pickEntityModalVisible: boolean = false
  pickRequestTypeModalVisible: boolean = false
  priorityRequest: boolean = false
  request_action_cd: string = 'NEW'
  requestExaminationOrProvideConsent = {
    0: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false
    },
    1: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false
    },
    2: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false
    },
    3: {
      send_to_examiner: false,
      obtain_consent: false,
      conflict_self_consent: false
    }
  }
  requestTypes: EntityI[] = [
    {
      text: 'Start a New',
      value: 'NEW',
      blurb: `Start a new business in BC. This applies to starting fresh from here or having a business in another 
              province or country that you want to operate in BC as well.`
    },
    {
      text: 'Move your Business to BC',
      value: 'MVE',
      blurb: `You have an existing business in another province. You are closing your business there and moving your 
              business to BC.`
    },
    {
      text: 'Change your Name',
      value: 'CHG',
      blurb: `You have an existing business that is registered in BC and you want to change your name. You will need 
              your incorporation or firm number assigned to you by Registries.`
    },
    {
      text: 'Get a New Tradename',
      value: 'DBA',
      blurb: `You have an existing business. You want to request a name to use as a trade name. You will need 
              your incorporation or firm number assigned to you by Registries.`
    },
    {
      text: 'Amalgamate',
      value: 'AML',
      blurb: 'You are merging with another company and you want a new name.'
    },
    {
      text: 'Convert to Another Structure',
      value: 'CNV',
      blurb: `Convert from one business structure to another. Such as converting from a ULC to a BC Corp. You will need 
              to identify your business with your Corp. #/Firm # (assigned by 
              Registries).`
    },
    {
      text: 'Restore Using a Historical Name',
      value: 'REH',
      blurb: 'You have a business that has been dissolved or cancelled. You want to start up again and use the same' +
        ' name. You will need your incorporation or firm number assigned to you by Registries.'
    },
    {
      text: 'Restore with a New Name',
      value: 'REN',
      blurb: 'You have a business that has been dissolved or cancelled. You want to start up again with a new name.' +
        ' You will need your incorporation or firm number assigned to you by Registries.'
    },
    {
      text: 'Change Registration to Sole Prop, GP or DBA.',
      value: 'CRG',
      blurb: 'blah blah'
    }
  ]
  showActualInput: boolean = false
  stats: StatsI | null = null
  submissionTabNumber: number = 0
  submissionType: SubmissionTypeT | null = null
  tabNumber: number = 0
  waitingAddressSearch: WaitingAddressSearchI | null = null

  get payment_url () {
    return this.paymentURL
  }
  get allDesignationWords () {
    let output = []
    for (let des in designations) {
      designations[des].words.forEach(word => {
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
    for (let key in this.requestExaminationOrProvideConsent) {
      if (this.requestExaminationOrProvideConsent[key].conflict_self_consent) {
        output.name = this.analysisJSON.issues[key].conflicts[0].name
        if (this.analysisJSON.issues[key].conflicts[0].id) {
          output.corpNum = this.analysisJSON.issues[key].conflicts[0].id
        }
      }
    }
    return output
  }
  get consentWords () {
    let consentWords = []
    for (let step in this.requestExaminationOrProvideConsent) {
      if (this.requestExaminationOrProvideConsent[step].obtain_consent) {
        consentWords.push(this.analysisJSON.issues[step].name_actions[0].word)
      }
    }
    return consentWords
  }
  get designationItems () {
    if (this.entity_type_cd && designations[this.entity_type_cd]) {
      let { words } = designations[this.entity_type_cd]
      return words.map(des => ({ value: des, text: des }))
    }
    return []
  }
  get designationObject () {
    if (this.entity_type_cd && designations[this.entity_type_cd]) {
      return designations[this.entity_type_cd]
    }
    return ''
  }
  get entityTextFromValue () {
    let list = [...this.entityTypesBC, ...this.entityTypesXPRO]
    let type = list.find(t => t.value === this.entity_type_cd)
    return type.text
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
  get entityTypeOptions () {
    let bcOptions: SelectOptionsI[] = this.entityTypesBC.filter(type => type.shortlist)
    let xproOptions: SelectOptionsI[] = this.entityTypesXPRO.filter(type => type.shortlist)
    let options: SelectOptionsI[] = this.location === 'BC' ? [...bcOptions] : [...xproOptions]
    let n = 4

    if (this.entityTypeAddToSelect) {
      this.entityTypeAddToSelect.rank = 4
      options = options.concat(this.entityTypeAddToSelect)
      n = 5
    }
    options = options.concat({ text: 'View All Entity Types', value: 'INFO', rank: n })

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
  get locationOptions () {
    let options = [
      { text: 'BC', value: 'BC' },
      { text: 'Canada', value: 'CA' },
      { text: 'Foreign', value: 'IN' },
      { text: 'Help', value: 'INFO' }
    ]
    if (this.request_action_cd === 'MVE') {
      return options.filter(option => option.text !== 'BC')
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
    let option = this.requestTypes.find(type => type.value === 'NEW')
    option.rank = 1
    let options = [option]
    let n = 2
    if (this.extendedRequestType) {
      this.extendedRequestType.rank = 2
      options.push(this.extendedRequestType)
      n = 3
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
        case 'XUL':
          return 'UA'
        default:
          return ''
      }
    }
    return ''
  }
  get nrNum () {
    const { nr } = this
    let nrNum
    if (nr) nrNum = nr.nrNum
    return nrNum
  }
  get nrState () {
    const { nr } = this
    let state
    if (nr) state = nr.state
    return state
  }
  get nrNames () {
    const { nr } = this
    let names = []
    if (nr) names = nr.names
    return names
  }
  /**
   * This getter combines the NR response data objects names against nameChoices,
   * which contains the actual form values, building the request object required for a Name.
   * nameChoices are identified by the 'choice' index, which is what we use to map values.
   */
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
          // Create the requestName
          requestNames.push({
            name: nameChoices[`name${choiceIdx}`],
            designation: nameChoices[`designation${choiceIdx}`],
            choice: choiceIdx,
            ...defaultValues
          })
        }
        choiceIdx++
      }
    } else {
      // Just use the 'name' property to fill in the requestName
      requestNames.push({
        name: this.name,
        designation: this.splitNameDesignation.designation,
        choice: 1,
        ...defaultValues
      })
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
  get draftNameReservation (): DraftReqI {
    const { applicant, nrData, nrRequestNames } = this

    const caseData: DraftReqI = {
      applicants: [applicant],
      names: nrRequestNames,
      ...nrData,
      priorityCd: this.priorityRequest ? 'Y' : 'N',
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd,
      request_type_cd: this.xproRequestTypeCd ? this.xproRequestTypeCd : '',
      stateCd: 'DRAFT',
      english: this.nameIsEnglish,
      nameFlag: this.isPersonsName,
      submit_count: 0
    }
    return caseData
  }
  get editNameReservation () {
    let data = {
      applicants: [this.applicant],
      names: this.nrRequestNames,
      request_action_cd: this.request_action_cd,
      entity_type_cd: this.entity_type_cd,
      ...this.nrData
    }
    for (let key in this.nrData) {
      if (this.nrData[key]) {
        data[key] = this.nrData[key]
      }
    }
    return data
  }
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
        name_type_cd: 'CO',
        consent_words: this.consentWords.length > 0 ? this.consentWords : '',
        conflict1: this.consentConflicts.name,
        conflict1_num: this.consentConflicts.corpNum ? this.consentConflicts.corpNum : ''
      }

      names = [name]
    }

    const caseData: ConditionalReqI = {
      applicants: [applicant],
      names: names,
      ...nrData,
      priorityCd: 'N',
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd,
      request_type_cd: this.xproRequestTypeCd ? this.xproRequestTypeCd : '',
      stateCd: 'COND-RESERVE',
      english: this.nameIsEnglish,
      nameFlag: this.isPersonsName,
      submit_count: 0
    }
    return caseData
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

    const caseData: ReservedReqI = {
      applicants: [applicant],
      names: nrRequestNames,
      ...nrData,
      priorityCd: 'N',
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd,
      stateCd: 'RESERVED',
      english: this.nameIsEnglish,
      nameFlag: this.isPersonsName,
      submit_count: 0
    }
    return caseData
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
        let fields = ['Line1', 'Line2', 'City', 'PostalCode', 'ProvinceCode', 'CountryIso2']
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
      return error
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
      return error
    }
  }
  @Action
  async getNameAnalysis () {
    this.mutateDisplayedComponent('AnalyzePending')
    this.resetRequestExaminationOrProvideConsent()

    let params: NewRequestNameSearchI = {
      name: this.name,
      location: this.location,
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd
    }

    try {
      let { CancelToken } = axios
      source = CancelToken.source()

      let resp = await axios.get('name-analysis', {
        params,
        cancelToken: source.token
      })
      let json = resp.data
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
      this.mutateDisplayedComponent('Tabs')
      return
    }
  }
  @Action
  async getNameAnalysisXPRO () {
    this.mutateDisplayedComponent('AnalyzePending')
    this.resetRequestExaminationOrProvideConsent()

    let params: NewRequestNameSearchI = {
      name: this.name,
      location: this.location,
      entity_type_cd: this.entity_type_cd,
      request_action_cd: this.request_action_cd
    }

    try {
      let { CancelToken } = axios
      source = CancelToken.source()

      let resp = await axios.get('/xpro-name-analysis', {
        params,
        cancelToken: source.token
      })
      let json = resp.data
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
      this.mutateDisplayedComponent('Tabs')
      return
    }
  }
  @Action
  async getNameRequests () {
    this.mutateDisplayedComponent('AnalyzePending')
    this.mutateSubmissionType('normal')
    let params = {
      nrNum: this.existingRequestSearch.nrNum,
      phoneNumber: this.existingRequestSearch.phoneNumber,
      emailAddress: this.existingRequestSearch.emailAddress
    }
    try {
      let { CancelToken } = axios
      source = CancelToken.source()

      let resp = await axios.get('/namerequests', {
        params,
        cancelToken: source.token
      })
      // eslint-disable-next-line
      if (!resp.data || resp.data.length === 0) {
        this.mutateNameRequest(
          {
            text: 'There were no records found that match the information you have entered.  Please verify the NR  ' +
              'Number and the phone / email and try again.',
            failed: true
          }
        )
        this.mutateDisplayedComponent('Tabs')
        return
      }
      this.mutateNameRequest(resp.data)
      this.mutateDisplayedComponent('ExistingRequestDisplay')
    } catch (error) {
      if (error.response.status === 400) {
        this.mutateNameRequest(
          {
            text: 'Please verify that you are entering a valid NR number.',
            failed: true
          }
        )
      }
      this.mutateDisplayedComponent('Tabs')
      return
    }
  }
  @Action
  async getNameReservation (nrNum) {
    let response
    try {
      response = await axios.get(`/namerequests/${nrNum}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const { data } = response
      const { names } = data

      this.setNrResponse(data)
      this.updateReservationNames(names)
      this.resetApplicantDetails()
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
    }
  }
  @Action
  async getStats () {
    try {
      let resp = await axios.get('/stats')
      this.mutateStats(resp.data)
      return Promise.resolve(resp.data)
    } catch {
      return Promise.resolve()
    }
  }
  @Action
  async patchNameRequests () {
    try {
      let nr = this.editNameReservation
      let { nrNum } = this.nr
      nrNum = nrNum.replace(/(?:\s+|\s|)(\D|\D+|)(?:\s+|\s|)(\d+)(?:\s+|\s|)/, 'NR' + '$2')

      let response = await axios.patch(`/namerequests/${nrNum}/edit`, nr, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.mutateNameRequest(response.data)
      this.mutateDisplayedComponent('Success')
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
    }
  }
  @Action
  async patchNameRequestsByAction (action) {
    try {
      let response = await axios.patch(`/namerequests/${this.nr.nrNum}/${action}`, {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.mutateNameRequest(response.data)
      this.mutateDisplayedComponent('Success')
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
    }
  }
  @Action
  async postNameRequests (type) {
    let response
    try {
      let data: any
      switch (type) {
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

      response = await axios.post(`/namerequests`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this.setNrResponse(response.data)

      const { nr } = this
      const { applicants = [] } = nr

      if (applicants instanceof Array) {
        this.setApplicantDetails(applicants[0])
      } else if (applicants) {
        this.setApplicantDetails(applicants)
      }
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
    }
  }
  @Action
  async putNameReservation (nrNum) {
    const { nrState } = this
    let response
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
      }

      response = await axios.put(`/namerequests/${nrNum}`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      this.setNrResponse(response.data)

      const { nr } = this
      const { applicants = [] } = nr

      if (applicants instanceof Array) {
        this.setApplicantDetails(applicants[0])
      } else if (applicants) {
        this.setApplicantDetails(applicants)
      }
    } catch (error) {
      // eslint-disable-next-line
      console.log(error)
    }
  }
  @Action
  cancelAnalyzeName () {
    if (source && source.cancel) {
      source.cancel()
      source = null
    }
    this.mutateDisplayedComponent('Tabs')
    this.mutateShowActualInput(false)
    this.resetApplicantDetails()
    this.resetRequestExaminationOrProvideConsent()
    this.mutateName('')
    this.mutateAnalysisJSON(null)
  }
  @Action
  cancelEditExistingRequest () {
    this.mutateDisplayedComponent('ExistingRequestDisplay')
    this.resetApplicantDetails()
    this.mutateNameChoicesToInitialState()
    this.mutateName('')
    this.resetNrData()
    this.mutateEditMode(false)
  }
  @Action
  editExistingRequest () {
    this.mutateEditMode(true)
    this.populateApplicantData()
    this.populateNrData()
    for (let field of ['clientFirstName', 'clientLastName', 'contact']) {
      if (this.nr.applicants[field]) {
        this.mutateActingOnOwnBehalf(false)
        break
      }
    }
    let { entity_type_cd } = this.nr
    if (!this.entityTypeOptions.some(option => option.value === entity_type_cd)) {
      let obj = this.entityTypesBC.find(entity => entity.value === entity_type_cd)
        ? this.entityTypesBC.find(entity => entity.value === entity_type_cd)
        : this.entityTypesXPRO.find(entity => entity.value === entity_type_cd)
      this.mutateEntityTypeAddToSelect(obj)
    }
    if (this.nr.xproJurisdiction) {
      let { xproJurisdiction } = this.nr
      let location: LocationT
      for (let key of ['value', 'text']) {
        if (CanJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
          location = 'CA'
          break
        }
        if (IntJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
          location = 'IN'
          break
        }
      }
      this.mutateLocation(location)
    } else {
      this.mutateLocation('BC')
    }
    if (this.nr.state === 'DRAFT') {
      this.mutateSubmissionTabComponent('NamesCapture')
    } else {
      this.mutateSubmissionTabComponent('ApplicantInfo1')
    }
    this.mutateDisplayedComponent('ExistingRequestEdit')
  }
  @Action
  startAnalyzeName () {
    this.mutateEditMode(false)
    this.mutateShowActualInput(false)
    let name
    if (this.name) {
      name = sanitizeName(this.name)
    }
    ['entity_type_cd', 'request_action_cd', 'location'].forEach(field => {
      if (this[field] === 'INFO') {
        this.setErrors(field)
      }
    })
    if (!this.name) {
      this.setErrors('name')
      return
    }
    if (this.name.length < 3) {
      this.setErrors('length')
      return
    }
    if (this.errors.length > 0) {
      return
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
      this.mutateSubmissionTabComponent('EntityNotAutoAnalyzed')
      this.mutateDisplayedComponent('SubmissionTabs')
      return
    }
    this.mutateName(name)
    if (this.location === 'BC') {
      if (this.nameIsEnglish && !this.isPersonsName && !this.doNotAnalyzeEntities.includes(this.entity_type_cd)) {
        if (['NEW', 'DBA', 'CHG'].includes(this.request_action_cd)) {
          this.getNameAnalysis()
          return
        }
      }
      this.mutateSubmissionTabComponent('EntityNotAutoAnalyzed')
      this.mutateDisplayedComponent('SubmissionTabs')
      return
    } else {
      if (['NEW', 'DBA', 'CHG', 'MVE', 'REH', 'REN', 'REST'].includes(this.request_action_cd)) {
        this.getNameAnalysisXPRO()
      }
    }
  }
  @Action
  updateApplicantDetails (appKV) {
    this.mutateApplicant(appKV)
    if (!appKV.value || appKV.key !== 'addrLine1' || this.disableSuggestions) {
      this.mutateAddressSuggestions(null)
      return
    }
  }

  @Mutation
  clearErrors () {
    this.errors = []
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
  mutateAssumedName (value) {
    this.assumedName = value
  }
  @Mutation
  mutateIsAssumedName (value) {
    this.isAssumedName = value
  }
  @Mutation
  mutateChangesInBaseName (newVal) {
    this.changesInBaseName = newVal
  }
  @Mutation
  mutateConflictId (id) {
    this.conflictId = id
  }
  @Mutation
  mutateDesignationIsFixed (value) {
    this.designationIsFixed = value
  }
  @Mutation
  mutateDisableSuggestions (value) {
    this.disableSuggestions = value
  }
  @Mutation
  mutateDisplayedComponent (comp: string) {
    this.displayedComponent = comp
  }
  @Mutation
  mutateEntityType (type: string) {
    this.entity_type_cd = type
  }
  @Mutation
  mutateExaminationRequestedIndex (value: boolean) {
    this.examinationRequestedIndex[this.issueIndex] = value
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
  mutateEntityTypeAddToSelect (option: SelectOptionsI) {
    this.entityTypeAddToSelect = option
  }
  @Mutation
  mutateExtendedRequestType (option: SelectOptionsI) {
    this.extendedRequestType = option
  }
  @Mutation
  mutateHelpMeChooseModalVisible (value: boolean) {
    this.helpMeChooseModalVisible = value
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
  mutateName (name: string) {
    this.name = name
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
  mutateNRData ({ key, value }) {
    this.nrData[key] = value
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
  mutateNameRequest (value) {
    this.nr = value
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
  resetApplicantDetails () {
    Object.keys(this.applicant).forEach(key => {
      this.applicant[key] = ''
    })
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
  setApplicantDetails (applicant) {
    const data = Object.assign({}, applicant) as ApplicantI
    Object.keys(data as ApplicantI).forEach(key => {
      this.applicant[key] = data[key]
    })
  }
  @Mutation
  setNrResponse (value) {
    this.nr = value
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
  mutateEditMode (value) {
    this.editMode = value
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
  mutateGetNameReservationFailed (value) {
    this.getNameReservationFailed = value
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
  mutateNRDataByKey (kv) {
    Vue.set(
      this.nrData,
      kv.key,
      kv.value
    )
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
  mutatePaymentURL (url: string) {
    this.paymentURL = url
  }

  getEntities (category) {
    return this.entityTypesBC.filter(type => type.cat === category)
  }
}

export default getModule(NewRequestModule) as any
