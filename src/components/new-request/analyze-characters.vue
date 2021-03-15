<template>
  <MainContainer id="analyze-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto h4 py-0 mt-1">
        You are searching for a name for a
        {{ getEntityTextFromValue === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }}
        {{ getEntityTextFromValue }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row no-gutters justify="space-between" align-content="space-around">
        <NameInput class="mt-3" />
      </v-row>
      <v-row>
        <v-col>
          <v-container class="copy-normal text-center square-card-x1 py-6 px-12 colour-p-blue-text">
            <v-row class="ma-0 pa-0">
              <v-col class="h5">
                Required Action</v-col>
              <v-col cols="12">
                <p>
                  Review your name as it appears above and, if needed, make any necessary changes and try your ur
                  search again.</p>
                <p class="copy-bold colour-p-blue-text">
                  Only the following special characters may be used in your name:</p>
                <p class="mt-n3 copy-bold colour-p-blue-text">/ [ ] ^ * + - = & ( ) . , " ' # @ ! ? ; :</p>
                <p>Your name must not begin with a special character.</p>
              </v-col>
            </v-row>
            <v-row class="mt-n1">
              <v-col><v-btn @click="startOver">Search Again</v-btn></v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import MainContainer from '@/components/new-request/main-container.vue'
import NameInput from '@/components/new-request/name-input.vue'

import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: { MainContainer, NameInput }
})
export default class AnalyzeCharacters extends Vue {
  // Global getters
  @Getter getEntityTextFromValue!: string
  @Getter getLocation!: string
  @Getter getLocationOptions!: Array<any>

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
