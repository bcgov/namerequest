<template>
  <v-container fluid class="white rounded copy-normal pa-10">
    <v-row justify="space-between" class="submission-tabs-top">
      <slot name="container-header" />
      <v-col cols="auto" class="py-0" v-if="displayedComponent !== 'Success'">
        <button id="back-to-search-btn"
                class="modal-activator link-std-sans-ul"
                @click="backToSearch()">
          <span class="link-std-sans-ul" v-if="showExit">
            Exit
            <v-icon color="primary" class="dialog-close mt-n1">mdi-close</v-icon>
          </span>
          <span class="link-std-sans-ul" v-else>
            <v-icon class="mr-n1 mini-back-arrow">mdi-chevron-left</v-icon>
            {{ editMode ? 'Return' : 'Start Over' }}
          </span>
        </button>
      </v-col>
    </v-row>
    <slot name="content"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'

import { DisplayedComponentMixin } from '@/mixins'
import newReqModule from '@/store/new-request-module'

@Component({})
export default class MainContainer extends Mixins(DisplayedComponentMixin) {
  componentName: string = ''

  private mounted () {
    this.$nextTick(() => {
      if (this.$el?.querySelector) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        if (this.showExit) {
          const exitBtn = this.$el.querySelector('#back-to-search-btn > span')
          if (exitBtn) exitBtn.classList.add('exit-btn')
        } else if (this.editMode) {
          const returnBtn = this.$el.querySelector('#back-to-search-btn > span')
          if (returnBtn) returnBtn.classList.add('return-btn')
        } else {
          const startSearchOverBtn = this.$el.querySelector('#back-to-search-btn > span')
          if (startSearchOverBtn) startSearchOverBtn.classList.add('start-search-over-btn')
        }
      }
    })
  }

  get editMode () {
    return newReqModule.editMode
  }

  get showExit (): boolean {
    return [2, 3].includes(newReqModule.submissionTabNumber) ||
      newReqModule.displayedComponent === 'ExistingRequestDisplay'
  }

  backToSearch () {
    if ([2, 3].includes(newReqModule.submissionTabNumber) && !this.editMode &&
      newReqModule.displayedComponent !== 'ExistingRequestDisplay') {
      newReqModule.mutateExitModalVisible(true)
    } else {
      this.cancelAndResetState()
    }
  }
}
</script>

<style lang="scss" scoped>
#back-to-search-btn:focus {
  outline:0;
}
</style>
