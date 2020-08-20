<template>
  <v-dialog v-model="showModal" max-width="60%">
    <sbc-authentication-options></sbc-authentication-options>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SbcAuthenticationOptions from 'sbc-common-components/src/components/SbcAuthenticationOptions.vue'
import newReqModule from '@/store/new-request-module'

@Component({
  components: {
    SbcAuthenticationOptions
  }
})
export default class IncorporateLoginModal extends Vue {
  get showModal () {
    return newReqModule.incorporateLoginModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateIncorporateLoginModalVisible(value)
  }
}

</script>
