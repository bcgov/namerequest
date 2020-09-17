<template>
  <v-card class="pa-6">
    <v-card-text class="h3">Error</v-card-text>
    <v-card-text class="copy-normal">
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class ErrorMessage extends Vue {
}

</script>
