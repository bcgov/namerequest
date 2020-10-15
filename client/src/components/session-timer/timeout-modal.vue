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
        <v-btn color="primary" @click="handleExtendSession">Continue</v-btn>
        <v-btn color="grey" @click="hideTimeoutModal">Expire Now</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import * as rootTypes from '@/store/types'

export const TIMER_MODAL_TIMEOUT_MS = 45 * 1000 // Set to 45s

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
      default: async () => {}
    },
    onExtendSession: {
      type: Function,
      default: async () => {}
    }
  }
})
export default class SessionTimeoutModal extends Vue {
  @Watch('show')
  onDisplayModalChanged (val: boolean, oldVal: boolean) {
    // Values are in ms convert to seconds
    if (val === true) this.startTimer(TIMER_MODAL_TIMEOUT_MS / 1000)
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
    this.$set(this, 'countdownTime', 0)
    await this.$store.dispatch(rootTypes.HIDE_NR_SESSION_EXPIRY_MODAL)
  }

  async handleExtendSession () {
    // eslint-disable-next-line no-console
    console.log('Execute handleExtendSession')
    if (typeof this.$props.onExtendSession === 'function') {
      // eslint-disable-next-line no-console
      console.log('Execute onExtendSession')
      this.$props.onExtendSession()
    }

    // Clear the interval so our onTimerExpired event handler isn't fired off
    clearInterval(this.$data.timerInterval)
    // Hide the timeout modal
    this.hideTimeoutModal()
  }

  startTimer (duration) {
    let start = Date.now()
    let diff
    let minutes
    let seconds

    // eslint-disable-next-line no-console
    console.log('Starting the timeout modal timer')

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
