import { EnvConfigI, DesignationI, JurisdictionI, MappingI } from '@/interfaces'

export interface AppConfigI extends EnvConfigI {
  // System codes
  $designations: DesignationI[]
  $canJurisdictions: JurisdictionI[]
  $intJurisdictions: JurisdictionI[]
  $xproMapping: MappingI[]
}
