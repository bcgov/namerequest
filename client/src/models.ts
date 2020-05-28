export type DisplayedComponentT = 'Tabs' | 'AnalyzePending' | 'AnalyzeResults' | 'SubmissionTabs' | 'AnalyzeCharacters'
export type LocationT = 'BC' | 'CA' | 'IN' | 'INFO'
export type NrDataResponseT = RequestDataI | null
export type NrDataT = string | null
export type SearchComponentT = 'search' | 'analyzing' | 'results'
export type SubmissionTypeT = 'examination' | 'consent' | 'normal'

export interface QuillI {
  setContents(ops: QuillOpsI[]): void
  getRangeAt(index: number): Range
  setText(text: string): void
  getText(): string

}
export interface SelectionI {
  index?: number
  length?: number
}
interface QuillAttributesI {
  color: string
  strike?: boolean
}
export interface QuillOpsI {
  insert: string
  attributes?: QuillAttributesI
}

export interface AnalysisJSONI {
  header?: string
  issues: IssueI[] | null
  status: 'fa' | 'rc' | 'ar'
}
export interface ApplicantI {
  text: string
  value: string
}
export interface ConsentConflictI {
  name: string
  [propName: string]: any
}
export interface EntityI {
  text: string
  value: string
  cat?: string
  blurb?: string[] | string
  shortlist?: boolean
  rank?: number
}
export interface IssueI {
  consenting_body?: {
    name: string
    contact: string
  }
  conflicts?: {
    name: string
    date: string
  }
  designations?: string[]
  issue_type: string
  line1?: string
  line2?: string
  name_actions?: [
    {
      type: 'brackets' | 'highlight' | 'spelling' | 'strike'
      index: number
      word: string
      position ?: 'start' | 'end'
      message ?: string
    }
  ]
  setup: SetupI[]
  show_examination_button: boolean
  show_resere_button: boolean
}
export interface NameDesignationI {
  name: string
  designation: string
}
export interface NewRequestNameSearchI {
  name: string
  request_action: string
  entity_type: string
  location: LocationT
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
export interface PostApplicantI {
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
  phoneNumber?: string
  postalCd: string
  stateProvinceCd: string
}
export interface PostConditionalReqI {
  additionalInfo: string
  applicants: []
  corpNum?: string
  english: boolean
  entity_type: string
  homeJurisNum?: string
  nameFlag: boolean
  names: PostNameI[]
  natureBusinessInfo: string
  previousRequestId?: string
  priorityCd: string
  request_action: string
  stateCd: 'COND-RESERVE'
  submit_count: number
  tradeMark: string
  xproJurisdiction?: string
}

export interface PostDraftReqI {
  additionalInfo: string
  applicants: [ PostApplicantI ]
  corpNum?: string
  english: boolean
  entity_type: string
  homeJurisNum?: string
  nameFlag: boolean
  names: PostNameI[]
  natureBusinessInfo: string
  previousRequestId?: string
  priorityCd: string
  request_action: string
  stateCd: 'DRAFT'
  submit_count: number
  tradeMark: string
  xproJurisdiction?: string
}

export interface PostNameI {
  choice: number
  name: string
  name_type_cd: string
  designation: string
  consent_words: "" | string[]
  conflict1: string
  conflict1_num: string
}
export interface PostReservedReqI {
  additionalInfo: string
  applicants: []
  corpNum?: string
  english: boolean
  entity_type: string
  homeJurisNum?: string
  nameFlag: boolean
  names: PostNameI[]
  natureBusinessInfo: string
  previousRequestId?: string
  priorityCd: string
  request_action: string
  stateCd: 'RESERVED'
  submit_count: number
  tradeMark: string
  xproJurisdiction?: string
}

export interface RequestDataI {
  nrNumber: number
  name: string
  conditions?: string
  applicantName: string
  address: string
  status: string
  expiry: string
}
export interface SearchDataI {
  nrNumber?: string
  name?: string
  emailAddress?: string
  phoneNumber?: string
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
    value: number,
    unit: string
  },
  standard: {
    value: number,
    unit: string
  }
}
