<template>
  <MainContainer>
    <template v-slot:container-header>
      <v-col cols="auto" class="font-weight-bold h5 py-0">
        {{ submissionModeHeader }}
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
          <v-tab-item>
            <InvalidActionMessage />
          </v-tab-item>
          <v-tab-item>
            <Timeout />
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import NewReqModule from '@/store/new-request-module'
import MainContainer from '../main-container.vue'
import EntityCannotBeAutoAnalyzed from './entity-cannot-be-auto-analyzed.vue'
import NamesCapture from '../../common/names-capture.vue'
import ApplicantInfo1 from '../../common/applicant-info-1.vue'
import ApplicantInfo2 from '../../common/applicant-info-2.vue'
import ApplicantInfo3 from '../../common/applicant-info-3.vue'
import InvalidActionMessage from '../../existing-request/invalid-action-message.vue'
import Timeout from './timeout.vue'

/**
 * This is the component container for a new submission.
 */
@Component({
  components: {
    MainContainer,
    EntityCannotBeAutoAnalyzed,
    NamesCapture,
    ApplicantInfo1,
    ApplicantInfo2,
    ApplicantInfo3,
    InvalidActionMessage,
    Timeout
  }
})
export default class SubmissionTabs extends Vue {
  private mounted (): void {
    let link = document.createElement('link')
    link.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic.min.css')
    link.setAttribute('rel', 'stylesheet')
    document.head.appendChild(link)
  }

  private get actingOnOwnBehalf (): boolean {
    return NewReqModule.actingOnOwnBehalf
  }

  private get submissionModeHeader (): string {
    // safety check
    if (NewReqModule.editMode) return ''

    if (this.submissionTabNumber === 1) {
      return 'Submit a Name Request for Review'
    } else {
      return 'Submission Details'
    }
  }

  private get submissionTabNumber (): number {
    return NewReqModule.submissionTabNumber
  }

  private set submissionTabNumber (value: number) {
    NewReqModule.mutateSubmissionTabNumber(value)
  }
}
</script>
