<template>
  <MainContainer>
    <template v-slot:container-header>
      <v-col cols="auto" class="h4 py-0">
       {{ editModeHeader }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-tabs v-model="submissionTabNumber" id="applicant-info-slider">
        <v-tabs-items v-model="submissionTabNumber">
          <v-tab-item>
            <keep-alive>
              <EntityCannotBeAutoAnalyzed />
            </keep-alive>
          </v-tab-item>
          <v-tab-item>
            <NamesCapture />
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
import ApplicantInfo1 from '@/components/common/applicant-info-1.vue'
import ApplicantInfo2 from '@/components/common/applicant-info-2.vue'
import ApplicantInfo3 from '@/components/common/applicant-info-3.vue'
import MainContainer from '@/components/new-request/main-container.vue'
import NamesCapture from '@/components/common/names-capture.vue'
import newReqModule from '@/store/new-request-module'
import Success from '@/components/common/success.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {
    ApplicantInfo1,
    ApplicantInfo2,
    ApplicantInfo3,
    MainContainer,
    NamesCapture,
    Success
  }
})
export default class ExistingRequestEdit extends Vue {
  get actingOnOwnBehalf () {
    return newReqModule.actingOnOwnBehalf
  }
  get editMode () {
    return newReqModule.editMode
  }
  get editModeHeader () {
    if (this.editMode) {
      if (this.submissionTabNumber === 1) {
        return 'Request Type'
      } else {
        return 'Application Details'
      }
    }
    return ''
  }
  get submissionTabNumber () {
    return newReqModule.submissionTabNumber
  }
  set submissionTabNumber (value) {
    newReqModule.mutateSubmissionTabNumber(value)
  }
}
</script>

<style scoped lang="sass">

</style>
