<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Payment History</v-card-text>
      <v-card-text class="copy-normal">
        <payment-summary
          v-bind:nrNum="nrNum"
          v-bind:applicant="applicant"
          v-bind:nameChoices="nameChoices"
          v-bind:name="name"
          v-bind:invoice="paymentInvoice"
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

/**
 * Makes debugging the receipt easier.
 * Usage:
 * Set to true and complete a name reservation.
 * The session information for the payment won't be cleared
 * which activates the receipt modal.
 *
 * Make sure this is set to false when you're done!
 */
const DEBUG_RECEIPT = false

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
  mounted () {
    const { sessionPaymentId } = this
    // Check for a payment ID in sessionStorage, if it has been set, we've been redirected away from the application,
    // and need to rehydrate the application using the payment ID (for now, it could be some other token too)!
    // TODO: Set the timer here!
    if (sessionPaymentId) {
      // TODO: Remember to clear the session when we're done building this out
      this.fetchData(!DEBUG_RECEIPT)
        .then(() => {
        })
    }
  }

  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
  }

  async showModal () {
    await paymentModule.togglePaymentHistoryModal(true)
  }

  async hideModal () {
    await paymentModule.togglePaymentHistoryModal(false)
  }

  async redirectToStart () {
    window.location.href = document.baseURI
  }

  /**
   * NOTE: This method makes use of the PaymentSectionMixin class!
   */
  async fetchData (clearSession: boolean = true) {
    const { sessionPaymentId, sessionNrId } = this

    // TODO: We need to make sure we get the correct NR number here? Or somewhere soon...
    if (clearSession) {
      // TODO: Remove this one, we don't want to set the payment to session once we're done!
      // TODO: Or... we could add a debug payments mode?
      sessionStorage.removeItem('payment')
      // Clear the sessionStorage variables
      sessionStorage.removeItem('paymentInProgress')
      sessionStorage.removeItem('paymentId')
      sessionStorage.removeItem('paymentToken')
      sessionStorage.removeItem('nrId')
    }

    if (sessionNrId && sessionPaymentId) {
      // Get the payment
      await this.fetchNr(sessionNrId)
      // Get the payment
      await this.fetchNrPayment(sessionNrId, sessionPaymentId)
    }
  }
}
</script>
