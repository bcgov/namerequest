<template>
  <v-dialog :value="isVisible" persistent>
    <v-card>

      <v-card-title class="d-flex justify-space-between">
        <div>Receipts</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="fetchError" color="error" icon="mdi-alert" outlined class="my-0" v-html="fetchError" />
        <payment-summary v-else v-for="summary in paymentSummaries"
          :key="summary.id"
          :summary="summary"
        />
      </v-card-text>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import PaymentSummary from '@/components/payment/payment-summary.vue'
import PaymentModule from '@/modules/payment'
import * as PaymentTypes from '@/modules/payment/store/types'
import { NameRequestMixin, PaymentMixin, PaymentSessionMixin } from '@/mixins'

@Component({
  components: {
    PaymentSummary
  }
})
export default class ReceiptsDialog extends Mixins(NameRequestMixin, PaymentMixin, PaymentSessionMixin) {
  /** Used to display a fetch error, if any. */
  protected fetchError = ''

  /** The model value for the dialog component. */
  private isVisible = false

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return PaymentModule[PaymentTypes.PAYMENT_HISTORY_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  private async hideModal () {
    await PaymentModule.togglePaymentHistoryModal(false)
  }

  /** Depending on value, fetches data and makes this modal visible or hides it. */
  @Watch('showModal')
  private async onShowModal (val: boolean) {
    if (val) {
      // only make visible on success, otherwise hide it
      if (await this.fetchData()) {
        this.isVisible = true
      } else {
        await this.hideModal()
      }
    } else {
      this.isVisible = false
    }
  }

  /**
   * Fetches the NR's payments.
   * @returns True if successful, otherwise False
   */
  private async fetchData (): Promise<boolean> {
    const { nrId } = this
    if (!nrId) return false
    // NB: errors are handled by PaymentMixin
    return this.fetchNrPayments(nrId)
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";

::v-deep .v-dialog {
  width: 50rem;
  min-width: 45rem;
}

.payment-summary {
  border-top: solid 1px $gray3;
}

.payment-summary:last-of-type {
  border-bottom: solid 1px $gray3;
}
</style>
