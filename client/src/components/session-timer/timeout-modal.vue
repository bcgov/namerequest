<template>
  <v-dialog v-model="show" max-width="40%">
    <v-card class="pa-6">
      <v-card-text class="h3">Are You There?</v-card-text>
      <v-card-text class="copy-normal">
        Your session will automatically expire due to inactivity in
        &nbsp;
        <span class="countdown-display">{{ countdownTime }}</span>.
        Please click 'Continue' if you need more time.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="extendSession">Continue</v-btn>
        <v-btn color="grey" @click="hideTimeoutModal">Expire Now</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import store from '@/store'
import * as rootTypes from '@/store/types'
import newRequestModule, { ROLLBACK_ACTIONS as rollbackActions } from '@/store/new-request-module'

@Component({
  data: () => ({
    timerInterval: null,
    countdownTime: 0,
    displayModal: false
  }),
  props: {
    show: {
      type: Boolean,
      default: false
    },
    onTimerExpired: {
      type: Function,
      default: () => {
        // Redirect to the start
        // Catch any errors, so we don't get errors like:
        // Avoided redundant navigation to current location: "/"
        // eslint-disable-next-line no-console
        console.log('Timer expired, redirecting to /')
        // Router.replace('/').catch(() => {})
        // TODO: We could do something a little less forceful here
        // window.location.reload()
      }
    }
  }
})
export default class SessionTimeoutModal extends Vue {
  @Watch('show')
  onDisplayModalChanged (val: boolean, oldVal: boolean) {
    if (val === true) this.startTimer(15)
  }

  async handleTimerExpiry () {
    // eslint-disable-next-line no-console
    console.log('Execute handleTimerExpiry')
    if (typeof this.$props.onTimerExpired === 'function') {
      // eslint-disable-next-line no-console
      console.log('Execute onTimerExpired')
      this.$props.onTimerExpired()
    }

    this.hideTimeoutModal()
  }

  async hideTimeoutModal () {
    const { nrId } = newRequestModule
    this.$set(this, 'countdownTime', 0)
    if (nrId) {
      // Cancel the NR using the rollback endpoint if we were processing a NEW NR
      await newRequestModule.rollbackNameRequest({ nrId, action: rollbackActions.CANCEL })
    }

    await this.$store.dispatch(rootTypes.HIDE_NR_SESSION_EXPIRY_MODAL)
  }

  async extendSession () {
    this.hideTimeoutModal()
  }

  startTimer (duration) {
    let start = Date.now()
    let diff
    let minutes
    let seconds

    const timer = () => {
      // Get the number of seconds that have elapsed since startTimer() was called
      diff = duration - (((Date.now() - start) / 1000) | 0)

      // Does the same job as parseInt truncates the float
      minutes = (diff / 60) | 0
      seconds = (diff % 60) | 0

      minutes = minutes < 10 ? '0' + minutes : minutes
      seconds = seconds < 10 ? '0' + seconds : seconds
      this.$set(this, 'countdownTime', minutes + ':' + seconds)

      if (diff <= 0) {
        clearInterval(this.$data.timerInterval)
        this.handleTimerExpiry()
      }
    }

    timer() // We don't want to wait a full second before the timer starts
    const timerInterval = setInterval(timer, 1000)
    this.$set(this, 'timerInterval', timerInterval)
  }
}
</script>

<style lang="sass" scoped>
</style>
