import Vue from 'vue'

declare module 'vue/types/vue' {
  interface Vue {
    $PAYMENT_PORTAL_URL?: string
  }
}
