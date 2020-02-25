<template>
  <v-container class="px-9 py-5" id="applicant-info-container">
    <v-row justify="space-between">
      <v-col cols="auto">
        <b class="h6">Submission Details</b>
      </v-col>

    </v-row>
  </v-container>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ApplicantInfo extends Vue {
  startOver () {
    newReqModule.stopAnalyzeName()
  }
}
</script>

<style scoped lang="sass">

</style>
