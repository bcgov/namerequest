<template>
  <v-container class="px-9 py-5">
    <v-row justify="space-between">
      <v-col cols="auto">
        <b>You are searching for a name for {{ requestType }}
          {{ entityText === 'BC Corporation' && location.text === 'BC' ? '' : location.text }}
          {{ entityText }}
        </b>
      </v-col>
      <v-col cols="auto">
        <v-btn text
               id="back-to-search-btn"
               class="modal-activator"
               style="position: relative; top: -6px;"
               @click="startOver()"><span class="normal-link">Start Search Over</span></v-btn>
      </v-col>
      <v-col cols="12" class="mt-n5">
        <NewRequestNameInput />
      </v-col>
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
                             indeterminate/>
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
import NewRequestNameInput from '@/components/new-request/name-input.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { NewRequestNameInput }
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
  get requestType () {
    switch (newReqModule.requestType) {
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

<style scoped lang="sass">
.modal-activator
  color: $link !important
  letter-spacing: unset !important
  text-decoration: underline
  cursor: pointer !important
  background-color: unset !important
  text-transform: none !important

</style>
