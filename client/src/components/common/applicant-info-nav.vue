<template>
  <v-col cols="5" class="text-right py-0">
    <v-btn x-large
           id="submit-back-btn"
           class="mr-3"
           v-if="showBack"
           @click="back()">
      {{ backText }}
    </v-btn>
    <v-btn x-large
           @click="nextAction()"
           :loading="loading"
           id="submit-continue-btn">
      {{ nextText }}
    </v-btn>
  </v-col>
</template>

<script lang="ts">
import { Component, Emit } from 'vue-property-decorator'
import newRequestModule from '@/store/new-request-module'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

@Component({})
export default class ApplicantInfoNav extends NameRequestMixin {
  @Emit('nextAction')
  private nextAction () : void {}

  get loading (): boolean {
    return newRequestModule.isLoadingSubmission
  }

  get backText () {
    if (this.editMode) {
      return 'Previous'
    }
    return 'Back'
  }

  get nextText () {
    if (this.submissionTabNumber === 3) {
      if (this.editMode) {
        return 'Submit Changes'
      }
      return 'Review and Confirm'
    }
    if (this.editMode) {
      return 'Next'
    }
    return 'Continue'
  }

  get showBack () {
    if (this.submissionTabNumber < 2) {
      return false
    }
    if (this.submissionTabNumber === 2) {
      return (this.type === 'examination' || this.nrState === 'DRAFT')
    }
    if (this.submissionTabNumber === 3) {
      return true
    }
    return false
  }
}
</script>
