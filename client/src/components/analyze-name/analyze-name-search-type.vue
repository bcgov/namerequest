<template>
  <v-row no-gutters justify="space-between" class="mb-n4">
      <v-checkbox label="Sole Proprietorship"
                  value="sole"
                  v-model="searchType" />
      <v-checkbox label="All Other Types"
                  value="other"
                  v-model="searchType" />
      <v-checkbox label="Not Sure"
                  value="unsure"
                  v-model="searchType" />
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { SearchType } from '@/models'
import analyzeName from '@/store/analyze-name-module'

@Component({})
export default class AnalyzeNameSearchType extends Vue {
  private get searchType (): SearchType {
    return analyzeName.searchType
  }

  private set searchType (value: SearchType) {
    analyzeName.setSearchType(value)
  }
}
</script>
