import {
  AnalysisJSONI, ApplicantI, ConversionTypesI, ExistingRequestSearchI, NameRequestI,
  RequestNameI, SelectOptionsI, StatsI, SubmissionTypeT, WaitingAddressSearchI
} from '@/interfaces/models'
import { NameChoicesIF, NrDataIF, RequestOrConsentIF } from '@/interfaces'
import { EntityType, Location, RequestCode } from '@/enums'

interface RequestNameMapI extends RequestNameI {}

export interface NewRequestIF {
  actingOnOwnBehalf: boolean
  addressSuggestions: any[]
  allowAutoApprove: boolean
  analysisJSON: AnalysisJSONI
  applicant: ApplicantI
  folioNumber?: string
  assumedNameOriginal: string
  conditionsModalVisible: boolean
  exitModalVisible: boolean
  exitIncompletePaymentVisible: boolean
  conflictId: string
  conversionType: EntityType
  conversionTypeAddToSelect: ConversionTypesI
  corpNum: string
  corpSearch: string
  designationIssueTypes: string[]
  displayedComponent: string
  doNotAnalyzeEntities: string[]
  editMode: boolean
  entity_type_cd: EntityType
  entityTypeAddToSelect: SelectOptionsI
  errors: string[]
  existingRequestSearch: ExistingRequestSearchI
  extendedRequestType: SelectOptionsI
  getNameReservationFailed: boolean
  helpMeChooseModalVisible: boolean
  incorporateLoginModalVisible: boolean
  affiliationErrorModalVisible: boolean
  isPersonsName: boolean
  issueIndex: number
  location: Location
  locationInfoModalVisible: boolean
  mrasSearchInfoModalVisible: boolean
  mrasSearchResultCode: number
  name: string
  nameOriginal: string
  nameChoices: NameChoicesIF
  nameIsEnglish: boolean
  nameAnalysisTimedOut: boolean
  noCorpNum: boolean
  nr: Partial<NameRequestI>
  nrData: NrDataIF
  nrOriginal: Partial<NameRequestI>
  nrRequestNameMap: RequestNameMapI[]
  nrRequiredModalVisible: boolean
  pickEntityModalVisible: boolean
  pickRequestTypeModalVisible: boolean
  priorityRequest: boolean
  quickSearchNames: any[]
  request_action_cd: RequestCode
  request_jurisdiction_cd: string
  requestExaminationOrProvideConsent: RequestOrConsentIF
  showActualInput: boolean
  stats: StatsI
  submissionTabNumber: number
  submissionType: SubmissionTypeT
  tabNumber: number
  userCancelledAnalysis: boolean
  isLoadingSubmission: boolean
  waitingAddressSearch: WaitingAddressSearchI
  hotjarUserId: string
}
