import { EnvConfigI, DesignationI, JurisdictionI, MappingI, RequestActionMappingI } from '@/interfaces'
import { ConversionTypesI, EntityI, RequestActionsI } from '@/interfaces/models'

export interface AppConfigI extends EnvConfigI {
  // System codes
  $designations: DesignationI[]
  $canJurisdictions: JurisdictionI[]
  $mrasJurisdictions: JurisdictionI[]
  $intlJurisdictions: JurisdictionI[]
  $conversionTypes: ConversionTypesI[]
  $allDesignationsList: any[]
  $entityTypesBcData: EntityI[]
  $entityTypesXproData: EntityI[]
  $requestActions: RequestActionsI[]
  $locations: any[]
  $bcMapping: RequestActionMappingI
  $xproMapping: MappingI[]
  $colinRequestActions: string[]
  $colinRequestTypes: string[]
  $xproColinRequestTypes: string[]
  $usaStateCodes: JurisdictionI[]
}
