<template>
  <v-btn :color="setup === 'consent' ? 'red' : ''" class="mt-auto margin-top-auto"
          @click="showNextStep()">
    {{ text }}
  </v-btn>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class ReserveSubmitButton extends Vue {
  @Prop(String) setup: string
  get text () {
    switch (this.setup) {
      case 'consent':
        return 'Conditionally Reserve'
      case 'examine':
        return 'Send for Examination'
      default:
        return 'Reserve and Continue'
    }
  }

  showNextStep () {
    newReqModule.mutateDisplayedComponent('SubmissionTabs')
    if (this.setup === 'examine') {
      // eslint-disable-next-line
      console.log('it was examine')
      newReqModule.mutateSubmissionTabComponent('SendForExamination')
      newReqModule.mutateSubmissionType('examination')
      return
    }
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
    if (this.setup === 'consent') {
      // eslint-disable-next-line
      console.log('it was consent')
      newReqModule.postNameReservation('conditional')
      newReqModule.mutateSubmissionType('consent')
      return
    }
    // eslint-disable-next-line
    console.log('it was reserved')
    newReqModule.postNameReservation('reserved')
    newReqModule.mutateSubmissionType('normal')
  }
}
</script>

<style scoped lang="sass">
.margin-top-auto
  margin-top: auto !important
</style>
