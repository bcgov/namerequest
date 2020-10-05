<template>
  <MainContainer>
    <template v-slot:container-header>
      <v-col cols="auto" class="h4" v-if="submissionTabNumber === 1">
        Submit Name Request for Examination
      </v-col>
      <v-col cols="auto" class="h4" v-else-if="submissionTabNumber > 1">
        Submission Details
      </v-col>
      <v-col cols="auto" v-else />
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
          <v-tab-item>
            <InvalidActionMessage />
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import MainContainer from '../main-container.vue'
import ApplicantInfo1 from '../../common/applicant-info-1.vue'
import ApplicantInfo2 from '../../common/applicant-info-2.vue'
import ApplicantInfo3 from '../../common/applicant-info-3.vue'
import EntityCannotBeAutoAnalyzed from './entity-cannot-be-auto-analyzed.vue'
import NamesCapture from '../../common/names-capture.vue'
import InvalidActionMessage from '../../existing-request/invalid-action-message.vue'
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: {
    EntityCannotBeAutoAnalyzed,
    ApplicantInfo3,
    NamesCapture,
    ApplicantInfo1,
    ApplicantInfo2,
    MainContainer,
    InvalidActionMessage
  }
})
export default class SubmissionTabs extends Vue {
  mounted () {
    let link = document.createElement('link')
    link.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic.min.css')
    link.setAttribute('rel', 'stylesheet')
    document.head.appendChild(link)
  }
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
