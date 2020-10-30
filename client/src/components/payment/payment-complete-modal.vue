<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Payment Successful</v-card-text>
      <v-card-text class="copy-normal">
        <payment-confirm
          v-bind:nrNum="nrNum"
          v-bind:applicant="applicant"
          v-bind:nameChoices="nameChoices"
          v-bind:name="name"
          v-bind:summary="summary"
          v-bind:receipt="paymentInvoice"
        />
      </v-card-text>
      <v-card-actions>
        <!--<span>Time Remaining - 10:00</span>-->
        <v-spacer></v-spacer>
        <v-btn @click="hideModal" id="receipt-close-btn" class="normal" text>Done</v-btn>
        <v-btn @click="downloadReceipt" id="download-receipt-btn" class="primary" text>Download Receipt</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Vue, Watch } from 'vue-property-decorator'

import PaymentConfirm from '@/components/payment/payment-confirm.vue'
import RequestDetails from '@/components/common/request-details.vue'

import paymentModule from '@/modules/payment'
import { NameRequestPayment, SbcPaymentStatus } from '@/modules/payment/models'
import newRequestModule, { ROLLBACK_ACTIONS as rollbackActions } from '@/store/new-request-module'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'

import * as paymentTypes from '@/modules/payment/store/types'
import * as paymentActions from './payment-actions'

import PaymentMixin from '@/components/payment/payment-mixin'
import PaymentSessionMixin from '@/components/payment/payment-session-mixin'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

// TODO: Finish the message component
// import message from "@/components/common/error/message.vue"

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
    PaymentConfirm
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => paymentModule[paymentTypes.PAYMENT_COMPLETE_MODAL_IS_VISIBLE]
  }
})
export default class PaymentCompleteModal extends Mixins(NameRequestMixin, PaymentMixin, PaymentSessionMixin) {
  async mounted () {
    const { sessionPaymentId, sessionPaymentAction } = this
    // Check for a payment ID in sessionStorage, if it has been set, we've been redirected away from the application,
    // and need to rehydrate the application using the payment ID (for now, it could be some other token too)!
    // TODO: Set the timer here!
    if (sessionPaymentId && sessionPaymentAction) {
      // Call fetchData to load the NR and the payment
      await this.fetchData(!DEBUG_RECEIPT)
      // Make sure edit mode is disabled or it will screw up the back button
      await newRequestModule.mutateEditMode(false)
      const { nrId, paymentStatus, sbcPayment = { statusCode: '' } } = this
      const sbcPaymentStatusCode = sbcPayment.statusCode

      // If the payment is already complete for some reason, skip this
      // TODO: Maybe set a constant instead somewhere...
      if (paymentStatus === SbcPaymentStatus.COMPLETED) return
      if (sbcPaymentStatusCode === SbcPaymentStatus.COMPLETED && paymentStatus === SbcPaymentStatus.CREATED) {
        // Then complete the payment
        await this.completePayment(nrId, sessionPaymentId, sessionPaymentAction)
      } else {
        errorModule.setAppError({
          id: 'payment-error',
          error: 'Your payment could not be completed. Please try again at a later time.'
        } as ErrorI)

        if (sessionPaymentAction && sessionPaymentAction === paymentActions.COMPLETE) {
          // Cancel the NR using the rollback endpoint if we were processing a NEW NR
          await newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL })
          // Call fetchData to load the NR and the payment
          await this.fetchData(!DEBUG_RECEIPT)
        }
      }
    }
  }

  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
  }

  async showModal () {
    await paymentModule.toggleReceiptModal(true)
  }

  async hideModal () {
    const { nrId } = this
    await this.fetchNr(nrId)
    await paymentModule.toggleReceiptModal(false)
  }

  async fetchNr (nrId) {
    const existingNr = await newRequestModule.getNameRequest(nrId)
    await newRequestModule.loadExistingNameRequest(existingNr)
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

  async completePayment (nrId: number, paymentId: number, action: string) {
    const result: NameRequestPayment = await newRequestModule.completePayment({ nrId, paymentId, action })
    const paymentSuccess = result.paymentSuccess

    // TODO: Remove this when done implementing tests
    /* const paymentSuccess = false
    result.paymentErrors = [
      { id: 'payment-error', error: 'Something went wrong with the payment, cancelling the Name Request!' }
    ] */

    if (paymentSuccess) {
      paymentModule.toggleReceiptModal(true)
    } else if (!paymentSuccess && result.paymentErrors) {
      // Setting the errors to state will update any subscribing components, like the main ErrorModal
      await errorModule.setAppErrors(result.paymentErrors)
      if (action && action === paymentActions.COMPLETE) {
        // Cancel the NR using the rollback endpoint if we were processing a NEW NR
        await newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL })
      }
    }
  }

  get summary () {
    return {
      completionDate: '',
      statusCode: ''
    }
  }
}
</script>
