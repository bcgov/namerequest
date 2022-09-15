<template>
  <v-expand-transition>
    <!-- do not display until payments are fetched -->
    <section id="refund-summary" v-if="payments.length > 0">

      <header>Name Request Refund</header>

      <!-- iterate over line items -->
      <!-- NB: each line item can contain several fees -->
      <template v-for="item in lineItems">
        <ul class="fee-list" :key="item.id">
          <li class="fee-list__item text-body-1" v-if="item.filingFees > 0">
            <div class="fee-list__item-name">{{item.description}}</div>
            <div class="fee-list__item-value">${{item.filingFees.toFixed(2)}}</div>
          </li>
          <li class="fee-list__item text-body-1" v-if="item.priorityFees > 0">
            <div class="fee-list__item-name">Priority fee</div>
            <div class="fee-list__item-value">${{item.priorityFees.toFixed(2)}}</div>
          </li>
          <li class="fee-list__item text-body-1" v-if="item.serviceFees > 0">
            <div class="fee-list__item-name">Service fee</div>
            <div class="fee-list__item-value">${{item.serviceFees.toFixed(2)}}</div>
          </li>
        </ul>
      </template>

      <footer class="d-flex justify-space-between">
        <div>Total Refund Amount (CAD)</div>
        <div>${{total.toFixed(2)}}</div>
      </footer>

    </section>
  </v-expand-transition>
</template>

<script lang="ts">
import { Component, Prop, Mixins, Vue } from 'vue-property-decorator'

@Component({})
export default class RefundSummary extends Vue {
  @Prop({ default: () => [] })
  readonly payments: any[]

  /** The array of line items in all completed SBC payments. */
  private get lineItems (): any[] {
    const arrays = this.payments.map(p => (p.sbcPayment.statusCode === 'COMPLETED') ? p.sbcPayment.lineItems : [])
    const lineItems = [].concat(...arrays)
    return lineItems
  }

  /** The total of all the Filing, Priority and Service fees. */
  private get total (): number {
    const arrays = this.lineItems.map(li => [li.filingFees, li.priorityFees, li.serviceFees])
    const fees = [].concat(...arrays)
    const total = fees.reduce((t, n) => (t + n), 0)
    return total
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";

#refund-summary {
  width: 70%;
  margin-left: 15%;
  margin-right: 15%;
}

/* FUTURE: use app-wide H3 or similar */
header {
  font-size: large;
  font-weight: bold;
  color: $dk-text;
  letter-spacing: normal;
  border-bottom: solid 1px $gray3;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.fee-list {
  padding-left: 0 !important;
}

.fee-list:not(:first-of-type) {
  padding-top: 1.5rem;
}

.fee-list__item {
  display: flex;
  flex-flow: row nowrap;
  line-height: normal;
  justify-content: space-between;
}

.fee-list__item:not(:first-of-type) {
  padding-top: 0.25rem;
}

/* FUTURE: use app-wide H4 or similar */
footer {
  font-size: medium;
  font-weight: bold;
  color: $dk-text;
  letter-spacing: normal;
  border-top: solid 1px $gray3;
  padding-top: 10px;
  margin-top: 15px;
}
</style>
