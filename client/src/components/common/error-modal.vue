<template>
  <v-dialog v-model="showModal" max-width="40%">
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>Name Request Encountered an Error</div>
        <v-btn icon large class="dialog-close" @click="hideModal()">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="copy-normal">
        <ul v-if="hasErrors">
          <li v-for="error in errors" :key="error.id" v-html="error.error" />
        </ul>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn text @click="hideModal()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ErrorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'
import * as ErrorTypes from '@/modules/error/store/types'

@Component({})
export default class ErrorModal extends Vue {
  get showModal () {
    return ErrorModule[ErrorTypes.HAS_ERRORS]
  }

  async hideModal () {
    await ErrorModule.clearAppErrors()
  }

  get hasErrors (): ErrorI[] {
    return ErrorModule[ErrorTypes.HAS_ERRORS]
  }

  get errors (): ErrorI[] {
    return ErrorModule[ErrorTypes.GET_ERRORS]
  }
}
</script>
