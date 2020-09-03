<template>
  <v-container class="mt-1 mb-n3 py-0" fluid>
    <v-row class="float-right stats-v-row">
        <div class="stats-content-outer py-0">
          <div class="stats-content-inner-1 text-center">
            <div class="stats-value h3-lt">{{ autoApprovedCount }}</div>
            <div class="stats-unit">Names</div>
          </div>
          <div class="stats-content-inner-2">
            <u>Auto-Approved</u> Today.<br>
            No Wait Time
          </div>
        </div>
        <div class="stats-content-outer py-0">
          <div class="stats-content-inner-1 text-center">
            <div class="stats-value h3-lt">{{ priorityWaitTime }}</div>
            <div class="stats-unit">Hours</div>
          </div>
          <div class="stats-content-inner-2">
            Priority Request<br>
            Wait Time
          </div>
        </div>
        <div id="stats-content-outer-3" class="stats-content-outer py-0">
          <div class="stats-content-inner-1 text-center">
            <div class="stats-value h3-lt">{{ regularWaitTime }}</div>
            <div class="stats-unit">Days</div>
          </div>
          <div class="stats-content-inner-2">
            Standard Request<br>
            Wait Time
          </div>
        </div>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { StatsI } from '@/models'
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class Stats extends Vue {
  created () {
    newReqModule.getStats()
  }

  get stats (): StatsI {
    return newReqModule.stats
  }
  get autoApprovedCount () {
    if (this.stats && this.stats.auto_approved_count) {
      return this.stats.auto_approved_count
    }
    return 0
  }
  get regularWaitTime () {
    if (this.stats && this.stats.regular_wait_time) {
      return Math.ceil(this.stats.regular_wait_time / 3600 / 24)
    }
    return '-'
  }
  get priorityWaitTime () {
    if (this.stats && this.stats.priority_wait_time) {
      return Math.ceil(this.stats.priority_wait_time / 3600)
    }
    return '-'
  }
}

</script>

<style lang="sass" scoped>
.stats-content-inner-1
  height: fit-content
  width: 68px
  display: inline-block

.stats-content-inner-2
  height: fit-content
  white-space: nowrap
  padding-left: 8px
  font-size: 12px
  line-height: 18px

.stats-content-outer
  width: fit-content
  margin-left: 10px
  background: url('~@/assets/images/stats-circle.png')
  background-repeat: no-repeat
  display: flex
  align-items: center

.stats-unit
  display: block
  position: relative
  top: -4px
  font-size: 12px
  font-weight: 700

.stats-v-row
  height: 68px

.stats-value
  display: block
  margin: 0
  padding: 0
  font-size: 24px
  font-weight: 700

</style>
