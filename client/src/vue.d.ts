import Vue from 'vue-property-decorator'

interface Designation {
  words: string[]
  end: boolean
}

declare module 'vue/types/vue' {
  interface Vue {
    $PAYMENT_PORTAL_URL?: string
    $designations: Designation[]
  }
}
