<template>
  <MainContainer>
    <template v-slot:container-header>
      <v-col cols="auto" class="font-weight-bold h5 py-0">
        {{ submissionModeHeader }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-tabs v-model="submissionTabNumber" id="applicant-info-slider" class="mt-2">
        <v-tabs-items v-model="submissionTabNumber" touchless>
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
            <ApplicantInfo2 v-if="getActingOnOwnBehalf" />
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
import { Action, Getter } from 'vuex-class'

import MainContainer from '../main-container.vue'
import EntityCannotBeAutoAnalyzed from './entity-cannot-be-auto-analyzed.vue'
import NamesCapture from '../../common/names-capture.vue'
import ApplicantInfo1 from '../../common/applicant-info-1.vue'
import ApplicantInfo2 from '../../common/applicant-info-2.vue'
import ApplicantInfo3 from '../../common/applicant-info-3.vue'
import InvalidActionMessage from '../../existing-request/invalid-action-message.vue'
import Timeout from './timeout.vue'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

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
  // Global getters
  @Getter getActingOnOwnBehalf!: boolean
  @Getter getEditMode!: boolean
  @Getter getSubmissionTabNumber!: number

  // Global actions
  @Action setSubmissionTabNumber!: ActionBindingIF

  private mounted (): void {
    let link = document.createElement('link')
    link.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/open-iconic/1.1.1/font/css/open-iconic.min.css')
    link.setAttribute('rel', 'stylesheet')
    document.head.appendChild(link)
  }

  private get submissionModeHeader (): string {
    // safety check
    if (this.getEditMode) return ''

    if (this.submissionTabNumber === 1) {
      return 'Submit a Name Request for Review'
    } else {
      return 'Submission Details'
    }
  }

  private get submissionTabNumber (): number {
    return this.getSubmissionTabNumber
  }

  private set submissionTabNumber (value: number) {
    this.setSubmissionTabNumber(value)
  }
}
</script>
