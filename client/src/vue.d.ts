import { EnvConfigI } from './plugins/getConfig'

export interface DesignationI {
  words: string[]
  end: boolean
}

export interface JurisdictionI {
  value: string
  text: string
  SHORT_DESC: string
}

export interface MappingI {
  ASSUMED: string[]
  [propname: string]: string[]
}

interface AppConfigI extends EnvConfigI {
  // System codes
  $designations: DesignationI[]
  $canJurisdictions: JurisdictionI[]
  $intJurisdictions: JurisdictionI[]
  $xproMapping: MappingI[]
}

declare module 'vue/types/vue' {
  interface Vue extends AppConfigI {}
}
