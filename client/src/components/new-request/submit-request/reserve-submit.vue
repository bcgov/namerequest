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
    if (!this.setup || this.setup === 'consent') {
      newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
      newReqModule.mutateSubmissionType('consent')
    }
    if (this.setup === 'examine') {
      newReqModule.mutateSubmissionTabComponent('SendForExamination')
      newReqModule.mutateSubmissionType('examination')
    }
    newReqModule.mutateSubmissionType('normal')
    newReqModule.mutateDisplayedComponent('SubmissionTabs')
  }
}
</script>

<style scoped lang="sass">
.margin-top-auto
  margin-top: auto !important
</style>
