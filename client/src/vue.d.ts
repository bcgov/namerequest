import Vue from 'vue-property-decorator'

declare module 'vue/types/vue' {
  interface Vue {
    $PAYMENT_PORTAL_URL?: string
  }
}
