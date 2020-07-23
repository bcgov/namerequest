export type LocationT = 'BC' | 'CA' | 'FD' | 'IN' | 'INFO'
export type NameReqT = DraftReqI | ConditionalReqI | ReservedReqI
export type NrDataResponseT = RequestDataI | null
export type NrDataT = string | null
export type SubmissionTypeT = 'examination' | 'consent' | 'normal'

export interface AnalysisJSONI {
  header?: string
  issues: IssueI[] | null
  status: 'fa' | 'rc' | 'ar'
}
export interface ApplicantI {
  addrLine1: string
  addrLine2?: string
  city: string
  clientFirstName?: string
  clientLastName?: string
  contact: string
  countryTypeCd: string
  emailAddress: string
  faxNumber?: string
  firstName: string
  lastName: string
  middleName?: string
  partyId?: number
  phoneNumber?: string
  postalCd: string
  stateProvinceCd: string
}
export interface ConditionalReqI {
  additionalInfo: string
  applicants: [ ApplicantI ]
  corpNum?: string
  english: boolean
  entity_type: string
  homeJurisNum?: string
  id?: number
  nameFlag: boolean
  names: RequestNameI[]
  natureBusinessInfo: string
  previousRequestId?: string
  priorityCd: string
  request_action: string
  stateCd: 'COND-RESERVE'
  submit_count: number
  tradeMark: string
  xproJurisdiction?: string
}
export interface ConsentConflictI {
  name: string
  [propName: string]: any
}
export interface DraftReqI {
  additionalInfo: string
  applicants: [ ApplicantI ]
  corpNum?: string
  english: boolean
  entity_type: string
  homeJurisNum?: string
  id?: number
  nameFlag: boolean
  names: RequestNameI[]
  natureBusinessInfo: string
  previousRequestId?: string
  priorityCd: string
  request_action: string
  stateCd: 'DRAFT'
  submit_count: number
  tradeMark: string
  xproJurisdiction?: string
}
export interface EntityI {
  blurb?: string[] | string
  cat?: string
  rank?: number
  shortlist?: boolean
  text: string
  value: string
}
export interface ExistingRequestSearchI {
  emailAddress?: string
  nrNum: string
  phoneNumber?: string
}
export interface IssueI {
  conflicts?: {
    name: string
    date: string
  }
  consenting_body?: {
    name: string
    contact: string
  }
  designations?: string[]
  issue_type: string
  line1?: string
  line2?: string
  name_actions?: [
    {
      index: number
      message ?: string
      position ?: 'start' | 'end'
      type: 'brackets' | 'highlight' | 'spelling' | 'strike'
      word: string
    }
  ]
  setup: SetupI[]
  show_examination_button: boolean
  show_reservxe_button: boolean
}
export interface NameDesignationI {
  designation: string
  name: string
}
export interface NewRequestNameSearchI {
  entity_type: string
  location: LocationT
  name: string
  request_action: string
}
export interface OptionI {
  button?: string
  checkbox?: string
  header: string
  label?: string
  line1: string
  line2?: string
  type: string
}
export interface QuillOpsI {
  insert: string
  attributes?: QuillAttributesI
}
export interface RequestDataI {
  id?: number
  nrNumber: number
  name: string
  conditions?: string
  applicantName: string
  address: string
  status: string
  expiry: string
}
export interface RequestNameI {
  id?: number
  choice: number
  name: string
  name_type_cd: string
  designation: string
  consent_words: "" | string[]
  conflict1: string
  conflict1_num: string
}
export interface ReservedReqI {
  id?: number
  additionalInfo: string
  applicants: [ ApplicantI ]
  corpNum?: string
  english: boolean
  entity_type: string
  homeJurisNum?: string
  nameFlag: boolean
  names: RequestNameI[]
  natureBusinessInfo: string
  previousRequestId?: string
  priorityCd: string
  request_action: string
  stateCd: 'RESERVED'
  submit_count: number
  tradeMark: string
  xproJurisdiction?: string
}
export interface SearchDataI {
  emailAddress?: string
  name?: string
  nrNumber?: string
  phoneNumber?: string
}
export interface SelectionI {
  index?: number
  length?: number
}
export interface SelectOptionsI {
  text: string
  value: any
  [propName: string]: any
}
export interface SetupI {
  button?: 'examine' | 'reserve' | 'consent-body' | 'consent-corp' | 'restart' | 'next'
  checkbox?: 'examine' | 'consent-corp' | 'consent-body'
  header: string
  text1: string
  text2?: string
}
export interface StatsI {
  auto: number,
  priority: {
    unit: string
    value: number,
  },
  standard: {
    unit: string
    value: number,
  }
}
export interface WaitingAddressSearchI {
  text: string
  value: string
}
export interface RequestDataI {
  [propname: string]: any
}
interface QuillAttributesI {
  color: string
  strike?: boolean
}
