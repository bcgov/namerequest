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
        <v-alert v-if="fetchError" color="error" icon="mdi-alert" outlined>{{fetchError}}</v-alert>
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
import NameRequestMixin from '@/components/mixins/name-request-mixin'
import PaymentMixin from '@/components/payment/payment-mixin'
import PaymentSessionMixin from '@/components/payment/payment-session-mixin'

@Component({
  components: {
    PaymentSummary
  },
  computed: {
    isVisible: () => PaymentModule[PaymentTypes.PAYMENT_HISTORY_MODAL_IS_VISIBLE]
  }
})
export default class ReceiptsModal extends Mixins(NameRequestMixin, PaymentMixin, PaymentSessionMixin) {
  /** Used to display a fetch error, if any. */
  protected fetchError = ''

  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    this.fetchData()
      .then(() => {
      })
  }

  async showModal () {
    await PaymentModule.togglePaymentHistoryModal(true)
  }

  async hideModal () {
    await PaymentModule.togglePaymentHistoryModal(false)
  }

  /**
   * NOTE: This method makes use of the PaymentSectionMixin class!
   */
  async fetchData () {
    const { nrId } = this
    if (nrId) {
      // Get the payments if an NR ID has been set!
      await this.fetchNrPayments(nrId)
    }
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
