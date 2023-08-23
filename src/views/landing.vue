<template>
  <v-container id="landing-container" class="ma-0 pa-0" fluid>
    <v-row id="upper-row" no-gutters align-content="start">
      <v-container class="landing-content-container">
        <AppTitleCols />

        <div class="main-container-style mt-3">
          <transition name="fade" mode="out-in" :duration="{ enter: 100, leave: 100 }">
            <keep-alive :include="['Tabs']">
              <component
                class="mb-3"
                :is="getDisplayedComponent"
                :key="getDisplayedComponent"
                transition="fade-transition"
              />
            </keep-alive>
          </transition>
        </div>

        <!-- FOR DEBUGGING -->
        <div>getRequestActionCd={{ getRequestActionCd }}</div>
        <div>getLocation={{ getLocation }}</div>
        <div>getEntityTypeCd={{ getEntityTypeCd }}</div>
        <div>isMrasJurisdiction={{ isMrasJurisdiction }}</div>
      </v-container>
    </v-row>

    <v-row id="lower-row" no-gutters>
      <LowerContainer />
    </v-row>
 </v-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

// Components
import { AppTitleCols } from '@/components/common'
import LowerContainer from '@/components/lower-info-area/lower-container.vue'

import ExistingRequestDisplay from '@/components/existing-request/existing-request-display.vue'
import ExistingRequestEdit from '@/components/existing-request/existing-request-edit.vue'
import NameCheck from '@/components/new-request/name-check/name-check.vue'
import SearchPending from '@/components/existing-request/search-pending.vue'
import Stats from '@/components/new-request/stats.vue'
import SubmissionTabs from '@/components/new-request/submit-request/submission-tabs.vue'
import Success from '@/components/common/success.vue'
import Tabs from '@/components/tabs.vue'

import NamexServices from '@/services/namex-services'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    AppTitleCols,
    ExistingRequestDisplay,
    ExistingRequestEdit,
    LowerContainer,
    NameCheck,
    SearchPending,
    Stats,
    SubmissionTabs,
    Success,
    Tabs
  }
})
export default class Landing extends Vue {
  // Global getter
  @Getter getDisplayedComponent!: string

  // FOR DEBUGGING:
  @Getter getEntityTypeCd!: any
  @Getter getLocation!: any
  @Getter getRequestActionCd!: any
  @Getter getNrData!: any
  @Getter isMrasJurisdiction!: boolean

  // Global actions
  @Action loadExistingNameRequest!: ActionBindingIF
  @Action setDisplayedComponent!: ActionBindingIF

  /** ID parameter passed in on "/nr" route. */
  @Prop(String)
  readonly id: string

  async mounted () {
    const { id } = this
    const accountId = this.$route.query.accountid?.toString()

    // if an id and accountid was specified then get and load the subject NR
    if (id && accountId) {
      const nrData = await NamexServices.getNameRequestByToken(true, id, accountId)
      if (nrData) await this.loadExistingNameRequest(nrData)
    }

    // everything is rendered/loaded - hide spinner
    // (spinner was shown in App.vue)
    this.$root.$emit('showSpinner', false)
  }

  // FOR DEBUGGING:
  get xproJurisdiction (): string {
    return this.getNrData?.xproJurisdiction
  }
}
</script>

<style lang="scss" scoped>
.landing-content-container {
  max-width: 1140px;
}

#upper-row {
  background: url('~@/assets/images/analyze-name-bg.jpg') no-repeat bottom;
  background-size: cover;
  color: white;
  min-height: 700px;
}
</style>
