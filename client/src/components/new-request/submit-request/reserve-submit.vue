<template>
  <v-btn :color="setup === 'consent' ? 'red' : ''" class="mt-auto margin-top-auto"
          @click="handleSubmit" ref="reserve-submit-button">
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
  get isAssumedName () {
    return newReqModule.isAssumedName
  }
  get location () {
    return newReqModule.location
  }
  get name () {
    return newReqModule.name
  }
  get request_action_cd () {
    return newReqModule.request_action_cd
  }
  get text () {
    if (this.location !== 'BC' && this.setup !== 'assumed') {
      return 'Send for Examination'
    }
    switch (this.setup) {
      case 'consent':
        return 'Conditionally Reserve'
      case 'examine':
        return 'Send for Examination'
      case 'assumed':
        if (this.$xproMapping['ASSUMED'].includes(this.entity_type_cd)) {
          return 'Assume a name in BC'
        }
        return 'Pick a new Name'
      default:
        return 'Reserve and Continue'
    }
  }

  handleSubmit () {
    let { setup, location, entity_type_cd, request_action_cd } = this
    let goToNames = () => {
      newReqModule.mutateSubmissionType('examination')
      newReqModule.mutateSubmissionTabComponent('NamesCapture')
    }
    newReqModule.mutateDisplayedComponent('SubmissionTabs')

    if (location !== 'BC' && setup !== 'assumed') {
      goToNames()
      return
    }
    switch (setup) {
      case 'assumed':
        if (this.$xproMapping['ASSUMED'].includes(entity_type_cd)) {
          newReqModule.mutateRequestActionOriginal(request_action_cd)
          newReqModule.mutateRequestAction('ASSUMED')
        }
        newReqModule.mutateAssumedNameOriginal()
        goToNames()
        return
      case 'examine':
        goToNames()
        return
      case 'consent':
        newReqModule.postNameRequests('conditional')
        newReqModule.mutateSubmissionType('consent')
        newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
        return
      default:
        newReqModule.mutateSubmissionType('normal')
        newReqModule.postNameRequests('reserved')
        newReqModule.mutateSubmissionTabComponent('ApplicantInfo1')
        return
    }
  }
}
</script>

<style scoped lang="sass">
.margin-top-auto
  margin-top: auto !important
</style>
