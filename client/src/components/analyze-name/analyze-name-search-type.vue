<template>
  <v-row no-gutters>
    <v-radio-group :value="searchType" class="mb-n5" id="search-type-radio" dark row>
      <v-radio label="Any Type of Name"
               @click="setRadio('name')"
               value="name" />
      <v-radio label="An Existing Request"
               @click="setRadio('nr')"
               value="nr" />
      <v-radio label="Advanced"
               @click="setRadio('advanced')"
               value="qqq" />
    </v-radio-group>
  </v-row>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import { SearchType } from '@/models'
  import analyzeName from '@/store/analyze-name-module'

  @Component
  export default class AnalyzeNameSearchType extends Vue {
    private get searchType(): SearchType {
      return analyzeName.searchType
    }

    private setRadio(value: SearchType) {
      analyzeName.setSearchType(value)
    }
  }
</script>

<style lang="stylus" scoped>
  .white-s
    color white !important
</style>
