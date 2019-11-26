<template>
  <v-container fluid id="name-container">
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
import AnalyzeNameInput from './analyze-name-input.vue'

@Component({
  components: { AnalyzeNameInput }
})
export default class AnalyzeNameContainer extends Vue {}
</script>

<style lang="scss" scoped>
#name-container {
  background-color: white;
  padding: 0;
  color: $blue;
  border-radius: 0 0 5px 5px;
  height: 300px;
}

</style>
