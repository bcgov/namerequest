import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ReceiptMixin extends Vue {
  /** Returns the line item description mapped to a user-friendly name. */
  rcptDescToName (description: string): string {
    switch (description) {
      case 'Reg. Submission Online': return 'Name Request'
      case 'Upgrade to Priority': return 'Priority Request'
      default: return description
    }
  }
}
