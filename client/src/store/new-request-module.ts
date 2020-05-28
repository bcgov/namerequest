import axios from 'axios'
import removeAccents from 'remove-accents'
import designations from './list-data/designations'
import querystring from 'qs'
import store from '@/store'
import {
  AnalysisJSONI,
  ApplicantI, ConsentConflictI,
  DisplayedComponentT,
  EntityI,
  LocationT, NameDesignationI,
  NewRequestNameSearchI,
  PostApplicantI,
  PostConditionalReqI,
  PostDraftReqI,
  PostNameI,
  PostReservedReqI,
  SelectOptionsI,
  StatsI,
  SubmissionTypeT
} from '@/models'
import canadaPostAPIKey from './config'
import { Action, config, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { removeExcessSpaces, sanitizeName } from '@/plugins/utilities'
// config.rawError = true

const qs: any = querystring
let source: any

@Module({ dynamic: true, namespaced: false, store, name: 'newRequestModule' })
export class NewRequestModule extends VuexModule {
  actingOnOwnBehalf: boolean = true
  addressSuggestions: object | null = null
  analysisJSON: AnalysisJSONI | null = null
  applicant: PostApplicantI = {
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
  nrData = {
    additionalInfo: '',
    corpNum: '',
    homeJurisNum: '',
    natureBusinessInfo: '',
    previousRequestId: '',
    tradeMark: '',
    xproJurisdiction: ''
  }
  disableSuggestions: boolean = false
  displayedComponent: DisplayedComponentT = 'Tabs'
  doNotAnalyzeEntities: string[] = ['PAR', 'CC', 'BC', 'CP', 'PA', 'FI', 'XCP']
  entityType: string = 'CR'
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
  extendedEntitySelection: SelectOptionsI | null = null
  extendedRequestType: SelectOptionsI | null = null
  helpMeChooseModalVisible: boolean = false
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
  nrPostResponseObject: Partial<PostDraftReqI> | null = null
  isPersonsName: boolean = false
  nameIsEnglish: boolean = true
  nrRequiredModalVisible: boolean = false
  pickEntityModalVisible: boolean = false
  pickRequestTypeModalVisible: boolean = false
  priorityRequest: boolean = false
  requestAction: string = 'NEW'
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
  waitingAddressSearch: ApplicantI | null = null

  get consentConflicts (): ConsentConflictI {
    let output = {
      name: ''
    }
    for (let key in this.requestExaminationOrProvideConsent) {
      if (this.requestExaminationOrProvideConsent[key].conflict_self_consent) {
        output.name = this.analysisJSON.issues[key].conflicts[0].name
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
    if (this.entityType && designations[this.entityType]) {
      let { words } = designations[this.entityType]
      return words.map(des => ({ value: des, text: des }))
    }
    return []
  }
  get designationObject () {
    if (designations[this.entityType]) {
      return designations[this.entityType]
    }
    return ''
  }
  get entityTextFromValue () {
    let list = [...this.entityTypesBC, ...this.entityTypesXPRO]
    let type = list.find(t => t.value === this.entityType)
    return type.text
  }
  get entityTypeOptions () {
    let bcOptions: SelectOptionsI[] = this.entityTypesBC.filter(type => type.shortlist)
    let xproOptions: SelectOptionsI[] = this.entityTypesXPRO.filter(type => type.shortlist)
    let options: SelectOptionsI[] = this.location === 'BC' ? [...bcOptions] : [...xproOptions]
    let n = 4
    if (this.extendedEntitySelection) {
      this.extendedEntitySelection.rank = 4
      options = options.concat(this.extendedEntitySelection)
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
    if (this.requestAction === 'MVE') {
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
    let catagories = []
    for (let type of this.entityTypesBC) {
      let i = catagories.indexOf(type.cat)
      if (i === -1) {
        catagories.push(type.cat)
      }
    }
    const getEntities = (catagory) => {
      return this.entityTypesBC.filter(type => type.cat === catagory)
    }
    let output = catagories.map(cat =>
      ({
        text: cat,
        entities: getEntities(cat)
      })
    )
    return output
  }
  get pickEntityTableXPRO () {
    let catagories = []
    for (let type of this.entityTypesXPRO) {
      let i = catagories.indexOf(type.cat)
      if (i === -1) {
        catagories.push(type.cat)
      }
    }
    const getEntities = (catagory) => {
      return this.entityTypesXPRO.filter(type => type.cat === catagory)
    }
    let output = catagories.map(cat =>
      ({
        text: cat,
        entities: getEntities(cat)
      })
    )
    return output
  }
  get postType () {
    if (this.nameChoices.name1) {
      return 'draft'
    }
    if (this.consentWords.length > 0 || this.consentConflicts.name) {
      return 'conditional'
    }
    return 'reserved'
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
  async getNameRequest () {
    this.mutateDisplayedComponent('AnalyzePending')
    this.resetRequestExaminationOrProvideConsent()

    let params: NewRequestNameSearchI = {
      name: this.name,
      location: this.location,
      entity_type: this.entityType,
      request_action: this.requestAction
    }

    try {
      let { CancelToken } = axios
      source = CancelToken.source()

      let resp = await axios.get('/name-analysis', {
        params,
        cancelToken: source.token
      })
      this.mutateAnalysisJSON(resp.data)
      this.mutateDisplayedComponent('AnalyzeResults')
    } catch (error) {
      this.mutateDisplayedComponent('Tabs')
      return
    }
  }
  @Action
  async getNameRequestXPRO () {
    this.mutateDisplayedComponent('AnalyzePending')
    this.resetRequestExaminationOrProvideConsent()

    let params: NewRequestNameSearchI = {
      name: this.name,
      location: this.location,
      entity_type: this.entityType,
      request_action: this.requestAction
    }

    try {
      let { CancelToken } = axios
      source = CancelToken.source()

      let resp = await axios.get('/xpro-name-analysis', {
        params,
        cancelToken: source.token
      })
      this.mutateAnalysisJSON(resp.data)
      this.mutateDisplayedComponent('AnalyzeResults')
    } catch (error) {
      this.mutateDisplayedComponent('Tabs')
      // eslint-disable-next-line
      console.log(error)
      return
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
  async postNameReservation (type) {
    let postData: any
    switch (type) {
      case 'draft': {
        let applicant: PostApplicantI = this.applicant
        let names = []
        if (this.nameChoices.name1) {
          let name1: PostNameI = {
            name: this.nameChoices.name1 + ' ' + this.nameChoices.designation1,
            choice: 1,
            designation: this.nameChoices.designation1,
            name_type_cd: 'CO',
            consent_words: '',
            conflict1: '',
            conflict1_num: ''
          }
          names.push(name1)
          if (this.nameChoices.name2) {
            let name2: PostNameI = {
              name: this.nameChoices.name2 + ' ' + this.nameChoices.designation2,
              choice: 2,
              designation: this.nameChoices.designation2,
              name_type_cd: 'CO',
              consent_words: '',
              conflict1: '',
              conflict1_num: ''
            }
            names.push(name2)
          }
          if (this.nameChoices.name3) {
            let name3: PostNameI = {
              name: this.nameChoices.name3 + ' ' + this.nameChoices.designation3,
              choice: 3,
              designation: this.nameChoices.designation3,
              name_type_cd: 'CO',
              consent_words: '',
              conflict1: '',
              conflict1_num: ''
            }
            names.push(name3)
          }
        }
        let caseData: PostDraftReqI = {
          applicants: [applicant],
          names,
          ...this.nrData,
          priorityCd: this.priorityRequest ? 'Y' : 'N',
          entity_type: this.entityType,
          request_action: this.requestAction,
          stateCd: 'DRAFT',
          english: this.nameIsEnglish,
          nameFlag: this.isPersonsName,
          submit_count: 0
        }
        postData = caseData
        break
      }
      case 'conditional': {
        let name: PostNameI = {
          name: this.name,
          choice: 1,
          designation: this.splitNameDesignation.designation,
          name_type_cd: 'CO',
          consent_words: this.consentWords.length > 0 ? this.consentWords : '',
          conflict1: this.consentConflicts.name,
          conflict1_num: this.consentConflicts.name ? '464666' : ''
        }
        let caseData: PostConditionalReqI = {
          names: [ name ],
          applicants: [],
          ...this.nrData,
          priorityCd: 'N',
          entity_type: this.entityType,
          request_action: this.requestAction,
          stateCd: 'COND-RESERVE',
          english: this.nameIsEnglish,
          nameFlag: this.isPersonsName,
          submit_count: 0
        }
        postData = caseData
        break
      }
      case 'reserved': {
        let name: PostNameI = {
          name: this.name,
          choice: 1,
          designation: this.splitNameDesignation.designation,
          name_type_cd: 'CO',
          consent_words: '',
          conflict1: '',
          conflict1_num: ''
        }
        let caseData: PostReservedReqI = {
          names: [ name ],
          applicants: [],
          ...this.nrData,
          priorityCd: 'N',
          entity_type: this.entityType,
          request_action: this.requestAction,
          stateCd: 'RESERVED',
          english: this.nameIsEnglish,
          nameFlag: this.isPersonsName,
          submit_count: 0
        }
        postData = caseData
      }
    }
    let response
    try {
      response = await axios.post('/namerequests', postData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      this.setNRPostResponseObject(response.data)
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
    this.mutateAnalysisJSON(null)
    this.mutateDisplayedComponent('Tabs')
    this.mutateShowActualInput(false)
    this.resetApplicantDetails()
    this.resetRequestExaminationOrProvideConsent()
  }
  @Action
  startAnalyzeName () {
    this.mutateShowActualInput(false)
    let name
    if (this.name) {
      name = sanitizeName(this.name)
    }
    ['entityType', 'requestAction', 'location'].forEach(field => {
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
    if (name !== testName) {
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
    if (this.doNotAnalyzeEntities.includes(this.entityType) || !this.nameIsEnglish || this.isPersonsName) {
      this.mutateSubmissionTabComponent('EntityNotAutoAnalyzed')
      this.mutateDisplayedComponent('SubmissionTabs')
      return
    }
    if (this.location === 'BC') {
      this.getNameRequest()
      return
    }
    this.getNameRequestXPRO()
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
  mutateAnalysisJSON (value: AnalysisJSONI) {
    this.analysisJSON = value
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
  mutateDisableSuggestions (value) {
    this.disableSuggestions = value
  }

  @Mutation
  mutateDisplayedComponent (comp: DisplayedComponentT) {
    this.displayedComponent = comp
  }

  @Mutation
  mutateEntityType (type: string) {
    this.entityType = type
  }

  @Mutation
  mutateExaminationRequestedIndex (value: boolean) {
    this.examinationRequestedIndex[this.issueIndex] = value
  }

  @Mutation
  mutateExtendedEntitySelectOption (option: SelectOptionsI) {
    this.extendedEntitySelection = option
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
    this.extendedEntitySelection = null
    if (location === 'BC') {
      this.entityType = 'CR'
    } else {
      this.entityType = 'XCR'
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
  mutateisPersonsName (value) {
    this.isPersonsName = value
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
    this.requestAction = action
    if (action === 'MVE' && this.location === 'BC') {
      this.location = 'CA'
      this.entityType = 'XCR'
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
      SendForExamination,
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
  mutateWaitingAddressSearch (appKV: ApplicantI) {
    this.waitingAddressSearch = appKV
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
  setNRPostResponseObject (value) {
    this.nrPostResponseObject = value
  }

  getEntities (catagory) {
    return this.entityTypesBC.filter(type => type.cat === catagory)
  }
}

export default getModule(NewRequestModule) as any
