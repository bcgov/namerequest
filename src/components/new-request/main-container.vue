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
            {{ getEditMode ? 'Return' : 'Start Over' }}
          </span>
        </button>
      </v-col>
    </v-row>
    <slot name="content"/>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { DisplayedComponentMixin } from '@/mixins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class MainContainer extends Mixins(DisplayedComponentMixin) {
  // Global Getters
  @Getter getEditMode!: boolean
  @Getter getDisplayedComponent!: string
  @Getter getSubmissionTabNumber!: number

  // Global Actions
  @Action setExitModalVisible!: ActionBindingIF

  componentName: string = ''

  private mounted () {
    this.$nextTick(() => {
      if (this.$el?.querySelector) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        if (this.showExit) {
          const exitBtn = this.$el.querySelector('#back-to-search-btn > span')
          if (exitBtn) exitBtn.classList.add('exit-btn')
        } else if (this.getEditMode) {
          const returnBtn = this.$el.querySelector('#back-to-search-btn > span')
          if (returnBtn) returnBtn.classList.add('return-btn')
        } else {
          const startSearchOverBtn = this.$el.querySelector('#back-to-search-btn > span')
          if (startSearchOverBtn) startSearchOverBtn.classList.add('start-search-over-btn')
        }
      }
    })
  }

  get showExit (): boolean {
    return [2, 3].includes(this.getSubmissionTabNumber) ||
      this.getDisplayedComponent === 'ExistingRequestDisplay'
  }

  backToSearch () {
    if ([2, 3].includes(this.getSubmissionTabNumber) && !this.getEditMode &&
      this.getDisplayedComponent !== 'ExistingRequestDisplay') {
      this.setExitModalVisible(true)
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
