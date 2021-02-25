<template>
  <v-tooltip bottom
             content-class="bottom-tooltip"
             transition="fade-transition"
             :disabled="isContinue">
    <template v-slot:activator="scope">
      <v-btn @click="handleSubmit()"
             :class="isContinue ? 'button-normal' : 'button-blue'"
             class="mt-auto"
             v-on="scope.on"
             id="reserve-submit-btn">{{ text }}</v-btn>
    </template>
    Stop the analysis of this name and submit it for review. Please check wait times at the top of the screen.
  </v-tooltip>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class ReserveSubmitButton extends Vue {
  @Prop(String) setup: string
  private isContinue: boolean = true

  private mounted () {
    this.$nextTick(() => {
      // add classname to button text (for more detail in Sentry breadcrumbs)
      const reserveSubmitBtn = this.$el.querySelector("#reserve-submit-btn > span")
      if (reserveSubmitBtn) reserveSubmitBtn.classList.add("reserve-submit-btn")
    })
  }

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
<style lang="scss" scoped>
#reserve-submit-btn {
  min-width: 140px !important;
}
</style>
