<template>
  <v-app id="app">
    <div id="main-column">
      <SbcAuthenticationOptionsDialog
        attach="#app"
        :inAuth="false"
        :showModal="getIncorporateLoginModalVisible"
        :redirectUrl="nameRequestUrl"
        @close="setIncorporateLoginModalVisible(false)"
      />

      <ChatPopup />

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
    <UpgradeDialog />
  </v-app>
</template>

<script lang="ts">
// libraries, etc
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { getFeatureFlag, getKeycloakRoles } from '@/plugins'
import { DateMixin } from '@/mixins'

// dialogs and other components
import ChatPopup from '@/components/common/chat-popup.vue'
import {
  AffiliationErrorDialog, CancelDialog, ConditionsDialog, ErrorDialog, ExitDialog, HelpMeChooseDialog,
  LocationInfoDialog, MrasSearchInfoDialog, NrNotRequiredDialog, ConfirmNrDialog, PaymentCompleteDialog,
  PickEntityOrConversionDialog, PickRequestTypeDialog, RenewDialog, ReceiptsDialog, RefundDialog, ResubmitDialog,
  RetryDialog, UpgradeDialog
} from '@/components/dialogs'
import SbcAuthenticationOptionsDialog from 'sbc-common-components/src/components/SbcAuthenticationOptionsDialog.vue'
import PaySystemAlert from 'sbc-common-components/src/components/PaySystemAlert.vue'
import SbcHeader from 'sbc-common-components/src/components/SbcHeader.vue'
import SbcFooter from 'sbc-common-components/src/components/SbcFooter.vue'

// Interfaces / Enums
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NamexServices from './services/namex.services'

@Component({
  components: {
    ChatPopup,
    AffiliationErrorDialog,
    CancelDialog,
    ConditionsDialog,
    ConfirmNrDialog,
    ErrorDialog,
    ExitDialog,
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
    UpgradeDialog,
    SbcAuthenticationOptionsDialog,
    PaySystemAlert,
    SbcHeader,
    SbcFooter
  }
})
export default class App extends Mixins(DateMixin) {
  showSpinner = false

  // Global getters
  @Getter getIncorporateLoginModalVisible!: boolean
  @Getter getDisplayedComponent!: string
  @Getter getNrId!: number

  // Global actions
  @Action resetAnalyzeName!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action setIncorporateLoginModalVisible!: ActionBindingIF
  @Action toggleConfirmNrModal!: ActionBindingIF
  @Action setCurrentJsDate!: ActionBindingIF
  @Action setKeycloakRoles!: ActionBindingIF

  /** The Update Current JS Date timer id. */
  private updateCurrentJsDateId = 0

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

  async created (): Promise<void> {
    // start with "page not ready" - show spinner
    // (spinner will be hidden in landing.vue)
    this.showSpinner = true

    // listen for spinner show/hide events
    this.$root.$on('showSpinner', (flag = false) => { this.showSpinner = flag })

    // update Current Js Date now and every 1 minute thereafter
    await this.updateCurrentJsDate()
    this.updateCurrentJsDateId = window.setInterval(this.updateCurrentJsDate, 60000)

    // in case user is already logged in,
    // get and store keycloak roles
    try {
      const keycloakRoles = getKeycloakRoles()
      this.setKeycloakRoles(keycloakRoles)
      console.info('Got roles!') // eslint-disable-line no-console
    } catch (error) {
      // just log the error message
      console.log(`Did not get roles (${error.message})`) // eslint-disable-line no-console
    }
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
}
</script>

<style lang="scss">
@import '@/assets/scss/theme.scss';
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
