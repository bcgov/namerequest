import Axios from '@/plugins/axios'
import axios from 'axios'
import removeAccents from 'remove-accents'
import store from '@/store'
import {
  AnalysisJSONI,
  DisplayedComponentT,
  EntityI,
  LocationT,
  NameChoicesI,
  NewRequestNameSearchI,
  SearchComponentT,
  SelectOptionsI,
  StatsI, SubmissionTypeT
} from '@/models'
import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { normalizeWordCase } from '@/plugins/utilities'

let source

@Module({ dynamic: true, namespaced: false, store, name: 'newRequestModule' })
export class NewRequestModule extends VuexModule {
  actingOnOwnBehalf: boolean = false
  additionalInfo: string = ''
  address1: string = ''
  address2: string = ''
  analysisJSON: AnalysisJSONI | null = null
  city: string = ''
  country: string = 'CA'
  displayedComponent: DisplayedComponentT = 'Tabs'
  email: string = ''
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
      cat: 'Social Enterprises',
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
        'Must use Societies Online to register name'
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
        'Has name protetion in BC'
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
  faxNumber: string = ''
  firstName: string = ''
  haveNWPTA: boolean = false
  helpMeChooseModalVisible: boolean = false
  issueIndex: number = 0
  jurisdiction: string = ''
  lastName: string = ''
  location: LocationT = 'BC'
  locationInfoModalVisible: boolean = false
  middleName: string = ''
  name: string = ''
  nameChoices = {
    name1: '',
    designation1: '',
    name2: '',
    designation2: '',
    name3: '',
    designation3: ''
  }
  natureOfBusiness: string = ''
  nrRequiredModalVisible: boolean = false
  phoneNumber: string = ''
  pickEntityModalVisible: boolean = false
  pickRequestTypeModalVisible: boolean = false
  postalCode: string = ''
  priorityRequest: boolean = false
  provinceState: string = 'BC'
  requestAction: string = 'NEW'
  requestTypes: EntityI[] = [
    {
      text: 'Start a New',
      value: 'NEW',
      blurb: `Start a new business in BC. This applies to starting fresh from here or having a business in another 
              province or country that you want to operate in BC as well.`
    },
    { text: 'Move your Business to BC',
      value: 'MVE',
      blurb: `You have an existing business in another province. You are closing your business there and moving your 
              business to BC.`
    },
    {
      text: 'Change your Name',
      value: 'CHG',
      blurb: `You have an existing business that is registered in BC and you want to change your name. You will need 
              your incorporation or firm number or your B/N assigned to you by CRA.`
    },
    {
      text: 'Get a New Tradename',
      value: 'DBA',
      blurb: 'blah blah'
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
              to identify your business with your B/N # (assigned by CRA) or your Corp. #/Firm # (assigned by 
              Registries).`
    },
    {
      text: 'Restore Using a Historical Name',
      value: 'REH',
      blurb: 'blah blah'
    },
    {
      text: 'Restore with a New Name',
      value: 'REN',
      blurb: 'blah blah'
    },
    {
      text: 'Change Registration to Sole Prop, GP or DBA.',
      value: 'CRG',
      blurb: 'blah blah'
    }
  ]
  stats: StatsI | null = null
  submissionTabNumber: number = 0
  submissionType: SubmissionTypeT | null = null
  tabNumber: number = 0

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
    options = options.concat({ text: 'View All Business Structures', value: 'all', rank: n })
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
      { text: 'Help', value: 'HELP' }
    ]
    if (this.requestAction === 'MVE') {
      let optionsLessBC = [...options]
      return optionsLessBC.splice(1, 2)
    }
    return options
  }
  get newOrExistingRequest () {
    if (this.tabNumber) {
      return 'existing'
    }
    return 'new'
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
  get requestTypeOptions () {
    let option = this.requestTypes.find(type => type.value === 'NEW')
    option.rank = 1
    let options = [ option ]
    let n = 2
    if (this.extendedRequestType) {
      this.extendedRequestType.rank = 2
      options.push(this.extendedRequestType)
      n = 3
    }
    options.push({ text: 'View All Request Types', value: 'all', rank: n })
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

  @Action({ rawError: true })
  async getStats () {
    try {
      let resp = await Axios.get('/stats')
      this.mutateStats(resp.data)
      return Promise.resolve(resp.data)
    } catch {
      return Promise.resolve()
    }
  }
  @Action({ rawError: true })
  startAgain () {
    this.mutateAnalysisJSON(null)
    this.mutateDisplayedComponent('Tabs')
    return Promise.resolve()
  }
  @Action({ rawError: true })
  async startAnalyzeName () {
    let name
    if (this.name) {
      let edits = removeAccents(this.name)
      let edits2 = edits.replace(/[^\sa-zA-Z0-9*/+&().,="'#@!?;:-]/g, '')
      name = edits2.toUpperCase()
    } else {
      this.setErrors('name')
    }
    this.mutateName(name)
    if (this.entityType === 'all') {
      this.setErrors('entity')
    }
    if (this.requestAction === 'all') {
      this.setErrors('request')
    }
    if (this.location === 'HELP') {
      this.setErrors('location')
    }
    if (this.name !== '' && this.name.length < 3) {
      this.setErrors('length')
    }
    if (this.errors.length > 0) {
      return Promise.resolve()
    }

    this.mutateDisplayedComponent('AnalyzePending')
    let params: NewRequestNameSearchI = {
      name,
      location: this.location,
      entity_type: this.entityType,
      request_action: this.requestAction
    }
    let resp
    let CancelToken = axios.CancelToken
    source = CancelToken.source()

    try {
      resp = await Axios.get('/name-analysis', {
        params,
        cancelToken: source.token
      })
    } catch (error) {
      this.mutateDisplayedComponent('Tabs')
      return Promise.resolve(error)
    }
    this.mutateAnalysisJSON(resp.data)
    this.mutateDisplayedComponent('AnalyzeResults')
    return Promise.resolve(resp.data)
  }
  @Action({ rawError: true })
  stopAnalyzeName () {
    source.cancel()
    this.mutateDisplayedComponent('Tabs')
    this.mutateAnalysisJSON(null)
    return Promise.resolve()
  }

  @Mutation
  clearErrors () {
    this.errors = []
  }
  @Mutation
  setErrors (value: string) {
    this.errors = this.errors.concat(value)
  }
  @Mutation
  mutateActingOnOwnBehalf (value) {
    this.actingOnOwnBehalf = value
  }
  @Mutation
  mutateAdditionalInfo (value) {
    this.additionalInfo = value
  }
  @Mutation
  mutateAddress1 (value) {
    this.address1 = value
  }
  @Mutation
  mutateAddress2 (value) {
    this.address2 = value
  }
  @Mutation
  mutateAnalysisJSON (value: AnalysisJSONI) {
    this.analysisJSON = value
  }
  @Mutation
  mutateCity (value) {
    this.city = value
  }
  @Mutation
  mutateCountry (value) {
    this.country = value
  }
  @Mutation
  mutateDisplayedComponent (comp: DisplayedComponentT) {
    this.displayedComponent = comp
  }
  @Mutation
  mutateEmail (value) {
    this.email = value
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
  mutateFaxNumber (value) {
    this.faxNumber = value
  }
  @Mutation
  mutateFirstName (value) {
    this.firstName = value
  }
  @Mutation
  mutateHaveNWPTA (value) {
    this.haveNWPTA = value
  }
  @Mutation
  mutateJurisdiction (value) {
    this.jurisdiction = value
  }
  @Mutation
  mutateLastName (value) {
    this.lastName = value
  }
  @Mutation
  mutateLocation (location: LocationT) {
    if (location === this.location) {
      return
    }
    if (location === 'HELP') {
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
  mutateMiddleName (value) {
    this.middleName = value
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
  mutateNatureOfBusiness (value) {
    this.natureOfBusiness = value
  }
  @Mutation
  mutateNrRequiredModalVisible (value: boolean) {
    this.nrRequiredModalVisible = value
  }
  @Mutation
  mutatePhoneNumber (value) {
    this.phoneNumber = value
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
  mutatePostalCode (value) {
    this.postalCode = value
  }
  @Mutation
  mutatePriorityRequest (value) {
    this.priorityRequest = value
  }
  @Mutation
  mutateProvinceState (value) {
    this.provinceState = value
  }
  @Mutation
  mutateStats (stats) {
    this.stats = stats
  }
  @Mutation
  mutateSubmissionTabComponent (comp) {
    enum Components {
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
  mutateRequestAction (action: string) {
    this.requestAction = action
    if (action === 'MVE' && this.location === 'BC') {
      this.location = 'CA'
      this.entityType = 'XCR'
    }
  }
  @Mutation
  mutateTabNumber (tab: number) {
    this.tabNumber = tab
  }

  getEntities (catagory) {
    return this.entityTypesBC.filter(type => type.cat === catagory)
  }
}

export default getModule(NewRequestModule) as any
