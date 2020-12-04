import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import newRequestModule from '@/store/new-request-module'
import timerModule from '@/modules/vx-timer'

@Component
export default class DisplayedComponentMixin extends Vue {
  componentName: string = ''
  get displayedComponent () {
    // We can't watch a computed property directly, and we don't want to inject displayedComponent as a prop
    // so we're using an intermediate data property, which we CAN watch - set its value here
    const componentName = newRequestModule.displayedComponent
    if (this.componentName !== componentName) {
      // Update the active component name
      this.componentName = componentName
    }

    return componentName
  }

  async cancelAndResetState () {
    const componentName = newRequestModule.displayedComponent
    // Are we cancelling a new NR?
    if (['SubmissionTabs'].indexOf(componentName) > -1) {
      await newRequestModule.cancelAnalyzeName('Tabs')
      timerModule.stopTimer({ id: this.$NR_COMPLETION_TIMER_NAME })
      this.redirectToStart()
    } else if (['ExistingRequestDisplay'].indexOf(componentName) > -1) {
      await newRequestModule.cancelAnalyzeName('Tabs')
      this.redirectToStart()
    } else if (['ExistingRequestEdit'].indexOf(componentName) > -1) {
      // We're editing
      // Check in the NR to release the INPROGRESS lock on the NR
      await newRequestModule.cancelEditExistingRequest()
      await newRequestModule.checkinNameRequest()
      timerModule.stopTimer({ id: this.$EXISTING_NR_TIMER_NAME })
      this.redirectToStart()
    } else {
      await newRequestModule.cancelAnalyzeName('Tabs')
      this.redirectToStart()
    }
  }

  async redirectToStart () {
    // Redirect to the start
    // Catch any errors, so we don't get errors like:
    // Avoided redundant navigation to current location: "/"
    await this.$router.replace('/').catch(() => {})
  }
}
