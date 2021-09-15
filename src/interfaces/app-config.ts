import { EnvConfigI, DesignationI, JurisdictionI } from '@/interfaces'
import { ConversionTypesI, RequestActionsI } from '@/interfaces/models'

export interface AppConfigI extends EnvConfigI {
  // System codes
  $allDesignationsList: any[]
  $conversionTypes: ConversionTypesI[]
  $designations: DesignationI[]
  $requestActions: RequestActionsI[]
  $usaStateCodes: JurisdictionI[]
}
