<template>
  <v-tooltip bottom
             content-class="bottom-tooltip"
             transition="fade-transition"
             :disabled="isContinue || isMobile">
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
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { ConditionalReqI, DraftReqI, IssueI, NameRequestI, ReservedReqI } from '@/interfaces'
import NamexServices from '@/services/namex-services'
import { Location, NrRequestActionCodes, NrType } from '@/enums'

@Component({})
export default class ReserveSubmit extends Vue {
  // Global getters
  @Getter getAssumedName!: string
  @Getter getConditionalNameReservation!: ConditionalReqI
  @Getter getCurrentIssue!: IssueI
  @Getter getDraftNameReservation!: DraftReqI
  @Getter getLocation!: Location
  @Getter getReservedNameReservation!: ReservedReqI
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter getShowActualInput!: boolean
  @Getter isMobile!: boolean

  // Global actions
  @Action cancelAnalyzeName!: ActionBindingIF
  @Action userClickedStopAnalysis!: ActionBindingIF
  @Action setAssumedNameOriginal!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF
  @Action setNrResponse!: ActionBindingIF
  @Action setSubmissionType!: ActionBindingIF
  @Action setSubmissionTabComponent!: ActionBindingIF

  @Prop(String) readonly setup: string

  // Local variable
  isContinue = true

  private mounted () {
    this.$nextTick(() => {
      if (this.$el?.querySelector instanceof Function) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        const reserveSubmitBtn = this.$el.querySelector('#reserve-submit-btn > span')
        if (reserveSubmitBtn) reserveSubmitBtn.classList.add('reserve-submit-btn')
      }
    })
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
    await this.userClickedStopAnalysis(null)
    this.cancelAnalyzeName('NamesCapture')
  }

  getData (type: NrType): DraftReqI | ConditionalReqI | ReservedReqI {
    if (this.getAssumedName) type = NrType.ASSUMED
    switch (type) {
      case NrType.ASSUMED:
      case NrType.DRAFT:
        return this.getDraftNameReservation
      case NrType.CONDITIONAL:
        return this.getConditionalNameReservation
      case NrType.RESERVED:
        return this.getReservedNameReservation
    }
    return undefined // should never happen
  }

  async handleSubmit () {
    let { setup } = this

    if (setup === 'cancel') {
      this.sendToExamination()
      return
    }

    if (this.getCurrentIssue?.issue_type) {
      if (['add_descriptive', 'add_distinctive'].includes(this.getCurrentIssue.issue_type)) {
        if (!this.getShowActualInput) {
          this.$root.$emit('show-original-name')
        }
      }
    }

    let goToNames = () => {
      this.setSubmissionType('examination')
      this.setSubmissionTabComponent('NamesCapture')
    }
    this.setDisplayedComponent('SubmissionTabs')

    if (this.getLocation !== Location.BC && setup !== 'assumed') {
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

    let data: any
    let request: NameRequestI
    switch (setup) {
      case 'assumed':
        this.setAssumedNameOriginal(null)
        goToNames()
        return

      // @ts-ignore - typescript knows setup can only === 'assumed' at this point and gives error
      case 'examine':
        goToNames()
        return

      // @ts-ignore - typescript knows setup can only === 'assumed' at this point and gives error
      case 'consent':
        data = this.getData(NrType.CONDITIONAL)
        request = await NamexServices.postNameRequest(this.getRequestActionCd, data)
        if (request) {
          this.setNrResponse(request)
          this.setSubmissionType('consent')
          this.setSubmissionTabComponent('ApplicantInfo1')
        }
        return

      default:
        this.setSubmissionType('normal')
        data = this.getData(NrType.RESERVED)
        request = await NamexServices.postNameRequest(this.getRequestActionCd, data)
        if (request) {
          this.setNrResponse(request)
          this.setSubmissionTabComponent('ApplicantInfo1')
        }
    }
  }
}
</script>

<style lang="scss" scoped>
#reserve-submit-btn {
  min-width: 140px !important;
}
</style>
