<template>
  <v-container class="px-9 py-5 normal-copy" id="analyze-pending-container">
    <v-row no-gutters justify="space-between" align-content="space-around">
      <v-col cols="auto">
        <b>You are searching for a name for {{ requestAction }}
          {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }}
          {{ entityText }}
        </b>
      </v-col>
      <v-col cols="auto">
        <button id="back-to-search-btn"
                class="modal-activator pa-0"
                @click="startOver()"><span class="normal-link">Start Search Over</span></button>
      </v-col>
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
  </v-container>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import NameInput from '@/components/new-request/name-input'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { NameInput }
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
