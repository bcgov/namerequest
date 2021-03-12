<template>
  <v-row>
    <v-col cols="12" class="text-center h4">
      Request Timed Out
    </v-col>
    <v-col cols="12" class="text-center mt-n3">
      Unfortunately you took too long to complete your submission. Please try again from the beginning.
    </v-col>
    <v-col cols="12" class="text-center">
      <v-btn @click="restart">Search Again</v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
// import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import MainContainer from '@/components/new-request/main-container.vue'
import { Action } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: { MainContainer }
})
export default class Timeout extends Vue {
  @Action resetAnalyzeName!: ActionBindingIF
  @Action setActiveComponent!: ActionBindingIF

  async restart () {
    await this.resetAnalyzeName(null)
    this.setActiveComponent('Tabs')
  }
}
</script>
