<template>
  <MainContainer>
    <template v-slot:container-header>
      <v-col cols="auto" class="font-weight-bold h5 py-0">
        {{ editModeHeader }}
      </v-col>
    </template>

    <template v-slot:content>
      <v-tabs v-model="submissionTabNumber" id="applicant-info-slider">
        <v-tabs-items v-model="submissionTabNumber" touchless>
          <v-tab-item>
            <keep-alive>
              <EntityCannotBeAutoAnalyzed />
            </keep-alive>
          </v-tab-item>

          <v-tab-item>
            <!-- Names Capture also shows the menus -->
            <NamesCapture />
          </v-tab-item>

          <v-tab-item>
            <ApplicantInfo1 />
          </v-tab-item>

          <v-tab-item>
            <ApplicantInfo2 v-if="getActingOnOwnBehalf" />
            <ApplicantInfo3 v-else />
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import MainContainer from '@/components/new-request/main-container.vue'
import EntityCannotBeAutoAnalyzed from '@/components/new-request/submit-request/entity-cannot-be-auto-analyzed.vue'
import NamesCapture from '@/components/common/names-capture.vue'
import ApplicantInfo1 from '@/components/common/applicant-info-1.vue'
import ApplicantInfo2 from '@/components/common/applicant-info-2.vue'
import ApplicantInfo3 from '@/components/common/applicant-info-3.vue'

import { ActionBindingIF } from '@/interfaces/store-interfaces'

/**
 * This is the component for the steps when editing an existing NR.
 */
@Component({
  components: {
    MainContainer,
    EntityCannotBeAutoAnalyzed,
    NamesCapture,
    ApplicantInfo1,
    ApplicantInfo2,
    ApplicantInfo3
  }
})
export default class ExistingRequestEdit extends Vue {
  // Global getters
  @Getter getActingOnOwnBehalf!: boolean
  @Getter getEditMode!: boolean
  @Getter getSubmissionTabNumber!: number

  // Global Action
  @Action setSubmissionTabNumber!: ActionBindingIF

  get editModeHeader (): string {
    // safety check
    if (!this.getEditMode) return ''

    if (this.submissionTabNumber === 1) {
      return 'Request Type'
    } else {
      return 'Application Details'
    }
  }

  get submissionTabNumber (): number {
    return this.getSubmissionTabNumber
  }

  set submissionTabNumber (value: number) {
    this.setSubmissionTabNumber(value)
  }
}
</script>
