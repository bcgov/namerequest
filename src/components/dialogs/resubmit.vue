<template>
  <v-dialog min-width="32rem" max-width="45rem" :value="isVisible" persistent>
    <v-card>
      <v-tabs id="resubmit-tabs">
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
                id="resubmit-nr-btn"
                class="primary px-5"
                :loading="isLoadingPayment">Resubmit Name Request</v-btn>
              <v-btn
                @click="goBack()"
                id="resubmit-back-btn"
                class="button-blue px-5"
                :disabled="isLoadingPayment">Back</v-btn>
            </v-card-actions>
          </v-tab-item>

          <v-tab-item>
            <v-card-title class="d-flex justify-space-between">
              <div>Resubmit Name Request</div>
              <v-btn icon large class="dialog-close float-right" @click="hideModal()">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text class="copy-normal">
              <!-- TODO: for debugging only - do not commit! -->
              <p v-if="true || !isRoleStaff" class="mb-8">
                If your Name Request has expired, you have 30 days to
                resubmit the same name request for a fee.<br>
                This will generate a new Name Request Number.
              </p>

              <FeeSummary
                :filingData="[...paymentDetails]"
                :fees="[...paymentFees]"
              />
            </v-card-text>

            <v-card-actions class="pt-8 justify-center">
              <!-- <v-spacer></v-spacer> -->
              <v-btn
                @click="confirmPayment()"
                id="resubmit-continue-btn"
                class="primary px-5"
                :loading="isLoadingPayment">Continue to Payment</v-btn>
              <v-btn
                @click="hideModal()"
                id="resubmit-close-btn"
                class="button button-blue px-5">Close</v-btn>
            </v-card-actions>
          </v-tab-item>

        </v-tabs-items>
      </v-tabs>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { getFeatureFlag } from '@/plugins'
import FeeSummary from '@/components/payment/fee-summary.vue'
import StaffPayment from '@/components/payment/staff-payment.vue'
import { CreatePaymentParams } from '@/modules/payment/models'
import { RESUBMIT_MODAL_IS_VISIBLE } from '@/modules/payment/store/types'
import * as FilingTypes from '@/modules/payment/filing-types'
import { Jurisdictions, PaymentAction } from '@/enums'
import { PaymentMixin, PaymentSessionMixin, DisplayedComponentMixin } from '@/mixins'
import { getBaseUrl } from '@/components/payment/payment-utils'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    FeeSummary,
    StaffPayment
  }
})
export default class ResubmitDialog extends Mixins(
  PaymentMixin,
  PaymentSessionMixin,
  DisplayedComponentMixin
) {
  // the tab indices
  // NB: these are reversed to reverse the built-in slide transition
  readonly TAB_STAFF_PAYMENT = 0
  readonly TAB_RESUBMIT_NAME_REQUEST = 1

  // Refs
  $refs!: {
    staffPaymentComponent: StaffPayment
  }

  // Global getters
  @Getter getPriorityRequest!: boolean
  @Getter isRoleStaff!: boolean

  // Global action
  @Action toggleResubmitModal!: ActionBindingIF

  /** Whether staff payment is valid. */
  private isStaffPaymentValid = false

  /** The current tab to display. */
  private paymentTab = this.TAB_RESUBMIT_NAME_REQUEST

  /** Whether payment redirection is in progress. */
  private isLoadingPayment = false

  /** Whether this dialog is visible. */
  private isVisible = false

  /** Whether this modal should be shown (per store property). */
  private get showModal (): boolean {
    return this.$store.getters[RESUBMIT_MODAL_IS_VISIBLE]
  }

  /** Clears store property to hide this modal. */
  async hideModal () {
    this.isLoadingPayment = false
    await this.toggleResubmitModal(false)
  }

  /** Depending on value, fetches fees and makes this modal visible or hides it. */
  @Watch('showModal')
  async onShowModal (val: boolean): Promise<void> {
    if (val) {
      // reset tab id
      this.paymentTab = this.TAB_RESUBMIT_NAME_REQUEST

      const paymentConfig = {
        filingType: FilingTypes.NM606,
        jurisdiction: Jurisdictions.BC,
        priorityRequest: this.getPriorityRequest
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
    this.paymentTab = this.TAB_RESUBMIT_NAME_REQUEST
  }

  /** Called when user clicks "Accept" button. */
  private async confirmPayment () {
    if (this.isRoleStaff && getFeatureFlag('staff-payment-enabled')) {
      if (this.paymentTab === this.TAB_RESUBMIT_NAME_REQUEST) {
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
      this.savePaymentResponseToSession(PaymentAction.RESUBMIT, paymentResponse)

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
      action: PaymentAction.RESUBMIT,
      nrId: getNrId,
      filingType: FilingTypes.NM606,
      priorityRequest: getPriorityRequest
    } as CreatePaymentParams, onSuccess)

    // on error, close this modal so error modal is visible
    if (!success) {
      await this.hideModal()
    }
  }

  @Watch('isVisible')
  onVisibleChanged (val: boolean) {
    if (val) {
      this.$nextTick(() => {
        if (this.$el?.querySelector instanceof Function) {
          // add classname to button text (for more detail in Sentry breadcrumbs)
          const resubmitContinueBtn = this.$el.querySelector('#resubmit-continue-btn > span')
          if (resubmitContinueBtn) resubmitContinueBtn.classList.add('resubmit-continue-btn')
          const resubmitNrBtn = this.$el.querySelector('#resubmit-nr-btn > span')
          if (resubmitNrBtn) resubmitNrBtn.classList.add('resubmit-nr-btn')
          const resubmitCloseBtn = this.$el.querySelector('#resubmit-close-btn > span')
          if (resubmitCloseBtn) resubmitCloseBtn.classList.add('resubmit-close-btn')
          const resubmitBackBtn = this.$el.querySelector('#resubmit-back-btn > span')
          if (resubmitBackBtn) resubmitBackBtn.classList.add('resubmit-back-btn')
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
