<template>
  <v-col cols="5"
         class="text-right">
    <v-btn x-large
           id="submit-back-btn"
           class="mr-3"
           v-if="showBack"
           @click="back">
      {{ backText }}
    </v-btn>
    <v-btn x-large
           @click="next"
           :disabled="!isValid || clicked"
           id="submit-continue-btn">
      {{ nextText }}
    </v-btn>
  </v-col>
</template>

<script lang="ts">
import paymentModule from '@/modules/payment'
import newReqModule from '@/store/new-request-module'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfoNav extends Vue {
  clicked: boolean = false

  @Prop(Boolean) isValid: boolean

  get backText () {
    if (this.editMode) {
      return 'Previous'
    }
    return 'Back'
  }
  get editMode () {
    return newReqModule.editMode
  }
  get nextText () {
    if (this.tab === 3) {
      if (this.editMode) {
        return 'Submit Changes'
      }
      return 'Continue To Payment'
    }
    if (this.editMode) {
      return 'Next'
    }
    return 'Continue'
  }
  get nrId () {
    return newReqModule.nrId
  }
  get nrState () {
    return newReqModule.nrState
  }
  get showBack () {
    if (this.tab < 2) {
      return false
    }
    if (this.tab === 2) {
      return (this.type === 'examination' || this.nrState === 'DRAFT')
    }
    if (this.tab === 3) {
      return true
    }
    return false
  }
  get tab () {
    return newReqModule.submissionTabNumber
  }
  get type () {
    return newReqModule.submissionType
  }
  back () {
    newReqModule.mutateSubmissionTabNumber(this.tab - 1)
  }
  next () {
    if (this.tab === 3 && !this.clicked) {
      this.clicked = true
      this.submit()
      return
    }
    newReqModule.mutateSubmissionTabNumber(this.tab + 1)
  }
  async submit () {
    if (this.editMode) {
      await newReqModule.patchNameRequests()
    } else {
      const { nrId } = this
      if (!nrId) {
        await newReqModule.postNameRequests('draft')
      } else {
        if (!this.editMode && ['COND-RESERVE', 'RESERVED'].includes(this.nrState)) {
          let request = await newReqModule.getNameRequest(nrId)
          if (request.stateCd === 'CANCELLED') {
            newReqModule.setActiveComponent('Timeout')
            return
          }
        }
        await newReqModule.putNameReservation(nrId)
      }
      await paymentModule.togglePaymentModal(true)
    }
  }
}

</script>
