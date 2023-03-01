<template>
  <v-app id="app">
    <div id="main-column">
      <ChatPopup v-if="enableOldWebchat"
                 :openTooltipMessage = "openTooltipMessage"
                 :axios = "axios"
                 :isMobile = "isMobile"
                 :webChatReason = "window['webChatReason']"
                 :webChatUrl = "window['webChatUrl']"
                 :webChatStatusUrl = "window['webChatStatusUrl']"
      />

      <!-- Display the Genesys WebMessage -->
      <GenesysWebMessage
        v-if="enableGenesysWebMessage"
        :genesysURL="window['genesysUrl']"
        :environmentKey="window['genesysEnv']"
        :deploymentKey="window['genesysId']"
      />

      <!-- Loading spinner -->
      <v-fade-transition>
        <div class="loading-container grayed-out" v-show="showSpinner">
          <div class="loading__content">
            <v-progress-circular color="primary" size="50" indeterminate />
          </div>
        </div>
      </v-fade-transition>

      <!-- SBC Common Components header -->
      <SbcHeader
        id="namerequest-sbc-header"
        class="flex-column"
        :inAuth="false"
        :showActions="true"
      />

      <!-- SBC Common Components pay system alert -->
      <PaySystemAlert />

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

      <!-- SBC Common Components footer -->
      <SbcFooter :aboutText=aboutText />
    </div>

    <!-- All dialogs app-wide -->
    <!-- FUTURE: should these be in "main-column" div? -->
    <AffiliationErrorDialog />
    <CancelDialog />
    <ConditionsDialog />
    <ConfirmNrDialog :onCancel="onPaymentCancelled" />
    <ErrorDialog />
    <ExitDialog />
    <ExitIncompletePaymentDialog />
    <HelpMeChooseDialog />
    <LocationInfoDialog />
    <MrasSearchInfoDialog />
    <NrNotRequiredDialog />
    <PaymentCompleteDialog />
    <PickEntityOrConversionDialog />
    <PickRequestTypeDialog />
    <RenewDialog />
    <ReceiptsDialog />
    <RefundDialog />
    <ResubmitDialog />
    <RetryDialog />
    <StaffPaymentErrorDialog
      attach="#app"
      :dialog="staffPaymentErrorDialog"
      :errors="saveErrors"
      :warnings="saveWarnings"
      @close="staffPaymentErrorDialog = false"
    />
    <UpgradeDialog />
  </v-app>
</template>

<script lang="ts">
// libraries, etc
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { getFeatureFlag } from '@/plugins'
import { DateMixin, LoadKeycloakRolesMixin, NrAffiliationMixin, UpdateUserMixin } from '@/mixins'
import axios from 'axios'

// dialogs and other components
import { GenesysWebMessage } from '@bcrs-shared-components/genesys-web-message'
import { WebChat as ChatPopup } from '@bcrs-shared-components/web-chat'
import {
  AffiliationErrorDialog, CancelDialog, ConditionsDialog, ErrorDialog, ExitDialog, HelpMeChooseDialog,
  LocationInfoDialog, MrasSearchInfoDialog, NrNotRequiredDialog, ConfirmNrDialog, PaymentCompleteDialog,
  PickEntityOrConversionDialog, PickRequestTypeDialog, RenewDialog, ReceiptsDialog, RefundDialog,
  ResubmitDialog, RetryDialog, StaffPaymentErrorDialog, UpgradeDialog, ExitIncompletePaymentDialog
} from '@/components/dialogs'
import PaySystemAlert from 'sbc-common-components/src/components/PaySystemAlert.vue'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'

// Interfaces / Enums
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NamexServices from './services/namex.services'
import { PAYMENT_REQUIRED } from 'http-status-codes'

@Component({
  components: {
    ChatPopup,
    AffiliationErrorDialog,
    CancelDialog,
    ConditionsDialog,
    ConfirmNrDialog,
    ErrorDialog,
    ExitDialog,
    ExitIncompletePaymentDialog,
    GenesysWebMessage,
    HelpMeChooseDialog,
    LocationInfoDialog,
    MrasSearchInfoDialog,
    NrNotRequiredDialog,
    PaymentCompleteDialog,
    PickEntityOrConversionDialog,
    PickRequestTypeDialog,
    ReceiptsDialog,
    RefundDialog,
    RenewDialog,
    ResubmitDialog,
    RetryDialog,
    StaffPaymentErrorDialog,
    UpgradeDialog,
    PaySystemAlert,
    SbcHeader,
    SbcFooter
  }
})
export default class App extends Mixins(
  DateMixin, LoadKeycloakRolesMixin, NrAffiliationMixin, UpdateUserMixin
) {
  // Global getters
  @Getter getDisplayedComponent!: string
  @Getter getNrId!: number
  @Getter isRoleStaff: boolean
  @Getter isMobile!: boolean

  // Global actions
  @Action resetAnalyzeName!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action toggleConfirmNrModal!: ActionBindingIF
  @Action setCurrentJsDate!: ActionBindingIF
  @Action setWindowWidth!: ActionBindingIF

  readonly axios = axios
  readonly window = window

  /** Whether to show the loading spinner. */
  protected showSpinner = false

  /** Whether the StaffPaymentErrorDialog should be displayed */
  protected staffPaymentErrorDialog = false

  /** Errors from the API */
  protected saveErrors: Array<string> = []

  /** Warnings from the API */
  protected saveWarnings: Array<string> = []

  /** The Update Current JS Date timer id. */
  private updateCurrentJsDateId = 0

  get openTooltipMessage (): String {
    return 'Click here to chat live with Helpdesk staff about Name Requests.'
  }

  get bannerText (): string | null {
    const bannerText: string = getFeatureFlag('banner-text')
    // remove spaces so that " " becomes falsy
    return bannerText?.trim()
  }

  /** The About text. */
  get aboutText (): string {
    return process.env.ABOUT_TEXT
  }

  async created (): Promise<void> {
    // Listen for changes to the window size to create responsive reactivity
    window.addEventListener('resize', () => this.setWindowWidth(window.innerWidth))

    // start with "page not ready" - show spinner
    // (spinner will be hidden in landing.vue)
    this.showSpinner = true

    // listen for spinner show/hide events
    this.$root.$on('showSpinner', (flag = false) => { this.showSpinner = flag })

    // update Current Js Date now and every 1 minute thereafter
    await this.updateCurrentJsDate()
    this.updateCurrentJsDateId = window.setInterval(this.updateCurrentJsDate, 60000)

    // in case user is already logged in, load Keycloak roles and update LaunchDarkly
    this.loadKeycloakRoles()
    await this.updateUser()

    // if there is stored NR data to process then affiliate it now
    const nr = JSON.parse(sessionStorage.getItem('NR_DATA'))
    if (nr) {
      await this.createAffiliation(nr)
      // clear NR data for next time
      sessionStorage.removeItem('NR_DATA')
    }

    // listen for save error events
    this.$root.$on('save-error-event', (error: any) => {
      // save errors/warnings
      this.saveErrors = error?.response?.data?.errors || []
      this.saveWarnings = error?.response?.data?.warnings || []

      if (error?.response?.status === PAYMENT_REQUIRED && this.isRoleStaff) {
        this.staffPaymentErrorDialog = true
      }
    })
  }

  /** Fetches and stores the current JS date. */
  private async updateCurrentJsDate (): Promise<void> {
    const jsDate = await this.getServerDate()
    this.setCurrentJsDate(jsDate)
  }

  destroyed (): void {
    // stop Update Current Js Date timer
    window.clearInterval(this.updateCurrentJsDateId)

    // stop listening for spinner show/hide events
    this.$root.$off('showSpinner')
    this.$root.$off('save-error-event')
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
      await NamexServices.rollbackNameRequest(this.getNrId)
      // Direct the user back to the start
      await this.resetAppState()
    }
    await this.toggleConfirmNrModal(false)
  }

  /** Whether the old webchat should be enabled. */
  get enableOldWebchat (): boolean {
    return getFeatureFlag('enable-web-chat')
  }

  /** Whether the Genesys web message should be enabled. */
  get enableGenesysWebMessage (): boolean {
    return getFeatureFlag('enable-genesys-web-message')
  }
}
</script>

<style lang="scss">
@import '@/assets/styles/theme.scss';
#main-column {
  display: flex;
  flex-flow: column nowrap;
  min-height: 100vh;
}

#namerequest-sbc-header {
  .v-btn {
    box-shadow: none !important;
    background-color: rgba(0, 0, 0, 0) !important;
    text-transform: none !important;
    font-weight: normal !important;
    letter-spacing: normal !important;
    font-size: .875rem !important;
  }
}

.loading-container.grayed-out {
  opacity: 0.46;
  background-color: rgb(33, 33, 33);
  border-color: rgb(33, 33, 33);
}

.app-header {
  .v-btn {
    box-shadow: unset !important;
  }
}

.app-footer {
  .container {
    max-width: 1300px;
    padding-right: 1rem;
    padding-left: 1rem;
  }
}

#main-column .v-alert__wrapper {
  color: $dk-text;
  i {
    color: $dk-text;
  }
}

</style>
