export type DisplayedComponentT = 'ExistingRequestSearch' | 'ExistingRequestDisplay' | 'NewRequest'
export type LocationT = 'BC' | 'CA' | 'IN'
export type NrDataResponseT = RequestDataI | null
export type NrDataT = string | null
export type SearchComponentT = 'search' | 'analyzing' | 'results'

export interface AnalysisJSONI {
  issues: Array<IssueI>
  status: string
}
export interface EntityI {
  text: string
  value: string
  cat?: string
  blurb?: string[] | string
  shortlist?: boolean
  rank?: number
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
export interface IssueI {
  consenting_body: Object
  issue_type: string
  name_actions: NameActionI[]
  designations: string[]
  descriptive_words?: [
    {
      category: string
      word_list: string[]
    }
  ]
  show_examination_button: boolean
  conflicts?: [
    {
      name: string
      date: string
    }
  ]
  word: string,
  word_index: number
}
export interface NameActionI {
  type: string
  position?: string
  message?: string
  word_index: number
}
export interface NewRequestNameSearchI {
  name: string
  request_type: string
  entity_type: string
  location: LocationT
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
  email?: string
  phone?: string
}
export interface SelectOptionsI {
  text: string
  value: any
  [propName: string]: any
}
