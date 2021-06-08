<template>
  <v-container class="mt-1 mb-n3 py-0" fluid>
    <v-row class="float-right stats-v-row">
<!--      COMMENTED OUT FOR FUTURE IMPLEMENTATION-->
<!--        <div class="stats-content-outer py-0">-->
<!--          <div class="stats-content-inner-1 text-center">-->
<!--            <div class="stats-value h3-lt">{{ autoApprovedCount }}</div>-->
<!--            <div class="stats-unit">Names</div>-->
<!--          </div>-->
<!--          <div class="stats-content-inner-2">-->
<!--            <u>Auto-Approved</u> Today.<br>-->
<!--            No Wait Time-->
<!--          </div>-->
<!--        </div>-->
      <v-tooltip bottom nudge-left="45"
        content-class="bottom-tooltip wait-time-tooltip"
        transition="fade-transition"
      >
        <template v-slot:activator="{ on }">
          <div class="stats-content-outer py-0" v-on="on">
            <div class="stats-content-inner-1 text-center">
              <div class="stats-value h3-lt">{{ priorityWaitTime }}</div>
              <div class="stats-unit">Hours</div>
            </div>
            <div class="stats-content-inner-2">
              <span class="dotted-underline">Priority Request</span><br>
              <span class="dotted-underline">Wait Time</span>
            </div>
          </div>
        </template>
        <span>
          If you need your name reviewed as quickly as possible, Priority requests
          are available for a fee ($100.00). Priority name requests are usually
          reviewed within 1 to 2 business days.
        </span>
      </v-tooltip>
      <v-tooltip bottom nudge-left="45"
        content-class="bottom-tooltip new-submission-wait-time-tooltip"
        transition="fade-transition"
      >
        <template v-slot:activator="{ on }">
          <div id="stats-content-outer-3" class="stats-content-outer py-0" v-on="on">
            <div class="stats-content-inner-1 text-center">
              <div class="stats-value h3-lt">{{ regularWaitTime }}</div>
              <div class="stats-unit">Days</div>
            </div>
            <div class="stats-content-inner-2">
              <span class="dotted-underline">New Submission</span><br>
              <span class="dotted-underline">Wait Time</span>
            </div>
          </div>
        </template>
        <span>
          This is the estimated review wait time when submitting a new name request
          <strong>today</strong>. Wait times are approximate and subject to change.
        </span>
      </v-tooltip>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import { StatsI } from '@/interfaces'
import { getFeatureFlag } from '@/plugins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NamexServices from '@/services/namex.services'

@Component({})
export default class Stats extends Vue {
  // Global getter
  @Getter getStats!: StatsI

  // Global action
  @Action setStats!: ActionBindingIF

  async created (): Promise<void> {
    if (
      getFeatureFlag('hardcoded_regular_wait_time') === 0 ||
      getFeatureFlag('hardcoded_priority_wait_time') === 0
    ) {
      const stats = await NamexServices.fetchStats()
      if (stats) this.setStats(stats)
    }
  }

  get autoApprovedCount (): string | number {
    return (this.getStats?.auto_approved_count ?? '-')
  }

  /** The regular wait time, in days. */
  get regularWaitTime (): string | number {
    const regularWaitTime = getFeatureFlag('hardcoded_regular_wait_time')
    if (regularWaitTime > 0) {
      return regularWaitTime
    } else {
      return (this.getStats?.regular_wait_time ?? '-')
    }
  }

  /** The priority wait time, in hours. */
  get priorityWaitTime (): string | number {
    const priorityWaitTime = getFeatureFlag('hardcoded_priority_wait_time')
    if (priorityWaitTime > 0) {
      return priorityWaitTime
    } else {
      return (this.getStats?.priority_wait_time ?? '-')
    }
  }
}
</script>

<style lang="scss" scoped>
.stats-content-inner-1 {
  height: fit-content;
  width: 68px;
  display: inline-block;
}

.stats-content-inner-2 {
  height: fit-content;
  white-space: nowrap;
  padding-left: 8px;
  font-size: 12px;
  line-height: 18px;
}

.stats-content-outer {
  width: fit-content;
  margin-left: 20px;
  background: url('~@/assets/images/stats-circle.png');
  background-repeat: no-repeat;
  display: flex;
  align-items: center;

  &:hover {
    cursor: default;
  }
}

.stats-unit {
  display: block;
  position: relative;
  top: -8px;
  font-size: 12px;
  font-weight: bold;
}

.stats-v-row {
  height: 68px;
}

.stats-value {
  display: block;
  margin: 0;
  padding: 0;
  font-size: 24px;
  font-weight: bold;
}

.wait-time-tooltip {
  text-align: left;
  width: 270px !important;
}

.new-submission-wait-time-tooltip {
  text-align: left;
  width: 270px !important;
}
</style>
