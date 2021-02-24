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
import MainContainer from '@/components/new-request/main-container.vue'
import newReqModule from '@/store/new-request-module'
import NameInput from '@/components/new-request/name-input.vue'
import { Component, Vue } from 'vue-property-decorator'

@Component({
  components: { MainContainer, NameInput }
})
export default class QuickSearchPending extends Vue {
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
  async skip () {
    newReqModule.mutateQuickSearch(false)
    await newReqModule.startAnalyzeName()
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
