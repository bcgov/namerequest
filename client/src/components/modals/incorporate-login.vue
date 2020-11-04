<template>
  <v-dialog v-model="showModal" max-width="60%" >
    <v-card class="pa-4">
      <sbc-authentication-options :redirectUrl="getNameRequestUrl" />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { mapGetters } from 'vuex'
import newReqModule from '@/store/new-request-module'
import SbcAuthenticationOptions from 'sbc-common-components/src/components/SbcAuthenticationOptions.vue'

@Component({
  components: {
    SbcAuthenticationOptions
  },
  computed: {
    ...mapGetters(['getNameRequestUrl'])
  }
})
export default class IncorporateLoginModal extends Vue {
  readonly getNameRequestUrl!: string

  get showModal () {
    return newReqModule.incorporateLoginModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateIncorporateLoginModalVisible(value)
  }
}

</script>
