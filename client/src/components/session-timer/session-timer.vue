<template>
  <div/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import timerModule from '@/modules/vx-timer'
// import * as timerTypes from '@/modules/vx-timer/store/types'

const SESSION_TIMER_NAME = 'userSessionTimer'
const SESSION_TIMEOUT_MODAL_TIMER_NAME = 'timeoutModalTimer'

@Component({})
export default class SessionTimer extends Vue {
  mounted () {
    // eslint-disable-next-line no-debugger
    // debugger
    // Start the user session timer
    timerModule.createAndStartTimer({
      id: SESSION_TIMER_NAME,
      expirationFn: () => { alert('Timer expired') },
      timeoutMs: 7000
    })
    // Start the timeout modal timer
    timerModule.createAndStartTimer({ id: SESSION_TIMEOUT_MODAL_TIMER_NAME })

    // Start a promise timer
    timerModule.createPromiseTimer({
      id: 'promiseTimerOne',
      timeoutMs: 15000
    }).then(() => {
      alert('Promise resolved')
    })
  }
}
</script>
