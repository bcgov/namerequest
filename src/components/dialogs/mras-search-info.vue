<template>
  <v-dialog
    id="mras-search-info-modal"
    v-model="showModal"
    width="40rem"
    persistent
  >
    <v-card class="pa-9">
      <v-card-title class="d-flex justify-space-between">
        Corporate Number Not Found
        <div class="mt-3">
          <v-btn
            icon
            large
            class="dialog-close"
            @click="clearAndClose()"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-card-text class="copy-normal pb-3">
        <p>
          Corporate Number assigned by Home Jurisdiction: <span class="font-weight-bold">{{ corpSearch }}</span><br>
          Home jurisdiction: <span class="font-weight-bold">{{ jurisdictionText }}</span>
        </p>
        <p>{{ resultDesc }}</p>
        <p>{{ resultAct }}</p>

        <NameInput :is-mras-search="!isNameSearch" />
      </v-card-text>

      <v-card-actions class="justify-center">
        <div class="mt-1 mb-1 text-center">
          <v-btn
            class="search-btn"
            @click="isNameSearch ? handleSubmit() : clearAndClose()"
          >
            {{ name ? 'Search' : 'Close' }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NameInput from '@/components/new-request/name-input.vue'
import { BAD_REQUEST, NOT_FOUND, SERVICE_UNAVAILABLE } from 'http-status-codes'

@Component({
  components: { NameInput }
})
export default class MrasSearchInfoDialog extends Vue {
  // Global getters
  @Getter getCorpSearch!: string
  @Getter getErrors!: string[]
  @Getter getHasNoCorpNum!: boolean
  @Getter getJurisdictionText!: string
  @Getter getMrasSearchResultCode!: number
  @Getter getName!: string
  @Getter getMrasSearchInfoModalVisible!: boolean

  // Global actions
  @Action setMrasSearchInfoModalVisible!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setNoCorpNum!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

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

  get showModal (): boolean {
    return this.getMrasSearchInfoModalVisible
  }

  set showModal (value: boolean) {
    this.setMrasSearchInfoModalVisible(value)
  }

  get name (): string {
    return this.getName
  }

  get corpSearch (): string {
    return this.getCorpSearch
  }

  get jurisdictionText (): string {
    return this.getJurisdictionText
  }

  get resultDesc () {
    return this.resultConfig[this.getMrasSearchResultCode]?.desc || this.resultConfig.default.desc
  }

  get resultAct () {
    return this.resultConfig[this.getMrasSearchResultCode]?.action || this.resultConfig.default.action
  }

  get isNameSearch (): boolean {
    return (this.getHasNoCorpNum || this.getMrasSearchResultCode !== NOT_FOUND)
  }

  get errors (): string[] {
    return this.getErrors
  }

  async handleSubmit (): Promise<void> {
    this.showModal = false
    if (this.name) await this.startAnalyzeName(null)
    this.setNoCorpNum(false)
  }

  clearAndClose (): void {
    this.showModal = false
    this.setName('')
    this.setNoCorpNum(false)
  }
}
</script>

<style lang="scss" scoped>
.search-btn {
  min-width: 160px !important;
}
</style>
