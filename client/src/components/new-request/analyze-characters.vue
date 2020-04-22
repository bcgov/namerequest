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
      <v-row>
        <v-col>
          <v-container class="small-copy text-left helpful-hint">
            <v-row align-content="space-between" style="height: 100%">
              <v-col class="h5 py-0"><v-icon class="pr-2 pale-blue-text">info</v-icon>
                Helpful Hint</v-col>
              <v-col cols="12">
                <p>Your name contained unsupported characters, which we have automatically removed.  Please review your
                name as it appears above and make any necessary changes before clicking the magnifying glass to try
                  your search again.</p>
                <p class="text-lg-center">Only the following special characters may be used in your name:</p>
                <p class="my-3 text-center large-copy bold-copy">/ [ ] ^ * + - = & ( ) . , " ' # @ ! ? ; :</p>
              </v-col>
            </v-row>
          </v-container>
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
export default class AnalyzeCharacters extends Vue {
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
