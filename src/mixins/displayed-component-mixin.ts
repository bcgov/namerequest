import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import newRequestModule from '@/store/new-request-module'

@Component
export default class extends Vue {
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
    newRequestModule.mutateSubmissionTabNumber(0)
    // Are we cancelling a new NR?
    if (['SubmissionTabs'].indexOf(componentName) > -1) {
      await newRequestModule.cancelAnalyzeName('Tabs')
      this.redirectToStart()
    } else if (['ExistingRequestDisplay'].indexOf(componentName) > -1) {
      await newRequestModule.cancelAnalyzeName('Tabs')
      this.redirectToStart()
    } else if (['ExistingRequestEdit'].indexOf(componentName) > -1) {
      // We're editing
      // Check in the NR to release the INPROGRESS lock on the NR
      await newRequestModule.cancelEditExistingRequest()
      await newRequestModule.checkinNameRequest()
      this.redirectToStart()
    } else {
      await newRequestModule.cancelAnalyzeName('Tabs')
      this.redirectToStart()
    }
  }

  async redirectToStart () {
    console.info('Redirecting to start...') // eslint-disable-line no-console
    // Redirect to the start
    // Catch any errors, so we don't get errors like:
    // Avoided redundant navigation to current location: "/"
    await this.$router.replace('/').catch(() => {})
  }
}
