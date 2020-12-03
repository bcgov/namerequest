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
      <v-tooltip bottom nudge-left="56" content-class="bottom-tooltip wait-time-tooltip" transition="fade-transition">
        <template v-slot:activator="{ on }">
          <div class="stats-content-outer py-0" v-on="on">
            <div class="stats-content-inner-1 text-center">
              <div class="stats-value h3-lt">{{ priorityWaitTime }}</div>
              <div class="stats-unit">Hours</div>
            </div>
            <div class="stats-content-inner-2">
              Priority Request<br>
              Wait Time
            </div>
          </div>
        </template>
        <p>During Business Hours</p>
      </v-tooltip>
      <v-tooltip bottom nudge-left="56" content-class="bottom-tooltip wait-time-tooltip" transition="fade-transition">
        <template v-slot:activator="{ on }">
          <div id="stats-content-outer-3" class="stats-content-outer py-0" v-on="on">
            <div class="stats-content-inner-1 text-center">
              <div class="stats-value h3-lt">{{ regularWaitTime }}</div>
              <div class="stats-unit">Days</div>
            </div>
            <div class="stats-content-inner-2">
              Standard Request<br>
              Wait Time
            </div>
          </div>
        </template>
        <p>Business Days</p>
      </v-tooltip>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { StatsI } from '@/models'
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class Stats extends Vue {
  created (): void {
    newReqModule.getStats()
  }

  get stats (): StatsI {
    return newReqModule.stats
  }
  get autoApprovedCount (): string | number {
    return (this.stats || {}).auto_approved_count || '0'
  }
  get regularWaitTime (): string | number {
    return (this.stats || {}).regular_wait_time || '-'
  }
  get priorityWaitTime (): string | number {
    return (this.stats || {}).priority_wait_time || '-'
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
  top: -8px
  font-size: 12px
  font-weight: bold

.stats-v-row
  height: 68px

.stats-value
  display: block
  margin: 0
  padding: 0
  font-size: 24px
  font-weight: bold

.wait-time-tooltip
  padding: 15px 0 0 0 !important
  text-align: center
  max-width: 160px

</style>
