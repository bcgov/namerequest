<template>
  <MainContainer id="analyze-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto h4">
        You are searching for a name for a
        {{ entityText === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }} {{ entityText }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row no-gutters justify="space-between" align-content="space-around">
        <NameInput class="mt-3" :is-search-again="true"/>
      </v-row>
      <v-row justify="center" class="mt-n7 mb-n3 py-0">
        <v-col cols="12" class="text-center">
          <b>This could take several minutes.</b>
          <p>Analysis of long names or names that use common words can take significantly longer.</p>
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
      <v-row justify="center" class="mt-n3">
        <v-col cols="auto" class="copy-small">
          Search Status: Analyzing
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto">
          <v-btn id="analyze-pending-stop-button" @click="startOver">Stop Search</v-btn>
        </v-col>
        <v-col cols="auto">
          <ReserveSubmit setup="cancel" />
        </v-col>
      </v-row>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import MainContainer from '@/components/new-request/main-container.vue'
import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import newReqModule from '@/store/new-request-module'
import NameInput from '@/components/new-request/name-input.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { ReserveSubmit, MainContainer, NameInput }
})
export default class AnalyzePending extends Vue {
  get entityObject () {
    return newReqModule.entityTypeOptions.find((ent: any) => ent.value === this.entity_type_cd)
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entity_type_cd () {
    return newReqModule.entity_type_cd
  }
  get location () {
    let value = newReqModule.location
    let options = newReqModule.locationOptions
    return options.find((opt: any) => opt.value === value)
  }
  get request_action_cd () {
    switch (newReqModule.request_action_cd) {
      case 'new':
        return 'a new'
      case 'existing':
        return 'an existing'
      default:
        return 'a new'
    }
  }
  startOver () {
    newReqModule.cancelAnalyzeName('Tabs')
  }
}

</script>
