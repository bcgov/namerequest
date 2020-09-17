<template>
  <v-dialog v-model="showModal" max-width="40%">
    <v-card class="pa-6">
      <v-card-text class="h3">Error</v-card-text>
      <v-card-text class="copy-normal">
        <ul v-if="hasErrors" style="list-style-type: none; margin: 0; padding: 0">
          <li :key="error.id" v-for="error in errors">{{ error.error }}</li>
        </ul>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="hideModal()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'
import * as errorTypes from '@/modules/error/store/types'
// import * as errorActions from '@/modules/error/store/actions'

import { Component, Vue } from 'vue-property-decorator'

@Component({
})
export default class ErrorModal extends Vue {
  get showModal () {
    return errorModule[errorTypes.HAS_ERRORS]
  }

  async hideModal () {
    await errorModule.clearAppErrors()
  }

  get hasErrors (): ErrorI[] {
    return errorModule[errorTypes.HAS_ERRORS]
  }

  get errors (): ErrorI[] {
    return errorModule[errorTypes.GET_ERRORS]
  }
}

</script>
