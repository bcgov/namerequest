<template>
  <v-dialog v-model="showModal">
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <div>Name Request encountered an error</div>
      </v-card-title>

      <v-card-text class="copy-normal">
        <ul v-if="hasErrors" class="ml-n1">
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

<style lang="scss" scoped>
::v-deep .v-dialog {
  width: 40rem;
  min-width: 36rem;
}
</style>
