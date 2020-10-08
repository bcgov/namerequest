<template>
  <v-row class="my-3 py-3">
    <v-col cols="12" class="text-center h4">
      {{ details.heading }}
    </v-col>
    <v-col cols="12" class="text-center copy-normal mt-n2 mb-2" v-html="details.details" />
    <v-col cols="12" class="text-center">
      <v-btn @click="goBack">Return to NR Summary</v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue, Watch } from 'vue-property-decorator'
import MainContainer from '@/components/new-request/main-container.vue'

@Component({
  components: { MainContainer }
})
export default class InvalidActionMessage extends Vue {
  /* mounted () {
    setTimeout(() => {
      newReqModule.mutateDisplayedComponent('ExistingRequestDisplay')
    }, 10000)
  } */
  get nr () {
    return newReqModule.nr
  }
  get stateCd (): string {
    return ((this.nr || {}).stateCd) || ''
  }
  get details () {
    switch (this.stateCd) {
      case 'APPROVED':
      case 'CONDITIONAL':
      case 'REJECTED':
        return {
          heading: 'We have finished examining your Name Request',
          details: `Your request has been ${this.stateCd === 'CONDITIONAL' ? 'CONDITIONALLY APPROVED' : this.stateCd}`
        }
      case 'CANCELLED':
        return {
          heading: 'Unfortunately your Name Request has been CANCELLED',
          details: 'Please contact <i>Registries and Online Services</i> at 250-387-7848 if you require ' +
           'further assistance.'
        }
      default:
        return {
          heading: 'Your Name Request is currently being examined',
          details: 'Please check back later to see the result.'
        }
    }
  }

  async goBack () {
    newReqModule.setActiveComponent('ExistingRequestDisplay')
  }
}
</script>
