<template>
  <MainContainer>
    <template v-slot:container-header>
      <v-col cols="auto" class="font-weight-bold h5 py-0">
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
import { Component, Vue, Watch } from 'vue-property-decorator'
import NewReqModule from '@/store/new-request-module'
import MainContainer from '@/components/new-request/main-container.vue'
import EntityCannotBeAutoAnalyzed from '@/components/new-request/submit-request/entity-cannot-be-auto-analyzed.vue'
import NamesCapture from '@/components/common/names-capture.vue'
import ApplicantInfo1 from '@/components/common/applicant-info-1.vue'
import ApplicantInfo2 from '@/components/common/applicant-info-2.vue'
import ApplicantInfo3 from '@/components/common/applicant-info-3.vue'

/**
 * This is the component container for editing an existing NR.
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
  private get actingOnOwnBehalf (): boolean {
    return NewReqModule.actingOnOwnBehalf
  }

  private get editModeHeader (): string {
    // safety check
    if (!NewReqModule.editMode) return ''

    if (this.submissionTabNumber === 1) {
      return 'Request Type'
    } else {
      return 'Application Details'
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
