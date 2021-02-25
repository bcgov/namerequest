<template>
  <countdown-timer-display
    v-if="displayCountdown"
    :bgColorString="bgColorString"
    :colorString="colorString"
    :countdownSeconds="countdownNumber"
    :countdownClass="countdownClass"
    :countdownTextStyle="countdownNumberStyle"
    :countdownCircleStyle="countdownCircleStyle"
  />
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import { Timer } from '@/modules/vx-timer/timer'
import timerModule from '@/modules/vx-timer'

import CountdownTimerDisplay from '@/components/session-timer/countdown-timer-display.vue'

const COUNTDOWN_STATE_ACTIVE = 'active'
const COUNTDOWN_STATE_EXPIRED = 'expired'
const COUNTDOWN_STATE_NONE = 'none'

@Component({
  components: {
    CountdownTimerDisplay
  }
})
export default class CountdownTimer extends Vue {
  @Prop(String) bgColorString: string
  @Prop(String) colorString: string
  @Prop(String) timerName: string | undefined

  countdownNumber: number = 0
  countdownClass: string = ''
  countdownNumberStyle: string = ''
  countdownCircleStyle: string = ''
  tickInterval: any = undefined
  countdownState: string = COUNTDOWN_STATE_NONE
  displayCountdown: boolean = false

  mounted () {
    this.tickInterval = this.createCountdownWatcher()
  }

  @Watch('countdownState')
  onCountdownStateChanged (newVal, oldVal) {
    const timerInstance = this.getTimerInstance()
    if (!timerInstance) return
    if (newVal === COUNTDOWN_STATE_ACTIVE && oldVal !== COUNTDOWN_STATE_ACTIVE) {
      // The CSS animation won't 'restart' unless the DOM element is re-inserted,
      // replace the timer display with a new instance
      this.setActiveStyles()
      this.displayCountdown = false
      this.$nextTick(() => {
        this.setActiveStyles()
        this.displayCountdown = true
      })
    } else if (newVal === COUNTDOWN_STATE_EXPIRED && oldVal !== COUNTDOWN_STATE_EXPIRED) {
      this.displayCountdown = true
      this.setExpiredStyles()
    } else {
      this.displayCountdown = false
    }
  }

  setActiveStyles () {
    const timerInstance = this.getTimerInstance()
    if (timerInstance) {
      const { colorString, bgColorString } = this
      this.countdownClass = 'countdown'
      this.$nextTick(() => {
        // Set display to none and back to re-flow
        const animation = `countdown ${timerInstance.timeoutMs / 1000}s linear forwards`
        const fill = bgColorString || 'none'
        const stroke = colorString
        const style = `animation: ${animation}; fill: ${fill}; stroke: ${stroke}`
        this.countdownCircleStyle = style
      })
    }
  }

  setExpiredStyles () {
    this.countdownClass = 'countdown expired'
  }

  createCountdownWatcher () {
    return setInterval(() => {
      const timerInstance = this.getTimerInstance()
      if (timerInstance && !timerInstance.isExpired) {
        this.countdownNumber = timerInstance.timeRemaining / 1000
        this.countdownState = COUNTDOWN_STATE_ACTIVE
      } if (timerInstance && timerInstance.isExpired) {
        this.countdownNumber = 0
        this.countdownState = COUNTDOWN_STATE_EXPIRED
      } else if (!timerInstance) {
        this.countdownState = COUNTDOWN_STATE_NONE
      }
    }, 1000)
  }

  /**
   * This is important it cleans up the intervals!
   */
  beforeDestroy () {
    if (this.tickInterval) clearInterval(this.tickInterval)
  }

  getTimerInstance (): Timer | undefined {
    const { timerName } = this
    if (timerName) return timerModule.getTimer(timerName)
  }
}
</script>
