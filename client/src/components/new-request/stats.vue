<template>
  <v-container class="mt-1 mb-n3 py-0" fluid>
    <v-row class="float-right stats-v-row">
        <div class="stats-content-outer py-0">
          <div class="stats-content-inner-1 text-center">
            <div class="stats-value h3-lt">{{ auto }}</div>
            <div class="stats-unit">NAMES</div>
          </div>
          <div class="stats-content-inner-2">
            <u>Auto-Approved</u> Today<br>
            No Wait Time
          </div>
        </div>
        <div class="stats-content-outer py-0">
          <div class="stats-content-inner-1 text-center">
            <div class="stats-value h3-lt">{{ priority.value }}</div>
            <div class="stats-unit">{{ priority.unit}}</div>
          </div>
          <div class="stats-content-inner-2">
            Priority Request<br>
            Wait Time
          </div>
        </div>
        <div id="stats-content-outer-3" class="stats-content-outer py-0">
          <div class="stats-content-inner-1 text-center">
            <div class="stats-value h3-lt">{{ standard.value }}</div>
            <div class="stats-unit">{{ standard.unit }}</div>
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
import { Vue, Component } from 'vue-property-decorator'

@Component({})
export default class Stats extends Vue {
  get auto () {
    if (this.stats && this.stats.auto) {
      return this.stats.auto
    }
    return '—'
  }
  get priority () {
    if (this.stats && this.stats.priority) {
      return {
        value: this.stats.priority.value,
        unit: this.stats.priority.unit.toUpperCase()
      }
    }
    return {
      value: '—',
      unit: 'DAYS'
    }
  }
  get stats () {
    return newReqModule.stats
  }
  get standard () {
    if (this.stats && this.stats.standard) {
      return {
        value: this.stats.standard.value,
        unit: this.stats.standard.unit.toUpperCase()
      }
    }
    return {
      value: '—',
      unit: 'DAYS'
    }
  }

  mounted () {
    newReqModule.getStats()
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
