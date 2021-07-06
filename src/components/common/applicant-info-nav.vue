<template>
  <v-col cols="5" class="text-right py-0">
    <v-btn x-large
           class="submit-back-btn mr-3"
           v-if="showBack"
           @click="back()">
      {{ backText }}
    </v-btn>
    <v-btn x-large
           @click="nextAction()"
           :loading="getIsLoadingSubmission"
           class="submit-continue-btn">
      {{ nextText }}
    </v-btn>
  </v-col>
</template>

<script lang="ts">
import { Component, Emit, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { SubmissionTypeT } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { NrState } from '@/enums'

@Component({})
export default class ApplicantInfoNav extends Vue {
  // Global getters
  @Getter getEditMode!: boolean
  @Getter getIsLoadingSubmission!: boolean
  @Getter getNrState!: string
  @Getter getSubmissionTabNumber!: number
  @Getter getSubmissionType!: SubmissionTypeT

  // Global actions
  @Action setSubmissionTabNumber!: ActionBindingIF

  get backText () {
    if (this.getEditMode) {
      return 'Previous'
    }
    return 'Back'
  }

  get nextText () {
    if (this.getSubmissionTabNumber === 3) {
      if (this.getEditMode) {
        return 'Submit Changes'
      }
      return 'Review and Confirm'
    }
    if (this.getEditMode) {
      return 'Next'
    }
    return 'Continue'
  }

  get showBack (): boolean {
    if (this.getSubmissionTabNumber < 2) {
      return false
    }
    if (this.getSubmissionTabNumber === 2) {
      return (this.getSubmissionType === 'examination' || this.getNrState === NrState.DRAFT)
    }
    if (this.getSubmissionTabNumber === 3) {
      return true
    }
    return false
  }

  back () {
    this.setSubmissionTabNumber(this.getSubmissionTabNumber - 1)
  }

  @Emit('nextAction')
  private nextAction () : void {}
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";

.submit-back-btn {
  background-color: white !important;
  color: $app-blue !important;
  border: 1px solid $app-blue !important;
  box-shadow: none !important;
  text-transform: none !important;
}
</style>
