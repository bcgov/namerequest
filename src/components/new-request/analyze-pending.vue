<template>
  <MainContainer id="analyze-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto" class="font-weight-bold py-0 mt-1">
        You are searching for a name for a
        {{ getEntityTextFromValue === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }}
        {{ getEntityTextFromValue }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row no-gutters class="mt-3">
        <NameInput is-search-again="true"/>
      </v-row>
      <v-row justify="center" class="mt-n7 mb-n3 py-0">
        <v-col cols="12" class="detailed-search-title">
          <b>Detailed Analysis</b>
        </v-col>
        <v-col cols="12" class="text-center text-body-2">
          We are attempting a detailed analysis of this name before you send it for review.
          <p>This analysis will run for up to two minutes. Note: We might not obtain results for certain names.</p>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <v-progress-circular color="orange"
                               id="analyze-pending-spinner"
                               size="50"
                               indeterminate />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto" class="pb-0 pr-1">
          <v-btn id="analyze-pending-stop-button" @click="startOver">Stop Search</v-btn>
        </v-col>
        <v-col cols="auto" class="pb-0">
          <ReserveSubmit setup="cancel" />
        </v-col>
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

@Component({
  components: { ReserveSubmit, MainContainer, NameInput }
})
export default class AnalyzePending extends Vue {
  // Global getters
  @Getter getEntityTextFromValue!: string
  @Getter getLocation!: string
  @Getter getLocationOptions!: any[]
  @Getter getRequestActionCd!: string

  // Global actions
  @Action cancelAnalyzeName!: ActionBindingIF

  get location () {
    return this.getLocationOptions.find((opt: any) => opt.value === this.getLocation)
  }

  startOver () {
    this.cancelAnalyzeName('Tabs')
  }
}

</script>
<style scoped lang="scss">
@import '@/assets/scss/theme.scss';
.detailed-search-title {
  font-size: 1rem;
  color: $gray9;
  text-align: center;
  padding: 0;
  margin: 0;
  padding-top: 1.5625rem;
}
</style>
