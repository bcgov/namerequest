<template>
  <v-app id="app">
    <div id="main-column">
      <ChatPopup
        v-if="enableOldWebchat"
        :openTooltipMessage="openTooltipMessage"
        :axios="axios"
        :isMobile="isMobile"
        :webChatReason="window['webChatReason']"
        :webChatUrl="window['webChatUrl']"
        :webChatStatusUrl="window['webChatStatusUrl']"
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
        <div
          v-show="showSpinner"
          class="loading-container grayed-out"
        >
          <div class="loading__content">
            <v-progress-circular
              color="primary"
              size="50"
              indeterminate
            />
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

      <!-- Alert banner -->
      <v-alert
        v-if="bannerText"
        tile
        dense
        type="warning"
        class="mb-0 text-center colour-dk-text"
        v-html="bannerText"
      />

      <!-- Breadcrumb -->
      <Breadcrumb
        class="namerequest-sbc-breadcrumb"
        :breadcrumbs="breadcrumbs"
      />

      <!-- Components according to route -->
      <router-view />

      <!-- SBC Common Components footer -->
      <SbcFooter :aboutText="aboutText" />
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
    <IncorporateNowErrorDialog
      attach="#app"
      :dialog="getIncorporateNowErrorStatus"
      @close="closeIncorporateNowErrorDialog()"
    />
    <AmalgamateNowErrorDialog
      attach="#app"
      :dialog="getAmalgamateNowErrorStatus"
      @close="closeAmalgamateNowErrorDialog()"
    />
    <ContinuationInErrorDialog
      attach="#app"
      :dialog="getContinuationInErrorStatus"
      @close="closeContinuationInErrorDialog()"
    />
    <MrasSearchInfoDialog />
    <NrNotRequiredDialog />
    <PaymentCompleteDialog />
    <PickEntityOrConversionDialog />
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
import { GetFeatureFlag } from '@/plugins'
import { DateMixin, LoadKeycloakRolesMixin, NrAffiliationMixin, UpdateUserMixin } from '@/mixins'
import { Routes } from '@/enums'
import { BreadcrumbIF } from '@/interfaces'
import {
  getRegistryDashboardBreadcrumb,
  getStaffDashboardBreadcrumb,
  getRegistryHomeBreadcrumb
} from '@/resources'
import axios from 'axios'

// dialogs and other components
import { Breadcrumb } from '@/components/common'
import GenesysWebMessage from '@bcrs-shared-components/genesys-web-message/GenesysWebMessage.vue'
import { WebChat as ChatPopup } from '@bcrs-shared-components/web-chat'
import {
  AffiliationErrorDialog, AmalgamateNowErrorDialog, CancelDialog, ConditionsDialog, ContinuationInErrorDialog,
  ErrorDialog, ExitDialog, HelpMeChooseDialog, IncorporateNowErrorDialog, MrasSearchInfoDialog, NrNotRequiredDialog,
  ConfirmNrDialog, PaymentCompleteDialog, PickEntityOrConversionDialog, RenewDialog, ReceiptsDialog,
  RefundDialog, ResubmitDialog, RetryDialog, StaffPaymentErrorDialog, UpgradeDialog, ExitIncompletePaymentDialog
} from '@/components/dialogs'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'

// Interfaces / Enums
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NamexServices from './services/namex-services'
import { PAYMENT_REQUIRED } from 'http-status-codes'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

@Component({
  components: {
    AffiliationErrorDialog,
    AmalgamateNowErrorDialog,
    Breadcrumb,
    CancelDialog,
    ChatPopup,
    ConditionsDialog,
    ConfirmNrDialog,
    ContinuationInErrorDialog,
    ErrorDialog,
    ExitDialog,
    ExitIncompletePaymentDialog,
    GenesysWebMessage,
    HelpMeChooseDialog,
    IncorporateNowErrorDialog,
    MrasSearchInfoDialog,
    NrNotRequiredDialog,
    PaymentCompleteDialog,
    PickEntityOrConversionDialog,
    ReceiptsDialog,
    RefundDialog,
    RenewDialog,
    ResubmitDialog,
    RetryDialog,
    StaffPaymentErrorDialog,
    UpgradeDialog,
    SbcHeader,
    SbcFooter
  }
})
export default class App extends Mixins(
  DateMixin, LoadKeycloakRolesMixin, NrAffiliationMixin, UpdateUserMixin
) {
  // Global getters
  @Getter getAmalgamateNowErrorStatus!: boolean
  @Getter getContinuationInErrorStatus!: boolean
  @Getter getDisplayedComponent!: string
  @Getter getIncorporateNowErrorStatus!: boolean
  @Getter getNrId!: number
  @Getter isAuthenticated!: boolean
  @Getter isRoleStaff!: boolean
  @Getter isMobile!: boolean
  @Getter isNewBusiness!: boolean

  // Global actions
  @Action resetAnalyzeName!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action toggleConfirmNrModal!: ActionBindingIF
  @Action setCurrentJsDate!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF
  @Action setWindowWidth!: ActionBindingIF

  readonly axios = axios
  readonly window = window

  /** Whether to show the loading spinner. */
  showSpinner = false

  /** Whether the StaffPaymentErrorDialog should be displayed */
  staffPaymentErrorDialog = false

  /** Errors from the API */
  saveErrors: Array<string> = []

  /** Warnings from the API */
  saveWarnings: Array<string> = []

  /** The Update Current JS Date timer id. */
  private updateCurrentJsDateId = 0

  get openTooltipMessage (): string {
    return 'Click here to chat live with Helpdesk staff about Name Requests.'
  }

  get bannerText (): string | null {
    const bannerText: string = GetFeatureFlag('banner-text')
    // remove spaces so that " " becomes falsy
    return bannerText?.trim()
  }

  /** The About text. */
  get aboutText (): string {
    return process.env.ABOUT_TEXT
  }

  /** The route breadcrumbs list. */
  get breadcrumbs (): Array<BreadcrumbIF> {
    const crumbs: Array<BreadcrumbIF> = [
      {
        text: 'Name Request',
        to: { name: Routes.REQUEST }
      }
    ]

    // Set base crumbs based on user role
    // Staff don't want the home landing page and they can't access the Manage Business Dashboard

    if (this.isRoleStaff) {
      crumbs.unshift(getStaffDashboardBreadcrumb())
    } else if (this.isAuthenticated) {
      crumbs.unshift(getRegistryHomeBreadcrumb())
    } else {
      crumbs.unshift(getRegistryDashboardBreadcrumb())
    }
    return crumbs
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

    // if there is stored legal type and request action cd, try to continue
    const legaltype = sessionStorage.getItem('LEGAL_TYPE')
    const requestActionCd = sessionStorage.getItem('REQUEST_ACTION_CD')
    if (legaltype && requestActionCd && this.isAuthenticated) {
      try {
        this.setRequestAction(requestActionCd)
        if (this.isNewBusiness || this.isAmalgamation || this.isContinuationIn) {
          await this.actionNumberedEntity(legaltype as CorpTypeCd)
        }
        // clear the legal type and request action data
        sessionStorage.removeItem('LEGAL_TYPE')
        sessionStorage.removeItem('REQUEST_ACTION_CD')
      } catch (error) {
        if (this.isNewBusiness) {
          this.setIncorporateNowErrorStatus(true)
        } else if (this.isAmalgamation) {
          this.setAmalgamateNowErrorStatus(true)
        } else if (this.isContinuationIn) {
          this.setContinuationInErrorStatus(true)
        }
        console.error(error)
      }
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
    // don't run in Jest tests
    if (process.env.JEST_WORKER_ID) return

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
    return !!GetFeatureFlag('enable-web-chat')
  }

  /** Whether the Genesys web message should be enabled. */
  get enableGenesysWebMessage (): boolean {
    return !!GetFeatureFlag('enable-genesys-web-message')
  }

  /** Close IncorporateNowErrorDialog and clear session storage. */
  closeIncorporateNowErrorDialog (): void {
    sessionStorage.removeItem('LEGAL_TYPE')
    sessionStorage.removeItem('REQUEST_ACTION_CD')
    this.setIncorporateNowErrorStatus(false)
  }

  /** Close AmalgamateNowErrorDialog and clear session storage. */
  closeAmalgamateNowErrorDialog (): void {
    sessionStorage.removeItem('LEGAL_TYPE')
    sessionStorage.removeItem('REQUEST_ACTION_CD')
    this.setAmalgamateNowErrorStatus(false)
  }

  /** Close ContinuationInErrorDialog and clear session storage. */
  closeContinuationInErrorDialog (): void {
    sessionStorage.removeItem('LEGAL_TYPE')
    sessionStorage.removeItem('REQUEST_ACTION_CD')
    this.setContinuationInErrorStatus(false)
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
    font-size: $px-14 !important;
  }
}

.namerequest-sbc-breadcrumb {
  .v-btn {
    width: 28px;
    height: 28px !important;
    background-color: white !important;
  }

  .container {
    max-width: 1360px; // should match auth-web, etc
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
