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
        <p>{{ resultDesc  }}</p>
        <p>{{ resultAct }}</p>
      </v-card-text>
      <NameInput id="name-input-component"
                 class="mb-n7 pa-0"
                  :is-mras-search="!isNameSearch"/>
      <v-card-actions class="justify-center">
        <div class="mt-1 mb-1 text-center">
          <v-btn class="search-btn"
                 @click="isNameSearch ? handleSubmit() : clearAndClose()">{{ name ? 'Search' : 'Close' }}</v-btn>
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
  private resultConfig: any = {
    [BAD_REQUEST]: {
      desc: null,
      action: 'To continue, enter the name of your business below:'
    },
    [NOT_FOUND]: {
      desc: 'We were not able to retrieve your information from the home jurisdiction.',
      action: 'Close this dialog and try your corporate number again, or enter the name of your business below:'
    },
    [SERVICE_UNAVAILABLE]: {
      desc: 'We were not able to retrieve your information from the home jurisdiction.',
      action: 'Please enter the name of your business below:'
    },
    default: {
      desc: 'We were not able to retrieve your information from the home jurisdiction.',
      action: 'Please enter the name of your business below:'
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
  get resultDesc () {
    return this.resultConfig[newReqModule.mrasSearchResultCode]?.desc || this.resultConfig.default.desc
  }
  get resultAct () {
    return this.resultConfig[newReqModule.mrasSearchResultCode]?.action || this.resultConfig.default.action
  }
  get isNameSearch (): boolean {
    return (newReqModule.noCorpNum || newReqModule.mrasSearchResultCode !== NOT_FOUND)
  }
  get errors () {
    return newReqModule.errors
  }
  async handleSubmit (): Promise<void> {
    this.showModal = false
    if (this.name) await newReqModule.startAnalyzeName()
    newReqModule.mutateCorpSearch('')
    newReqModule.mutateNoCorpNum(false)
  }
  private clearAndClose (): void {
    this.showModal = false
    newReqModule.mutateName('')
    newReqModule.mutateCorpSearch('')
    newReqModule.mutateNoCorpNum(false)
  }
}
</script>

<style lang="scss" scoped>
.search-btn {
  min-width: 160px !important;
}
</style>
