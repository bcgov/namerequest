<template>
  <MainContainer id="quick-search-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto" class="font-weight-bold py-0 mt-1">
        You are searching for a name for a
        {{ entityText === ' BC Corporation' && location.text === ' BC' ? '' : ' ' + location.text }} {{ entityText }}
      </v-col>
    </template>
    <template v-slot:content>
      <v-row no-gutters class="pt-3">
        <NameInput :is-read-only="true" class="mb-n2"/>
      </v-row>
      <v-row justify="center">
        <v-col cols="12" class="quick-search-title">
          <b>Quick Search</b>
        </v-col>
        <v-col cols="12" class="quick-search-info">
          We are searching for names using these words in similar business categories.
        </v-col>
      </v-row>
      <v-row justify="center" class="spinner-row">
        <v-col cols="auto" class="pa-0 ma-0">
          <v-progress-circular color="orange"
                               id="quick-search-pending-spinner"
                               size="50"
                               indeterminate />
        </v-col>
      </v-row>
      <v-row justify="center" class="skip-button">
        <v-col cols="auto" class="pa-0 ma-0">
          <v-btn id="quick-search-pending-stop-button" @click="skip">Skip Quick Search</v-btn>
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
import { EntityI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: { MainContainer, NameInput }
})
export default class QuickSearchPending extends Vue {
  // Global getter
  @Getter getQuickSearchNames!: object[]
  @Getter getEntityTypeOptions!: Array<EntityI>
  @Getter getEntityTypeCd!: string
  @Getter getEntityTextFromValue!: string
  @Getter getLocation!: string
  @Getter getLocationOptions!: Array<any>
  @Getter getRequestActionCd!: string

  // Global actions
  @Action setQuickSearch!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  get entityText () {
    return this.getEntityTextFromValue
  }

  get location () {
    return this.getLocationOptions.find((opt: any) => opt.value === this.getLocation)
  }

  get request_action_cd () {
    switch (this.getRequestActionCd) {
      case 'new':
        return 'a new'
      case 'existing':
        return 'an existing'
      default:
        return 'a new'
    }
  }
  async skip () {
    this.setQuickSearch(false)
    await this.startAnalyzeName(null)
  }
}

</script>
<style scoped lang="scss">
@import '@/assets/scss/theme.scss';
.quick-search-title {
  font-size: 1rem;
  color: $gray9;
  text-align: center;
  padding: 0;
  margin: 0;
  padding-top: 0.3125rem;
}
.quick-search-info {
  font-size: 0.875rem;
  color: $gray7;
  text-align: center;
  padding: 0;
  margin: 0;
  padding-top: 0.3125rem;
}
.spinner-row {
  padding: 0;
  margin: 0;
  padding-top: 1.5625rem;
}
.skip-button {
  padding: 0;
  margin: 0;
  padding-top: 1.5625rem;
}
</style>
