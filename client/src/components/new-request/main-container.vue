<template>
  <v-container class="main-container-style px-9 normal-copy">
    <v-row justify="space-between" class="submission-tabs-top">
      <slot name="container-header" />
      <v-col cols="auto">
        <button id="back-to-search-btn"
                class="modal-activator pa-0 normal-link-sans-ul"
                @click="cancelAnalyzeName">
          <span class="normal-link-sans-ul">
            <v-icon class="ma-0 pa-0 mr-n1 mini-back-arrow">arrow_back_ios</v-icon>
            Start Search Over
          </span>
        </button>
      </v-col>
    </v-row>
    <slot name="content"/>
  </v-container>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class MainContainer extends Vue {
  cancelAnalyzeName () {
    newReqModule.cancelAnalyzeName()
  }
}
</script>

<style lang="sass" scoped>
.rounded-corner-6px
  border-radius: 6px !important
</style>
