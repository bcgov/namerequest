<template>
  <v-container class="main-container-style px-9 copy-normal">
    <v-row justify="space-between" class="submission-tabs-top">
      <slot name="container-header" />
      <v-col cols="auto" v-if="displayedComponent !== 'Success'">
        <button id="back-to-search-btn"
                class="modal-activator pa-0 link-std-sans-ul"
                @click="cancelAnalyzeName">
          <span class="link-std-sans-ul">
            <v-icon class="ma-0 pa-0 mr-n1 mini-back-arrow">arrow_back_ios</v-icon>
            {{ editMode ? 'Return' : 'Start Search Over' }}
          </span>
        </button>
      </v-col>
    </v-row>
    <slot name="content"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import newReqModule from '@/store/new-request-module'
import timerModule from '@/modules/vx-timer'

export const EXISTING_NR_TIMER_NAME = 'existingNrTimer'

@Component({})
export default class MainContainer extends Vue {
  get editMode () {
    return newReqModule.editMode
  }
  async cancelAnalyzeName () {
    if (this.editMode) {
      // Check in the NR to release the INPROGRESS lock on the NR
      await newReqModule.cancelEditExistingRequest()
      await newReqModule.checkinNameRequest()
      timerModule.stopTimer({ id: EXISTING_NR_TIMER_NAME })
      // Redirect to the start
      // Catch any errors, so we don't get errors like:
      // Avoided redundant navigation to current location: "/"
      await this.$router.replace('/').catch(() => {})
    } else {
      await newReqModule.cancelAnalyzeName()
      // Redirect to the start
      // Catch any errors, so we don't get errors like:
      // Avoided redundant navigation to current location: "/"
      await this.$router.replace('/').catch(() => {})
    }
  }
  get displayedComponent () {
    return newReqModule.displayedComponent
  }
}
</script>

<style lang="sass" scoped>
.rounded-corner-6px
  border-radius: 6px !important
</style>
