import {
  AnalysisJSONI,
  ApplicantI,
  ConversionTypesI,
  EntityI,
  ExistingRequestSearchI,
  LocationT, NameRequestI, RequestActionsI, RequestNameI,
  SelectOptionsI, StatsI, SubmissionTypeT, WaitingAddressSearchI
} from '@/interfaces/models'
import { NameChoicesIF, NrDataIF, RequestOrConsentIF } from '@/interfaces'

interface RequestNameMapI extends RequestNameI {}

export interface NewRequestIF {
  actingOnOwnBehalf: boolean,
  addressSuggestions: any[],
  allowAutoApprove: boolean,
  analysisJSON: AnalysisJSONI | null,
  analyzePending: boolean,
  applicant: ApplicantI,
  assumedNameOriginal: string,
  conditionsModalVisible: boolean,
  exitModalVisible: boolean,
  conflictId: string | null,
  conversionType: string,
  conversionTypeAddToSelect: ConversionTypesI | null,
  conversionTypes: ConversionTypesI[],
  corpNum: string,
  corpSearch: string,
  designationIssueTypes: string[],
  displayedComponent: string,
  doNotAnalyzeEntities: string[],
  editMode: boolean,
  entity_type_cd: string,
  entityTypeAddToSelect: SelectOptionsI | null,
  entityTypesBCData: EntityI[],
  entityTypesXPROData: EntityI[],
  errors: string[],
  existingRequestSearch: ExistingRequestSearchI,
  extendedRequestType: SelectOptionsI | null,
  getNameReservationFailed: boolean,
  helpMeChooseModalVisible: boolean,
  incorporateLoginModalVisible: boolean,
  affiliationErrorModalVisible: boolean,
  isPersonsName: boolean,
  issueIndex: number,
  location: LocationT,
  locationInfoModalVisible: boolean,
  mrasSearchInfoModalVisible: boolean,
  mrasSearchResultCode: number,
  name: string,
  nameOriginal: string,
  nameChoices: NameChoicesIF
  nameIsEnglish: boolean,
  nameAnalysisTimedOut: boolean,
  noCorpNum: boolean,
  noCorpDesignation: boolean,
  nr: Partial<NameRequestI>,
  nrData: NrDataIF,
  nrOriginal: Partial<NameRequestI>,
  nrRequestNameMap: RequestNameMapI[],
  nrRequiredModalVisible: boolean,
  pickEntityModalVisible: boolean,
  pickRequestTypeModalVisible: boolean,
  priorityRequest: boolean,
  quickSearch: boolean,
  quickSearchNames: object[],
  request_action_cd: string,
  request_jurisdiction_cd: string,
  requestExaminationOrProvideConsent: RequestOrConsentIF,
  requestActions: RequestActionsI[],
  requestActionOriginal: string,
  showActualInput: boolean,
  stats: StatsI | null,
  submissionTabNumber: number,
  submissionType: SubmissionTypeT | null,
  tabNumber: number,
  userCancelledAnalysis: boolean,
  isLoadingSubmission: boolean
  waitingAddressSearch: WaitingAddressSearchI | null
}
