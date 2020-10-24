<template>
  <countdown-timer-display
    v-if="countdownActivated"
    :bgColorString="bgColorString"
    :colorString="colorString"
    :countdownSeconds="countdownNumber"
    :countdownClass="countdownClass"
    :countdownTextStyle="countdownNumberStyle"
    :countdownCircleStyle="countdownCircleStyle"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Timer } from '@/modules/vx-timer/timer'
import timerModule from '@/modules/vx-timer'

import CountdownTimerDisplay from '@/components/session-timer/countdown-timer-display.vue'

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
  countdownActivated: boolean = true

  mounted () {
    this.tickInterval = this.createCountdownWatcher()
    this.setActiveStyles()
  }

  setExpiredStyles () {
    const countdownClass = `countdown expired`
    this.countdownClass = countdownClass
  }

  setActiveStyles () {
    const { colorString, bgColorString } = this
    const timerInstance = this.getTimerInstance()

    const countdownClass = `countdown`
    this.countdownClass = countdownClass
    this.countdownActivated = false
    this.$nextTick(() => {
      this.countdownActivated = true
      // Set display to none and back to re-flow
      const animation = `countdown ${timerInstance.timeoutMs / 1000}s linear forwards`
      const fill = bgColorString || 'none'
      const stroke = colorString
      const style = `animation: ${animation}; fill: ${fill}; stroke: ${stroke}`
      this.countdownCircleStyle = style
    })
  }

  createCountdownWatcher () {
    let oldExpiredValue = false
    return setInterval(() => {
      const timerInstance = this.getTimerInstance()
      if (timerInstance && timerInstance.isExpired) {
        this.countdownNumber = 0
        if (oldExpiredValue !== true) {
          oldExpiredValue = true
          this.setExpiredStyles()
        }
      } else if (timerInstance && !timerInstance.isExpired) {
        this.countdownNumber = timerInstance.timeRemaining / 1000
        if (oldExpiredValue === true) {
          oldExpiredValue = false
          this.setActiveStyles()
        }
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
