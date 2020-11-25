<template>
  <v-dialog width="30rem" :value="isVisible" persistent v-if="payments">
    <v-card>

      <v-card-title>Payment History</v-card-title>

      <v-card-text>
        <payment-summary v-for="summary in paymentSummaries"
          :key="summary.id"
          :id="summary.id"
          :summary="summary.payment"
          :receipt="summary.receipt"
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn outlined id="history-close-btn" class="outlined" @click="hideModal()">Close</v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import PaymentSummary from '@/components/payment/payment-summary.vue'

import paymentModule from '@/modules/payment'

import * as paymentTypes from '@/modules/payment/store/types'

import PaymentMixin from '@/components/payment/payment-mixin'
import PaymentSessionMixin from '@/components/payment/payment-session-mixin'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

@Component({
  components: {
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

<style lang="scss" scoped>
.payment-summary:not(:first-of-type) {
  margin-top: 1.5rem;
}
</style>
