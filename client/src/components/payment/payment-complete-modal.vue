<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>Payment Successful</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="copy-normal">
        <payment-confirm
          :nrNum="nrNum"
          :applicant="applicant"
          :nameChoices="nameChoices"
          :name="name"
          :summary="summary"
          :receipt="paymentReceipt"
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="hideModal()" id="receipt-close-btn" class="normal" text>Done</v-btn>
        <v-btn @click="downloadReceipt()" id="receipt-download-btn" class="primary" text>Download Receipt</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Vue, Watch } from 'vue-property-decorator'

import PaymentConfirm from '@/components/payment/payment-confirm.vue'
import RequestDetails from '@/components/common/request-details.vue'

import paymentModule from '@/modules/payment'
import { NameRequestPayment, PaymentStatus, SbcPaymentStatus } from '@/modules/payment/models'
import newRequestModule from '@/store/new-request-module'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'

import * as paymentTypes from '@/modules/payment/store/types'
import { PaymentAction, RollbackActions } from '@/enums'

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
    PaymentConfirm
  },

  data: () => ({
    checkPaymentStatusCount: 0
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
      // Make sure edit mode is disabled or it will screw up the back button
      await newRequestModule.mutateEditMode(false)
      // Call fetchData to load the NR and the payment
      await this.fetchData()
    }
  }

  async hideModal () {
    const { nrId } = this
    await this.fetchNr(+nrId)
    await paymentModule.toggleReceiptModal(false)
  }

  async fetchNr (nrId: number): Promise<void> {
    const nrData = await newRequestModule.getNameRequest(nrId)
    await newRequestModule.loadExistingNameRequest(nrData)
  }

  /**
   * NOTE: This method makes use of the PaymentSectionMixin class!
   */
  async fetchData () {
    this.$data.checkPaymentStatusCount = 0
    const { sessionPaymentId, sessionNrId } = this
    await this.fetchNr(+sessionNrId)
    await this.fetchPaymentData(sessionPaymentId, +sessionNrId)
    sessionStorage.removeItem('payment')
    sessionStorage.removeItem('paymentInProgress')
    sessionStorage.removeItem('paymentId')
    sessionStorage.removeItem('paymentToken')
    sessionStorage.removeItem('nrId')
  }

  async fetchPaymentData (paymentId: number, nameReqId: number) {
    if (++this.$data.checkPaymentStatusCount >= 10) {
      return
    }
    if (++this.$data.checkPaymentStatusCount === 8) {
      await this.completePayment(nameReqId, paymentId, this.sessionPaymentAction)
    }
    if (nameReqId && paymentId) {
      await this.fetchNrPayment(nameReqId, paymentId)
      const { nrId, paymentStatus, sbcPaymentStatus } = this
      if (sbcPaymentStatus === SbcPaymentStatus.COMPLETED && paymentStatus === PaymentStatus.COMPLETED) {
        this.$root.$emit('paymentComplete', true)
        await paymentModule.toggleReceiptModal(true)
        return
      } else if (sbcPaymentStatus === SbcPaymentStatus.COMPLETED && paymentStatus === PaymentStatus.CREATED) {
        let vue = this
        setTimeout(() => {
          vue.fetchPaymentData(paymentId, nrId)
        }, 2000)
      }
    }
  }

  async completePayment (nrId: number, paymentId: number, action: string) {
    const result: NameRequestPayment = await newRequestModule.completePayment({ nrId, paymentId, action })
    const paymentSuccess = result?.paymentSuccess

    if (paymentSuccess) {
      paymentModule.toggleReceiptModal(true)
    } else if (!paymentSuccess && result?.paymentErrors) {
      // Setting the errors to state will update any subscribing components, like the main ErrorModal
      await errorModule.setAppErrors(result.paymentErrors)
      if (action && action === PaymentAction.COMPLETE) {
        // Cancel the NR using the rollback endpoint if we were processing a NEW NR
        await newRequestModule.rollbackNameRequest({ nrId, action: RollbackActions.CANCEL })
      }
    } else {
      // if we get here, it's because completePayment() failed (which is already reported)
    }
  }

  get summary () {
    return {
      completionDate: this.paymentDate,
      statusCode: this.sbcPaymentStatus
    }
  }

  @Watch('isVisible')
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        this.$el.querySelector("#receipt-close-btn > span")?.classList.add("payment-successful-done-btn")
        this.$el.querySelector("#receipt-download-btn > span")?.classList.add("payment-successful-download-btn")
      })
    }
  }
}
</script>
