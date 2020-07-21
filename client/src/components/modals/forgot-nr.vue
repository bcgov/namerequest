<template>
  <v-dialog v-model="showModal" persistent max-width="575">
    <template v-slot:activator="{ on }">
      <v-btn color="primary" dark v-on="on">Open Dialog</v-btn>
    </template>
    <v-card>
      <v-card-title class="headline">Use Google's location service?</v-card-title>
      <v-card-text>
        Let Google help apps determine location. This means sending anonymous location data to Google,
        even when no apps are running.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" text @click="dialog = false">Disagree</v-btn>
        <v-btn color="green darken-1" text @click="dialog = false">Agree</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ForgotNRModal extends Vue {
  get showModal () {
    return newReqModule.forgotNRModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.toggleForgotNRModal(value)
  }
}

</script>

<style lang="sass" scoped>
.modal-class
  background-color: white
  height: 200px
  color: pink !important

</style>
