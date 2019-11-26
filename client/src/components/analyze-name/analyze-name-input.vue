<template>
  <v-form @submit="submitName">
    <v-text-field v-model="nameSearch"
                  solo
                  flat
                  placeholder="Enter a Name or your Request Number (eg NR123456)"
                  id="analyze-name-text-field">
      <template v-slot:append>
        <v-icon class="name-search-icon">search</v-icon>
      </template>
    </v-text-field>
  </v-form>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator'
  import analyzeName from '@/store/analyze-name-module'

  @Component
  export default class AnalyzeNameInput extends Vue {
    private get nameSearch(): string {
      return analyzeName.analyzedName
    }

    private set nameSearch(name: string) {
      analyzeName.captureName(name)
    }

    private submitName() {

    }
  }
</script>

<style lang="stylus" scoped>
  .name-search-icon
    color #1976d2 !important
    cursor pointer
</style>
