<template>
  <MainContainer id="non-analyze-container">
    <template v-slot:container-header>
      <v-col cols="auto" class="h6 pt-0 mt-1">
        You are searching for a name for a
        {{ entityText === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }}
        {{ entityText }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row class="mt-n2">
        <NameInput :is-read-only="true"/>
      </v-row>
      <v-row class="text-center mt-n8">
        <v-col cols="12" class="h5 text-center">
          <v-icon :class="actionConfig.class">
            {{ actionConfig.icon }}
          </v-icon>
          <span :class="actionConfig.class" >{{ actionConfig.text }}</span>
        </v-col>
        <v-col cols="12" class="mt-n4">
          <p class="text-center copy-normal">
            This name cannot be analyzed here and must be sent to staff for review.
          </p>
        </v-col>
      </v-row>
      <v-row class="text-center justify-center mt-n1 mb-n2">
        <ReserveSubmit />
      </v-row>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import MainContainer from '@/components/new-request/main-container.vue'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import NameInput from '@/components/new-request/name-input.vue'

@Component({
  components: {
    MainContainer,
    NameInput,
    ReserveSubmit
  }
})
export default class SendToExamination extends Vue {
  private actionConfig = {
    class: 'rejected',
    icon: 'mdi-star-circle',
    text: 'Further Action Required',
    showNextLines: true
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get location () {
    let value = newReqModule.location
    let options = newReqModule.locationOptions
    return options.find((opt: any) => opt.value === value)
  }
  get name () {
    return newReqModule.name
  }
  sendToExamination () {
    newReqModule.mutateSubmissionTabComponent('NamesCapture')
    newReqModule.mutateDisplayedComponent('SubmissionTabs')
  }
}
</script>
