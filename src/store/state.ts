import { NameRequestI, StateModelIF } from '@/interfaces'
import { StaffPaymentOptions } from '@/enums'

export const stateModel: StateModelIF = {
  common: {
    currentJsDate: null,
    keycloakRoles: []
  },
  newRequestModel: {
    actingOnOwnBehalf: true,
    addressSuggestions: null,
    allowAutoApprove: false,
    analysisJSON: null,
    analyzePending: false,
    applicant: {
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
    },
    assumedNameOriginal: '',
    conditionsModalVisible: false,
    exitModalVisible: false,
    conflictId: null,
    conversionType: '',
    conversionTypeAddToSelect: null,
    corpNum: '',
    corpSearch: '',
    designationIssueTypes: [
      'designation_non_existent',
      'designation_mismatch',
      'designation_misplaced',
      'end_designation_more_than_once'
    ],
    displayedComponent: 'Tabs',
    doNotAnalyzeEntities: ['PAR', 'CC', 'CP', 'PA', 'FI', 'XCP', 'SO'],
    editMode: false,
    entity_type_cd: '',
    entityTypeAddToSelect: null,
    errors: [],
    existingRequestSearch: {
      emailAddress: '',
      nrNum: '',
      phoneNumber: ''
    },
    extendedRequestType: null,
    getNameReservationFailed: false,
    helpMeChooseModalVisible: false,
    incorporateLoginModalVisible: false,
    affiliationErrorModalVisible: false,
    isPersonsName: false,
    issueIndex: 0,
    location: null,
    locationInfoModalVisible: false,
    mrasSearchInfoModalVisible: false,
    mrasSearchResultCode: null,
    name: '',
    nameOriginal: '',
    nameChoices: {
      name1: '',
      designation1: '',
      name2: '',
      designation2: '',
      name3: '',
      designation3: ''
    },
    nameIsEnglish: true,
    nameAnalysisTimedOut: false,
    noCorpNum: false,
    noCorpDesignation: false,
    nr: {} as NameRequestI,
    nrData: {
      additionalInfo: '',
      corpNum: '',
      homeJurisNum: '',
      natureBusinessInfo: '',
      previousRequestId: '',
      tradeMark: '',
      xproJurisdiction: ''
    },
    nrOriginal: {} as NameRequestI,
    nrRequestNameMap: [],
    nrRequiredModalVisible: false,
    pickEntityModalVisible: false,
    pickRequestTypeModalVisible: false,
    priorityRequest: false,
    quickSearch: true,
    quickSearchNames: [],
    request_action_cd: '',
    request_jurisdiction_cd: '',
    requestExaminationOrProvideConsent: {
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
    },
    requestActionOriginal: '',
    showActualInput: false,
    stats: null,
    submissionTabNumber: 0,
    submissionType: null,
    tabNumber: 0,
    userCancelledAnalysis: false,
    waitingAddressSearch: null,
    isLoadingSubmission: false
  },
  staffPayment: {
    option: StaffPaymentOptions.NONE,
    routingSlipNumber: '',
    bcolAccountNumber: '',
    datNumber: '',
    folioNumber: '',
    isPriority: false // not used in this UI
  },
  errorModel: {},
  paymentModel: {}
}
