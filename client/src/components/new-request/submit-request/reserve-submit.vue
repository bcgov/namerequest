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
    if (this.location !== 'BC') {
      return 'Send For Examination'
    }
    switch (this.setup) {
      case 'consent':
        return 'Conditionally Reserve'
      case 'examine':
        return 'Send for Examination'
      default:
        return 'Reserve and Continue'
    }
  }
  get location () {
    return newReqModule.location
  }

  showNextStep () {
    newReqModule.mutateDisplayedComponent('SubmissionTabs')
    if (this.setup === 'examine' || this.location !== 'BC') {
      newReqModule.mutateSubmissionTabComponent('SendForExamination')
      newReqModule.mutateSubmissionType('examination')
      return
    }
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
    if (this.setup === 'consent') {
      newReqModule.postNameRequests('conditional')
      newReqModule.mutateSubmissionType('consent')
      return
    }
    newReqModule.postNameRequests('reserved')
    newReqModule.mutateSubmissionType('normal')
  }
}
</script>

<style scoped lang="sass">
.margin-top-auto
  margin-top: auto !important
</style>
