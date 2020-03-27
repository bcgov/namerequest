<template>

    <v-container fluid class="pa-0 ma-0">
      <v-row>
        <v-col cols="12 text-center" class="h5">
          Name Requests for a {{ entityText }} cannot be decisioned automatically
        </v-col>
        <v-col cols="12 text-center mt-n4">You must complete and submit a manual name request by clicking the
          <b>Continue</b> button below.</v-col>
        <v-col>
          <v-container class="helpful-hint small-copy">
            <v-row>
              <v-col cols="12">
                Although we can't provide you with an automated decision immediately, we would be pleased to review
                your name request manually.  On the following step you will be given the opportunity to review the
                name you initially entered and select up to two additional names.  Please rank them according to your
                preference; each additional name will be reviewed only if the previous name could not be approved.
              </v-col>
              <v-col cols="12" class="mt-n2">
                The estimated turnaround time is quoted above.  Rush services are available and can be selected with
                this tool on an upcoming step.
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="12" class="text-right">
          <v-btn x-large
                 id="submit-continue-btn"
                 @click="showNextTab()">Continue</v-btn>
        </v-col>
      </v-row>
    </v-container>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import designations from '@/store/list-data/designations'

@Component({})
export default class EntityCannotBeAutoAnalyzed extends Vue {
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  showNextTab () {
    newReqModule.mutateSubmissionTabComponent('SendForExamination')
  }
}
</script>

<style lang="sass">

</style>
