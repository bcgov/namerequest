<template>
  <v-container id="tabs-landing-comp">
    <v-tabs v-model="tabNumber"
            active-class="active-tab"
            style="border-radius: 4px 4px 0 0"
            hide-slider
            height="64"
            centered
            grow>
      <v-tab :ripple="false"
              id="new-tab"
              class="upper-border"
              :class="{ 'mt-1': tabNumber === 1 }"
              tabindex="0">
        <v-icon class="mr-2">mdi-magnify</v-icon>
        <span v-if="!isMobile" :class="tabNumber === 0 ? 'h5' : 'h5-lt'">Request a Business Name</span>
      </v-tab>
      <v-tab :ripple="false"
              id="existing-tab"
              class="upper-border"
             :class="{ 'mt-1': tabNumber === 0 }"
              tabindex="1">
        <v-icon class="mr-2">mdi-file-document-edit-outline</v-icon>
        <span v-if="!isMobile" :class="tabNumber === 1 ? 'h5' : 'h5-lt'">Manage My Name Request</span>
      </v-tab>
      <v-tabs-items class="rounded-b tab-items" v-model="tabNumber" touchless>
        <v-tab-item>
          <NewSearch />
          <LinkRow />
        </v-tab-item>
        <v-tab-item>
          <ExistingRequestSearch/>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
  </v-container>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// Components
import NewSearch from '@/components/new-request/search.vue'
import ExistingRequestSearch from './existing-request/existing-request-search.vue'
import LinkRow from '@/components/common/link-row.vue'
import { CommonMixin } from '@/mixins'
// Interfaces
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    NewSearch,
    ExistingRequestSearch,
    LinkRow
  }
})
export default class Tabs extends Mixins(CommonMixin) {
  // Global getter
  @Getter getTabNumber!: number
  @Getter isMobile!: boolean

  // Global action
  @Action setTabNumber!: ActionBindingIF

  get tabNumber () {
    return this.getTabNumber
  }

  set tabNumber (tab: number) {
    this.setTabNumber(tab)
  }

  @Watch('tabNumber')
  private scrollToTop () {
    this.scrollTo('namerequest-sbc-header')
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';
#tabs-landing-comp {
  max-width: 1140px !important;
  padding: 0 !important;
}

#new-tab, #existing-tab {
  min-height: 64px;
  background-color: $BCgovBlue5;
}

.upper-border {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  min-height: 58px;
  max-height: 58px;
  margin: 0 2.5px;
}

::v-deep .v-tab:before {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

::v-deep .theme--light.v-tabs > .v-tabs-bar{
  background-color: transparent;
}

::v-deep .theme--light.v-tabs > .v-tabs-bar .v-tab:not(.v-tab--active) > .v-icon {
  color: white;
  transition: none !important;
}
</style>
