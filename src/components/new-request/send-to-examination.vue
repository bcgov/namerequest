<template>
  <MainContainer id="non-analyze-container">
    <template v-slot:container-header>
      <v-col cols="auto" class="h6 pt-0 my-1">
        You are searching for a name for a
        {{ getEntityTextFromValue === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }}
        {{ getEntityTextFromValue }}
      </v-col>
    </template>

    <template v-slot:content>
      <v-row no-gutters>
        <NameInput :is-read-only="true" class="mb-n2"/>
      </v-row>

      <v-row no-gutters justify="center" class="text-center">
        <v-col cols="auto" class="h5">
          <v-icon class="action-icon" :class="actionConfig.class">{{ actionConfig.icon }}</v-icon>
          <span class="pl-2" :class="actionConfig.class">{{ actionConfig.text }}</span>
        </v-col>
        <v-col cols="12">
          <p :class="actionConfig.class">{{ actionConfig.subText }}</p>
        </v-col>
      </v-row>

      <v-row class="text-center justify-center mb-n2">
        <ReserveSubmit />
      </v-row>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import MainContainer from '@/components/new-request/main-container.vue'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import NameInput from '@/components/new-request/name-input.vue'

import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { Location } from '@/enums'

@Component({
  components: {
    MainContainer,
    NameInput,
    ReserveSubmit
  }
})
export default class SendToExamination extends Vue {
  // Global getters
  @Getter getEntityTextFromValue!: string
  @Getter getLocation!: Location
  @Getter getLocationOptions!: any[]

  // Global actions
  @Action setDisplayedComponent!: ActionBindingIF
  @Action setSubmissionTabComponent!: ActionBindingIF

  private actionConfig = {
    class: 'approved',
    icon: 'mdi-check-circle',
    text: 'Name Ready for Review',
    subText: '(Detailed Analysis Coming Soon)',
    showNextLines: true
  }

  get location (): any {
    return this.getLocationOptions.find(opt => opt.value === this.getLocation)
  }

  sendToExamination () {
    this.setSubmissionTabComponent('NamesCapture')
    this.setDisplayedComponent('SubmissionTabs')
  }
}
</script>

<style lang="scss" scoped>
.action-icon {
  margin-top: -2px;
}
</style>
