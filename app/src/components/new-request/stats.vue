<template>
  <v-container
    class="mt-1"
    fluid
  >
    <v-row
      class="stats-v-row"
      no-gutters
    >
      <v-col
        v-if="!isMobile"
        cols="4"
      />
      <v-col
        cols="6"
        md="4"
        lg="4"
        class="pr-4"
      >
        <v-tooltip
          bottom
          nudge-left="45"
          content-class="bottom-tooltip wait-time-tooltip"
          transition="fade-transition"
          :disabled="isMobile || !showPriorityTooltip"
        >
          <template #activator="{ on }">
            <div
              class="stats-content-outer py-0"
              :class="{'float-right': !isMobile}"
              v-on="on"
            >
              <div class="stats-content-inner-1 pa-1 text-center">
                <div class="stats-value h3-lt">
                  {{ priorityWaitTime }}
                </div>
                <div class="stats-unit">
                  Days
                </div>
              </div>
              <div class="stats-content-inner-2">
                <span :class="{'dotted-underline': !isMobile}">Priority Request</span><br>
                <span :class="{'dotted-underline': !isMobile}">Wait Time</span>
              </div>
            </div>
          </template>
          <span>
            If you need your name reviewed as quickly as possible, Priority requests
            are available for a fee ($100.00). Priority name requests are usually
            reviewed within 1 to 2 business days.
          </span>
        </v-tooltip>
      </v-col>
      <v-col
        cols="6"
        md="4"
        lg="4"
      >
        <v-tooltip
          bottom
          nudge-left="45"
          content-class="bottom-tooltip new-submission-wait-time-tooltip"
          transition="fade-transition"
          :disabled="isMobile || !showRegularTooltip"
        >
          <template #activator="{ on }">
            <div
              id="stats-content-outer-3"
              :class="[{'float-right': !isMobile}, 'stats-content-outer py-0']"
              v-on="on"
            >
              <div class="stats-content-inner-1 pa-1 text-center">
                <div class="stats-value h3-lt">
                  {{ regularWaitTime }}
                </div>
                <div class="stats-unit">
                  Days
                </div>
              </div>
              <div class="stats-content-inner-2">
                <span :class="{'dotted-underline': !isMobile}">New Submission</span><br>
                <span :class="{'dotted-underline': !isMobile}">Wait Time</span>
              </div>
            </div>
          </template>
          <span>
            This is the estimated review wait time when submitting a new name request
            <strong>today</strong>. Wait times are approximate and subject to change.
          </span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Action, Getter } from 'pinia-class'
import { useStore } from '@/store'
import { StatsI } from '@/interfaces'
import { GetFeatureFlag } from '@/plugins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NamexServices from '@/services/namex-services'

@Component({})
export default class Stats extends Vue {
  @Getter(useStore) getStats!: StatsI
  @Getter(useStore) isMobile!: boolean

  @Action(useStore) setStats!: ActionBindingIF

  /**
   * Normalize a wait time value to a finite number.
   *
   * Semantics:
   * - waitTime === 0: if from FF, the flag indicates "use API value" (caller should fall back to stats).
   * - waitTime < 0: if from FF, the wait time is explicitly disabled (caller should display '-').
   * - waitTime > 0: explicit positive wait time returned.
   *
   * The function returns 0 when the input is not a finite number; callers treat 0 as "disabled"
   */
  normalizeWaitTime (waitingTime: any): number {
    const num = Number(waitingTime)
    if (Number.isFinite(num)) {
      return num
    }
    return 0
  }

  async created (): Promise<void> {
    if (
      // FF returns 0 either it sets to 0 or the FF is disabled
      this.normalizeWaitTime(GetFeatureFlag('hardcoded_regular_wait_time')) === 0 ||
      this.normalizeWaitTime(GetFeatureFlag('hardcoded_priority_wait_time')) === 0
    ) {
      try {
       const stats = await NamexServices.fetchStats()
        console.info('[stats] fetched stats', stats)
        if (stats) this.setStats(stats)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
  }

  get autoApprovedCount (): string | number {
    return (this.getStats?.auto_approved_count ?? '-')
  }

  /** The regular wait time, in days. */
  get regularWaitTime (): string | number {
    const flagRaw = GetFeatureFlag('hardcoded_regular_wait_time')
    const flagVal = this.normalizeWaitTime(flagRaw)

    if (flagVal > 0) return flagVal
    if (flagVal < 0) return '-'

    // when flag is 0 or invalid, fall back to stats value
    const statVal = this.getStats?.regular_wait_time
    const statNum = this.normalizeWaitTime(statVal)
    if (statNum > 0) {
      return statNum
    }

    return '-'
  }

  /** The priority wait time, in days. */
  get priorityWaitTime (): string | number {
    const flagRaw = GetFeatureFlag('hardcoded_priority_wait_time')
    const flagVal = this.normalizeWaitTime(flagRaw)

    if (flagVal > 0) return flagVal
    if (flagVal < 0) return '-'

    const statVal = this.getStats?.priority_wait_time
    const statNum = this.normalizeWaitTime(statVal)
    if (statNum > 0) {
      return statNum
    }

    return '-'
  }

  get showRegularTooltip (): boolean {
    const val = Number(this.regularWaitTime)
    return Number.isFinite(val) && val > 0
  }

  get showPriorityTooltip (): boolean {
    const val = Number(this.priorityWaitTime)
    return Number.isFinite(val) && val > 0
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.stats-content-inner-1 {
  width: 68px;
  display: inline-block;
  min-height: 70px;
}

.stats-content-inner-2 {
  white-space: nowrap;
  padding-left: 8px;
  font-size: $px-12;
  line-height: 18px;
}

.stats-content-outer {
  width: fit-content;
  background: url('@/assets/images/stats-circle.png');
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
  font-size: $px-12;
  font-weight: bold;
}

.stats-value {
  display: block;
  margin: 0;
  padding: 0;
  font-size: $px-24;
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