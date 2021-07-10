import { NameCheckErrorType } from '@/enums'

export interface NameCheckErrorI {
  [NameCheckErrorType.errorDesignation]: boolean
  [NameCheckErrorType.errorExact]: boolean
  [NameCheckErrorType.errorRestricted]: boolean
  [NameCheckErrorType.errorSimilar]: boolean
  [NameCheckErrorType.errorStructure]: boolean
}