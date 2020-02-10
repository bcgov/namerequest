export type DisplayedComponentT = 'ExistingRequestSearch' | 'ExistingRequestDisplay' | 'NewRequest'
export type LocationT = 'BC' | 'CA' | 'IN'
export type NrDataResponseT = RequestDataI | null
export type NrDataT = string | null
export type SearchComponentT = 'search' | 'analyzing' | 'results'
export type KeyOf = keyof naneAnalysisI


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
export interface naneAnalysisI {
  header: string
  issues: [
    {
      consenting_body ?: {
        name: string
        contact: string
      }
      conflicts ?: {
        name: string
        date: string
      }
      designations ?: string[]
      issue_type:  string
      line1 ?: string
      line2 ?: string
      name_actions ?: [
        {
          type: 'brackets' | 'highlight' | 'spelling' | 'strike'
          index: number
          word: string
          position ?: 'start' | 'end'
          message ?: string
        }
      ]
      setup: {
        button ?: 'examine' | 'reserve' | 'consent' | 'restart' | 'next'
        checkbox ?: 'examine' | 'consent'
        header: string
        text1: string
        text2 ?: string
      }
      show_examination_button: boolean
      show_resere_button: boolean
    }
  ]
  status: 'fa' | 'rc' | 'ar'
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
