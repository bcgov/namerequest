<template>
  <v-dialog min-width="32rem" max-width="45rem" :value="isVisible" persistent>
    <v-card>
      <v-tabs id="confirm-nr-tabs">
        <v-tabs-items v-model="paymentTab">

          <v-tab-item>
            <v-card-title class="d-flex justify-space-between">
              <div>Staff Payment</div>
              <v-btn icon large class="dialog-close float-right" @click="hideModal()">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text class="copy-normal pt-5">
              <StaffPayment
                ref="staffPaymentComponent"
                @isValid="isStaffPaymentValid = $event"
              />
            </v-card-text>

            <v-card-actions class="justify-center pt-6">
              <v-btn
                @click="confirmPayment()"
                id="confirm-nr-submit-btn"
                class="primary px-5"
                :loading="isLoadingPayment">Submit Name Request</v-btn>
              <v-btn
                @click="goBack()"
                id="confirm-nr-back-btn"
                class="button-blue px-5"
                :disabled="isLoadingPayment">Back</v-btn>
            </v-card-actions>
          </v-tab-item>

          <v-tab-item>
            <v-card-title class="d-flex justify-space-between">
              <div>Confirm Name Request</div>
              <v-btn icon large class="dialog-close float-right" @click="hideModal()">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text class="copy-normal pt-5">
              <RequestDetails
                :applicant="getApplicant"
                :name="getName"
                :nameChoices="getNameChoices"
              />
              <FeeSummary
                class="mt-2"
                :filingData="[...paymentDetails]"
                :fees="[...paymentFees]"
              />
            </v-card-text>

            <v-card-actions class="pt-8">
              <v-btn
                v-if="allowCancel"
                @click="cancelPayment()"
                id="confirm-nr-cancel-btn"
                class="button-red px-5"
                :disabled="isLoadingPayment">Cancel Name Request</v-btn>
              <v-spacer />
              <v-btn
                @click="confirmPayment()"
                id="confirm-nr-continue-btn"
                class="primary px-5"
                :loading="isLoadingPayment">Continue to Payment</v-btn>
              <v-btn
                @click="hideModal()"
                id="confirm-nr-close-btn"
                class="button-blue px-5"
                :disabled="isLoadingPayment">Close</v-btn>
            </v-card-actions>
          </v-tab-item>

        </v-tabs-items>
      </v-tabs>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { getFeatureFlag } from '@/plugins'
import FeeSummary from '@/components/payment/fee-summary.vue'
import RequestDetails from '@/components/common/request-details.vue'
import StaffPayment from '@/components/payment/staff-payment.vue'
import { CreatePaymentParams } from '@/modules/payment/models'
import { CONFIRM_NR_MODAL_IS_VISIBLE } from '@/modules/payment/store/types'
import * as FilingTypes from '@/modules/payment/filing-types'
import { Jurisdictions, PaymentAction } from '@/enums'
import { PaymentMixin, PaymentSessionMixin, DisplayedComponentMixin } from '@/mixins'
import { getBaseUrl } from '@/components/payment/payment-utils'
import { NameChoicesIF } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    RequestDetails,
    FeeSummary,
    StaffPayment
  }
})
export default class ConfirmNrDialog extends Mixins(
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  // the tab indices
  // NB: these are reversed to reverse the built-in slide transition
  readonly TAB_STAFF_PAYMENT = 0
  readonly TAB_CONFIRM_NAME_REQUEST = 1

  // Refs
  $refs!: {
    staffPaymentComponent: StaffPayment
  }

  @Prop({ default: async () => {} })
  readonly onCancel: Function

  // Global getters
  @Getter getName!: string
  @Getter getNameChoices!: NameChoicesIF
  @Getter getPriorityRequest!: boolean
  @Getter isRoleStaff!: boolean

  // Global actions
  @Action toggleConfirmNrModal!: ActionBindingIF

  /** Whether staff payment is valid. */
  private isStaffPaymentValid = false

  /** The current tab to display. */
  private paymentTab = this.TAB_CONFIRM_NAME_REQUEST

  /** Whether payment redirection is in progress. */
  private isLoadingPayment = false

  /** Whether this dialog is visible. */
  private isVisible = false

  /** Whether to show Cancel button. */
  private get allowCancel (): boolean {
    return (typeof this.$props.onCancel === 'function')
  }

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return this.$store.getters[CONFIRM_NR_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  async hideModal () {
    this.isLoadingPayment = false
    await this.toggleConfirmNrModal(false)
  }

  /** Depending on value, fetches fees and makes this modal visible or hides it. */
  @Watch('showModal')
  async onShowModal (val: boolean): Promise<void> {
    if (val) {
      // reset tab id
      this.paymentTab = this.TAB_CONFIRM_NAME_REQUEST

      const paymentConfig = {
        filingType: FilingTypes.NM620,
        jurisdiction: Jurisdictions.BC,
        priorityRequest: this.getPriorityRequest || false
      }

      // only make visible on success, otherwise hide it
      if (await this.fetchFees(paymentConfig)) {
        this.isVisible = true
      } else {
        await this.hideModal()
      }
    } else {
      this.isVisible = false
    }
  }

  /** Called when staff clicks "Back" button. */
  goBack () {
    // disable validation
    this.$refs.staffPaymentComponent && this.$refs.staffPaymentComponent.setValidation(false)
    // go to previous tab
    this.paymentTab = this.TAB_CONFIRM_NAME_REQUEST
  }

  /** Called when user clicks "Continue to Payment" button. */
  async confirmPayment () {
    if (this.isRoleStaff && getFeatureFlag('staff-payment-enabled')) {
      if (this.paymentTab === this.TAB_CONFIRM_NAME_REQUEST) {
        // disable validation
        this.$refs.staffPaymentComponent && this.$refs.staffPaymentComponent.setValidation(false)
        // go to next tab
        this.paymentTab = this.TAB_STAFF_PAYMENT
        return
      }
      if (this.paymentTab === this.TAB_STAFF_PAYMENT) {
        // enable validation
        this.$refs.staffPaymentComponent && this.$refs.staffPaymentComponent.setValidation(true)
        // if invalid then stop, else continue
        if (!this.isStaffPaymentValid) return
      }
    }

    this.isLoadingPayment = true
    const { getNrId, getPriorityRequest } = this

    const onSuccess = (paymentResponse) => {
      const { paymentId, paymentToken } = this

      // Save response to session
      this.savePaymentResponseToSession(PaymentAction.CREATE, paymentResponse)

      // See if redirect is needed else go to existing NR screen
      const baseUrl = getBaseUrl()
      const redirectUrl = encodeURIComponent(`${baseUrl}/nr/${getNrId}/?paymentId=${paymentId}`)
      if (paymentResponse.sbcPayment.isPaymentActionRequired) {
        this.redirectToPaymentPortal(paymentId, paymentToken, redirectUrl)
      } else {
        window.location.href = redirectUrl
      }
    }

    const success = await this.createPayment({
      action: PaymentAction.CREATE,
      nrId: getNrId,
      filingType: FilingTypes.NM620,
      priorityRequest: getPriorityRequest
    } as CreatePaymentParams, onSuccess)

    // on error, close this modal so error modal is visible
    if (!success) {
      await this.hideModal()
    }
  }

  /** Called when user clicks "Cancel Name Request" button. */
  async cancelPayment () {
    // rollback the NR
    this.$props.onCancel()
    // close this modal
    await this.hideModal()
  }

  @Watch('isVisible')
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const confirmNrCancelBtn = this.$el.querySelector('#confirm-nr-cancel-btn > span')
          if (confirmNrCancelBtn) confirmNrCancelBtn.classList.add('confirm-nr-cancel-btn')
          const confirmNrContinueBtn = this.$el.querySelector('#confirm-nr-continue-btn > span')
          if (confirmNrContinueBtn) confirmNrContinueBtn.classList.add('confirm-nr-continue-btn')
          const confirmNrSubmitBtn = this.$el.querySelector('#confirm-nr-submit-btn > span')
          if (confirmNrSubmitBtn) confirmNrSubmitBtn.classList.add('confirm-nr-submit-btn')
          const confirmNrCloseBtn = this.$el.querySelector('#confirm-nr-close-btn > span')
          if (confirmNrCloseBtn) confirmNrCloseBtn.classList.add('confirm-nr-close-btn')
          const confirmNrBackBtn = this.$el.querySelector('#confirm-nr-back-btn > span')
          if (confirmNrBackBtn) confirmNrBackBtn.classList.add('confirm-nr-back-btn')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
// hide tabs bar
::v-deep .v-tabs > .v-tabs-bar {
  display: none;
}

// adjust top whitespace so 'X' button is not cropped
.v-tabs-items {
  padding-top: 0.5rem;
  margin-top: -0.5rem;
}
</style>
