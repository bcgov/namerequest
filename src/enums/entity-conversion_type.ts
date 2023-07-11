import { EntityType } from './entity-type'

/** Enum for Conversion Type codes. */
export enum ConversionType {
  UC = 'UC',
  CCV = 'CCV',
  BECV = 'BECV',
  BECR = 'BECR',
  ULCB = 'ULCB',
  ULBE = 'ULBE',
}

export type EntityConversionType = EntityType | ConversionType
