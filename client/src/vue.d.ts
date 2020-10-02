import Vue from 'vue-property-decorator'

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

declare module 'vue/types/vue' {
  interface Vue {
    $PAYMENT_PORTAL_URL?: string
    $designations: DesignationI[]
    $canJurisdictions: JurisdictionI[]
    $intJurisdictions: JurisdictionI[]
    $xproMapping: MappingI[]
  }
}
