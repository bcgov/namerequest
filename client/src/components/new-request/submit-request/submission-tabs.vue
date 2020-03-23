<template>
  <MainContainer>
    <template v-slot:container-header>
      <v-col cols="auto" class="h4" v-if="submissionTabNumber === 0">
        Submit Name Request for Examination
      </v-col>
      <v-col cols="auto" class="h4" v-else>
        Submission Details
      </v-col>
    </template>
    <template v-slot:content>
      <v-tabs v-model="submissionTabNumber" id="applicant-info-slider">
        <v-tabs-items v-model="submissionTabNumber">
          <v-tab-item>
            <SendForExamination />
          </v-tab-item>
          <v-tab-item>
            <ApplicantInfo1 />
          </v-tab-item>
          <v-tab-item>
            <ApplicantInfo2 v-if="actingOnOwnBehalf" />
            <ApplicantInfo3 v-else />
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import MainContainer from '@/components/new-request/main-container.vue'
import ApplicantInfo1 from '@/components/new-request/submit-request/applicant-info-1.vue'
import ApplicantInfo2 from '@/components/new-request/submit-request/applicant-info-2.vue'
import ApplicantInfo3 from '@/components/new-request/submit-request/applicant-info-3.vue'
import SendForExamination from '@/components/new-request/submit-request/send-for-examination.vue'
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { ApplicantInfo3, SendForExamination, ApplicantInfo1, ApplicantInfo2, MainContainer }
})
export default class SubmissionTabs extends Vue {
  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
  }
  get submissionTabNumber () {
    return newReqModule.submissionTabNumber
  }2
  set submissionTabNumber (value) {
    newReqModule.mutateSubmissionTabNumber(value)
  }
}
</script>

<style scoped lang="sass">

</style>
