<template>
  <v-dialog max-width="40%" :value="isVisible" persistent v-if="payments">
    <v-card class="pa-9">
      <v-card-text class="h3">Payment History</v-card-text>
      <v-card-text class="copy-normal">
        <payment-summary v-for="summary in paymentSummaries"
          v-bind:key="summary.id"
          v-bind:id="summary.id"
          v-bind:summary="summary.payment"
          v-bind:receipt="summary.receipt"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="hideModal" id="history-close-btn" class="normal" text>Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import RequestDetails from '@/components/common/request-details.vue'
import PaymentSummary from '@/components/payment/payment-summary.vue'

import paymentModule from '@/modules/payment'

import * as paymentTypes from '@/modules/payment/store/types'

import PaymentMixin from '@/components/payment/payment-mixin'
import PaymentSessionMixin from '@/components/payment/payment-session-mixin'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

@Component({
  components: {
    RequestDetails,
    PaymentSummary
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => paymentModule[paymentTypes.PAYMENT_HISTORY_MODAL_IS_VISIBLE]
  }
})
export default class PaymentHistoryModal extends Mixins(NameRequestMixin, PaymentMixin, PaymentSessionMixin) {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    this.fetchData()
      .then(() => {
      })
  }

  async showModal () {
    await paymentModule.togglePaymentHistoryModal(true)
  }

  async hideModal () {
    await paymentModule.togglePaymentHistoryModal(false)
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
