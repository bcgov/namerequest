<template>
  <v-dialog v-model="showModal" id="mras-search-info-modal" width="40rem" persistent>
    <v-card class="pa-9">
      <v-row no-gutters>
        <v-col cols="11">
          <v-card-title>
            Corporate Number Not Found
          </v-card-title>
        </v-col>
        <v-col cols="1">
          <v-icon md color="primary" @click="clearAndClose()">mdi-close</v-icon>
        </v-col>
      </v-row>
      <v-card-text class="copy-normal pb-3">
        <p>Corporate Number assigned by Home Jurisdiction: <span class="font-weight-bold">{{ corpSearch }}</span><br>
          Home jurisdiction: <span class="font-weight-bold">{{ jurisdictionText }}</span></p>
        <p>{{ resultConfig[resultCode].desc  }}</p>
        <p>{{ resultConfig[resultCode].action }}</p>
      </v-card-text>
      <NameInput id="name-input-component"
                 class="mb-n7 pa-0"/>
      <v-card-actions class="justify-center">
        <div class="mt-1 mb-1 text-center">
          <v-btn class="search-btn"
                 @click="handleSubmit()">{{ showSearch ? 'Search' : 'Close' }}</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import NameInput from '@/components/new-request/name-input.vue'
import { BAD_REQUEST, NOT_FOUND, SERVICE_UNAVAILABLE } from 'http-status-codes'

@Component({
  components: { NameInput }
})
export default class MrasSearchInfoModal extends Vue {
  private resultConfig = {
    BAD_REQUEST: {
      desc: null,
      action: 'To continue, enter the name of your business below:'
    },
    NOT_FOUND: {
      desc: 'We were not able to retrieve your information from the home jurisdiction.',
      action: 'Close this dialog and try your corporate number again, or enter the name of your business below:'
    },
    SERVICE_UNAVAILABLE: {
      desc: 'We were not able to retrieve your information from the home jurisdiction.',
      action: 'Please enter the name of your business below:'
    },
    default: {
      desc: null,
      action: null
    }
  }
  get showModal () {
    return newReqModule.mrasSearchInfoModalVisible
  }
  set showModal (value: boolean) {
    newReqModule.mutateMrasSearchInfoModalVisible(value)
  }
  get name () {
    return newReqModule.name
  }
  get corpSearch () {
    return newReqModule.corpSearch
  }
  get jurisdictionText () {
    return newReqModule.jurisdictionText
  }
  get resultCode () {
    return newReqModule.mrasSearchResultCode || 'default'
  }
  get showSearch (): boolean {
    return (this.name || this.resultCode !== 404)
  }
  get errors () {
    return newReqModule.errors
  }
  async handleSubmit (): Promise<void> {
    this.showModal = false
    newReqModule.mutateCorpSearch('')
    await newReqModule.startAnalyzeName()
  }
  private clearAndClose (): void {
    this.showModal = false
    newReqModule.mutateName('')
    newReqModule.mutateCorpSearch('')
  }
}

</script>
<style lang="scss" scoped>
.search-btn {
  min-width: 160px !important;
}
</style>
