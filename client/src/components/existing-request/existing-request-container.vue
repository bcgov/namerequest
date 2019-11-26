<template>
  <v-container id="analyze-name-container" fluid>
    <v-row class="pa-5">
      <v-col cols="12" class="grey-text">
        Enter the name you want to reserve for your business
      </v-col>
      <v-col cols="12">
        <AnalyzeNameInput />
      </v-col>
    </v-row>
    <v-row justify="right">
      <v-col cols="3">Click here to see if you need to reserve your name</v-col>
    </v-row>
 </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import analyzeName from '@/store/analyze-name-module'

  @Component({})
export default class ExistingRequestContainer extends Vue {}
</script>

<style lang="scss" scoped>

  #analyze-name-container {
    padding: 0;
    margin: 0;
  }

  .name-search-icon {
    color: $blue !important;
    cursor: pointer;
  }
</style>
