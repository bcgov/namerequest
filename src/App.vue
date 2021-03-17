<template>
  <v-app id="app">
    <div id="main-column">
      <SbcAuthenticationOptionsDialog
        attach="#app"
        :showModal="getIncorporateLoginModalVisible"
        :redirectUrl="nameRequestUrl"
        @close="setIncorporateLoginModalVisible(false)"
      />

      <ChatPopup v-if="getFeatureFlag('chat-popup-enabled')" />

      <!-- Loading spinner -->
      <v-fade-transition>
        <div class="loading-container grayed-out" v-show="showSpinner">
          <div class="loading__content">
            <v-progress-circular color="primary" size="50" indeterminate />
          </div>
        </div>
      </v-fade-transition>

      <!-- SBC Common Components header -->
      <sbc-header
        class="sbc-header"
        :in-auth="false"
        :redirectOnLoginSuccess="nameRequestUrl"
        :redirect-on-login-fail="nameRequestUrl"
        :redirect-on-logout="nameRequestUrl"
        :show-actions="true"
      />

      <!-- Alert banner -->
      <v-alert
        tile dense
        type="warning"
        class="mb-0 text-center colour-dk-text"
        v-if="bannerText"
        v-html="bannerText"
      />

      <!-- Components according to route -->
      <router-view />

      <!-- SBC Common Components header -->
      <sbc-footer :aboutText=aboutText />
    </div>

    <!-- All dialogs app-wide -->
    <!-- *** TODO: should these be in "main-column" div? -->
    <AffiliationErrorDialog />
    <CancelDialog />
    <ConditionsDialog />
    <ErrorDialog />
    <ExitDialog />
    <HelpMeChooseDialog />
    <LocationInfoDialog />
    <MrasSearchInfoDialog />
    <NrNotRequiredDialog />
    <PaymentDialog :onCancel="onPaymentCancelled" />
    <PaymentCompleteDialog />
    <PickEntityOrConversionDialog />
    <PickRequestTypeDialog />
    <ReapplyDialog />
    <ReceiptsDialog />
    <RefundDialog />
    <UpgradeDialog />
  </v-app>
</template>

<script lang="ts">
// libraries, etc
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { getFeatureFlag } from '@/plugins'
import paymentModule from '@/modules/payment'

// dialogs and other components
import ChatPopup from '@/components/common/chat-popup.vue'
import {
  AffiliationErrorDialog, CancelDialog, ConditionsDialog, ErrorDialog, ExitDialog, HelpMeChooseDialog,
  LocationInfoDialog, MrasSearchInfoDialog, NrNotRequiredDialog, PaymentDialog, PaymentCompleteDialog,
  PickEntityOrConversionDialog, PickRequestTypeDialog, ReapplyDialog, ReceiptsDialog, RefundDialog, UpgradeDialog
} from '@/components/dialogs'
import SbcAuthenticationOptionsDialog from 'sbc-common-components/src/components/SbcAuthenticationOptionsDialog.vue'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'

// Interfaces / Enums
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { RollbackActions } from '@/enums'

@Component({
  components: {
    ChatPopup,
    AffiliationErrorDialog,
    CancelDialog,
    ConditionsDialog,
    ErrorDialog,
    ExitDialog,
    HelpMeChooseDialog,
    LocationInfoDialog,
    MrasSearchInfoDialog,
    NrNotRequiredDialog,
    PaymentDialog,
    PaymentCompleteDialog,
    PickEntityOrConversionDialog,
    PickRequestTypeDialog,
    ReapplyDialog,
    ReceiptsDialog,
    RefundDialog,
    UpgradeDialog,
    SbcAuthenticationOptionsDialog,
    SbcHeader,
    SbcFooter
  }
})
export default class App extends Vue {
  // attach method to 'this'
  readonly getFeatureFlag = getFeatureFlag

  showSpinner = false

  // Global getters
  @Getter getIncorporateLoginModalVisible!: boolean
  @Getter getDisplayedComponent!: string
  @Getter getNrId!: number

  // Global actions
  @Action resetAnalyzeName!: ActionBindingIF
  @Action rollbackNameRequest!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action setIncorporateLoginModalVisible!: ActionBindingIF
  @Action togglePaymentModal!: ActionBindingIF

  get nameRequestUrl (): string {
    return `${window.location.origin}${process.env.VUE_APP_PATH}`
  }

  get bannerText (): string | null {
    const bannerText: string = getFeatureFlag('banner-text')
    // remove spaces so that " " becomes falsy
    return bannerText?.trim()
  }

  /** The About text. */
  private get aboutText (): string {
    return process.env.ABOUT_TEXT
  }

  created (): void {
    // listen for spinner show/hide events
    this.$root.$on('showSpinner', (flag = false) => { this.showSpinner = flag })
  }

  destroyed (): void {
    // stop listening for spinner show/hide events
    this.$root.$off('showSpinner')
  }

  async resetAppState () {
    console.info('Resetting app state...') // eslint-disable-line no-console
    // Redirect to the start
    // Catch any errors, so we don't get errors like:
    // Avoided redundant navigation to current location: "/"
    this.$router.replace('/').catch(() => {})

    // Clear data and display the Tabs page
    await this.resetAnalyzeName(null)
    await this.setName('')
    await this.setDisplayedComponent('Tabs')
  }

  async onPaymentCancelled () {
    const componentName = this.getDisplayedComponent
    // Only do this for New NRs!!!
    if (this.getNrId && ['SubmissionTabs'].indexOf(componentName) > -1) {
      // Cancel the NR using the rollback endpoint if we were processing a NEW NR
      await this.rollbackNameRequest({ nrId: this.getNrId, action: RollbackActions.CANCEL })
      // Direct the user back to the start
      await this.resetAppState()
    }
    await this.togglePaymentModal(false)
  }
}
</script>

<style lang="sass">
#main-column
  display: flex
  flex-flow: column nowrap
  min-height: 100vh

  .sbc-header
    .v-btn
      box-shadow: none !important

.loading-container.grayed-out
  opacity: 0.46
  background-color: rgb(33, 33, 33) // grey darken-4
  border-color: rgb(33, 33, 33) // grey darken-4

.app-header
  .v-btn
    box-shadow: unset !important

.app-footer
  .container
    max-width: 1300px
    padding-right: 1rem
    padding-left: 1rem
</style>
