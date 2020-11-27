<template>
  <v-tooltip bottom
             content-class="bottom-tooltip"
             transition="fade-transition"
              :disabled="isContinue">
    <template v-slot:activator="scope">
      <v-btn @click="handleSubmit"
             outlined
             :class="{ 'reserve-submit-btn': !isContinue }"
             class="mt-auto"
             v-on="scope.on"
             ref="reserve-submit-button">
        {{ text }}
      </v-btn>
    </template>
    <template>
      Stop the analysis of this name and submit it for review. Please check wait times at the top of the screen.
    </template>
  </v-tooltip>
</template>

<script lang="ts">
import { xproMapping } from '@/store/list-data/request-action-mapping'
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class ReserveSubmitButton extends Vue {
  @Prop(String) setup: string
  private isContinue: boolean = true

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
  get showActualInput () {
    return newReqModule.showActualInput
  }
  get text () {
    if (this.setup === 'cancel') {
      this.isContinue = false
      return 'Stop and Send Name for Review'
    }
    this.isContinue = true
    return 'Continue'
  }
  async sendToExamination () {
    await newReqModule.userClickedStopAnalysis()
    newReqModule.cancelAnalyzeName('NamesCapture')
  }

  handleSubmit () {
    let { setup, location, entity_type_cd, request_action_cd } = this

    if (setup === 'cancel') {
      this.sendToExamination()
      return
    }
    if (newReqModule.currentIssue?.issue_type) {
      if (['add_descriptive', 'add_distinctive'].includes(newReqModule.currentIssue.issue_type)) {
        if (!newReqModule.showActualInput) {
          this.$root.$emit('show-original-name')
        }
      }
    }

    let goToNames = () => {
      newReqModule.mutateSubmissionType('examination')
      newReqModule.mutateSubmissionTabComponent('NamesCapture')
    }
    newReqModule.mutateDisplayedComponent('SubmissionTabs')

    if (location !== 'BC' && setup !== 'assumed') {
      goToNames()
      return
    }

    /* the next 4 lines disable auto and condiotional approvals.  all setup types except
    'assumed' are short-circuited to call goToNames.  The assumed logic can remain in effect
    since they already go to examination per the existing logic.  to re-enable approvals
    delete the 4 lines that immediately follow this comment */
    if (setup !== 'assumed') {
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
      // @ts-ignore - typescript knows setup can only === 'assumed' at this point and gives error
      case 'examine':
        goToNames()
        return
      // @ts-ignore - typescript knows setup can only === 'assumed' at this point and gives error
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

<style scoped lang="scss">
@import '@/assets/scss/theme.scss';

.v-btn {
  min-width: 125px !important;
}
.reserve-submit-btn {
  color: $link !important;
  background-color: white !important;
  &:hover {
    background-color: rgba(22, 105, 187, .01) !important;
  }
}
</style>
