<template>
  <v-dialog max-width="45rem" :value="showModal" persistent>
    <v-card>
      <v-card-title class="d-flex justify-space-between mt-n3">
        <div>Payment Successful</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="copy-normal pt-4">
        <payment-confirm
          :nrNum="getNrNum"
          :applicant="getApplicant"
          :nameChoices="getNameChoices"
          :name="getName"
          :summary="summary"
          :receipt="paymentReceipt"
        />
      </v-card-text>

      <v-card-actions class="pt-1 justify-center">
        <v-btn id="receipt-download-btn" class="primary px-4" :loading="loading" @click="downloadReceipt()">
          <span>Download Receipt</span>
        </v-btn>
        <v-btn id="receipt-close-btn" class="button-blue px-4" @click="hideModal()">
          <span>Done</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import PaymentConfirm from '@/components/payment/payment-confirm.vue'
import RequestDetails from '@/components/common/request-details.vue'
import paymentModule from '@/modules/payment'
import { NameRequestPayment } from '@/modules/payment/models'
import errorModule from '@/modules/error'
import * as paymentTypes from '@/modules/payment/store/types'
import { PaymentStatus, SbcPaymentStatus } from '@/enums'
import { CommonMixin, PaymentMixin, PaymentSessionMixin } from '@/mixins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { ApplicantI, NameChoicesIF } from '@/interfaces'
import { PAYMENT_COMPLETE_MODAL_IS_VISIBLE } from '@/modules/payment/store/types'

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
  }
})
export default class PaymentCompleteDialog extends Mixins(
  CommonMixin,
  PaymentMixin,
  PaymentSessionMixin
) {
  // Global getters
  @Getter getName!: string
  @Getter getNrId!: number
  @Getter getNrNum!: string
  @Getter getApplicant!: ApplicantI
  @Getter getNameChoices!: NameChoicesIF

  // Global actions
  @Action setCompletePayment!: ActionBindingIF
  @Action getNameRequest!: ActionBindingIF
  @Action loadExistingNameRequest!: ActionBindingIF
  @Action setEditMode!: ActionBindingIF
  @Action toggleReceiptModal!: ActionBindingIF

  /** Used to show loading state on button. */
  private loading = false

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return this.$store.getters[PAYMENT_COMPLETE_MODAL_IS_VISIBLE]
  }

  async mounted () {
    const { sessionPaymentId, sessionPaymentAction } = this
    // Check for a payment ID in sessionStorage, if it has been set, we've been redirected away from the application,
    // and need to rehydrate the application using the payment ID (for now, it could be some other token too)!
    if (sessionPaymentId && sessionPaymentAction) {
      // Make sure edit mode is disabled or it will screw up the back button
      await this.setEditMode(false)
      // Load the NR and the payment
      await this.fetchData()
    }
  }

  async hideModal () {
    await this.fetchNr(+this.getNrId)
    await this.toggleReceiptModal(false)
  }

  async fetchNr (nrId: number): Promise<void> {
    const nrData = await this.getNameRequest(nrId)
    await this.loadExistingNameRequest(nrData)
  }

  /**
   * NOTE: This method makes use of the PaymentSectionMixin class!
   */
  async fetchData () {
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
    if (nameReqId && paymentId) {
      await this.fetchNrPayment(nameReqId, paymentId)
      const { getNrId, paymentStatus, sbcPaymentStatus } = this
      if (sbcPaymentStatus === SbcPaymentStatus.COMPLETED && paymentStatus === PaymentStatus.CREATED) {
        await this.completePayment(nameReqId, paymentId, this.sessionPaymentAction)
      }
    }
  }

  async completePayment (nrId: number, paymentId: number, action: string) {
    const result: NameRequestPayment = await this.setCompletePayment({ nrId, paymentId, action })
    const paymentSuccess = result?.paymentSuccess

    if (paymentSuccess) {
      this.$root.$emit('paymentComplete', true)
      await this.toggleReceiptModal(true)
    } else if (!paymentSuccess && result?.paymentErrors) {
      // Setting the errors to state will update any subscribing components, like the main ErrorModal
      await errorModule.setAppErrors(result.paymentErrors)
    }
  }

  get summary () {
    return {
      completionDate: this.paymentDate,
      statusCode: this.toTitleCase(this.sbcPaymentStatus)
    }
  }

  private async downloadReceipt () {
    const { paymentId } = this
    this.loading = true
    await this.downloadReceiptPdf(paymentId)
    this.loading = false
  }

  @Watch('showModal')
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const paymentSuccessfulDoneBtn = this.$el.querySelector('#receipt-close-btn > span')
          if (paymentSuccessfulDoneBtn) {
            paymentSuccessfulDoneBtn.classList
              .add('payment-successful-done-btn')
          }
          const paymentSuccessfulDownloadBtn = this.$el.querySelector('#receipt-download-btn > span')
          if (paymentSuccessfulDownloadBtn) {
            paymentSuccessfulDownloadBtn.classList
              .add('payment-successful-download-btn')
          }
        }
      })
    }
  }
}
</script>
