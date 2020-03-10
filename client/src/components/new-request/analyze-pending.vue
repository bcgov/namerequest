<template>
  <MainContainer id="analyze-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto h4">
        You are searching for a name for {{ requestAction }}
        {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }} {{ entityText }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row no-gutters justify="space-between" align-content="space-around">
        <NameInput class="mt-3" />
      </v-row>
      <v-row justify="center" class="mt-n7 mb-n3 py-0">
      <v-col cols="auto">
        <b>This could take several minutes</b>
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
      <v-col cols="auto" class="small-copy">
        Search Status: Analyzing
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto">
        <v-btn id="analyze-pending-stop-button" @click="startOver">Stop Search</v-btn>
      </v-col>
    </v-row>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import MainContainer from '@/components/new-request/main-container.vue'
import newReqModule from '@/store/new-request-module'
import NameInput from '@/components/new-request/name-input'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { MainContainer, NameInput }
})
export default class AnalyzePending extends Vue {
  get entityObject () {
    return newReqModule.entityTypeOptions.find((ent: any) => ent.value === this.entityType)
  }
  get entityText () {
    return newReqModule.entityTextFromValue
  }
  get entityType () {
    return newReqModule.entityType
  }
  get location () {
    let value = newReqModule.location
    let options = newReqModule.locationOptions
    return options.find((opt: any) => opt.value === value)
  }
  get requestAction () {
    switch (newReqModule.requestAction) {
      case 'new':
        return 'a new'
      case 'existing':
        return 'an existing'
      default:
        return 'a new'
    }
  }

  startOver () {
    newReqModule.stopAnalyzeName()
  }
}

</script>
