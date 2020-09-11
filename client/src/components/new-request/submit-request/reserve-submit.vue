<template>
  <v-btn :color="setup === 'consent' ? 'red' : ''" class="mt-auto margin-top-auto"
          @click="showNextStep()">
    {{ text }}
  </v-btn>
</template>

<script lang="ts">
import { xproMapping } from '@/store/list-data/request-action-mapping'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class ReserveSubmitButton extends Vue {
  @Prop(String) setup: string
  get entity_type_cd () {
    return newReqModule.entity_type_cd
  }
  get location () {
    return newReqModule.location
  }
  get text () {
    if (this.location !== 'BC' && this.setup !== 'assumed') {
      return 'Send For Examination'
    }
    switch (this.setup) {
      case 'consent':
        return 'Conditionally Reserve'
      case 'examine':
        return 'Send for Examination'
      case 'assumed':
        return 'Continue'
      default:
        return 'Reserve and Continue'
    }
  }

  showNextStep () {
    newReqModule.mutateDisplayedComponent('SubmissionTabs')
    if ((this.setup === 'examine' || this.location !== 'BC') || this.setup === 'assumed') {
      newReqModule.mutateSubmissionType('examination')
      newReqModule.mutateSubmissionTabComponent('NamesCapture')
      if (this.setup === 'assumed') {
        newReqModule.mutateRequestAction('ASSUMED')
        newReqModule.mutateAssumedNameOriginal()
        return
      }
    }
    newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
    if (this.setup === 'consent') {
      newReqModule.postNameRequests('conditional')
      newReqModule.mutateSubmissionType('consent')
      return
    }
    if (this.setup === 'examine') {
      newReqModule.postNameRequests('draft')
      newReqModule.mutateSubmissionType('examination')
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
