<template>
  <div class="fee-summary">
    <v-row align="center" justify="center">
      <v-col cols="10">
        <div class="font-weight-bold px-3 pb-3 header">Payment Details</div>

        <v-alert v-if="fetchError" color="error" icon="mdi-alert" outlined class="my-0" v-html="fetchError" />

        <v-slide-y-transition group tag="ul" class="fee-list py-2" v-show="!fetchError">
          <template
            v-for="lineItem in fees"
            v-show="(totalFees > 0 && lineItem.filingFees) || (totalFees === 0)"
            >
            <li class="container fee-list__item"
              :key="lineItem.filingType"
              >
              <div class="fee-list__item-name">{{lineItem.filingType}}</div>
              <div class="fee-list__item-value" v-if="lineItem.filingFees > 0">${{lineItem.filingFees.toFixed(2)}}</div>
              <div class="fee-list__item-value" v-else>No Fee</div>
            </li>
            <li class="container fee-list__item"
              v-if="lineItem.priorityFees"
              :key="lineItem.filingTypeCode+'-priority'"
              >
              <div class="fee-list__item-name">Priority Request fee</div>
              <div class="fee-list__item-value">${{lineItem.priorityFees.toFixed(2)}}</div>
            </li>
            <li class="container fee-list__item"
              v-if="lineItem.serviceFees"
              :key="lineItem.filingTypeCode+'-transaction'"
              >
              <div class="fee-list__item-name">Service fee</div>
              <div class="fee-list__item-value">${{lineItem.serviceFees.toFixed(2)}}</div>
            </li>
          </template>
        </v-slide-y-transition>

        <!--<div class="container fee-total" v-show="!fetchError">
          <div class="fee-total__name">Fees</div>
          <div class="fee-total__value">
            <v-slide-y-reverse-transition name="slide" mode="out-in">
              <div>${{totalFees.toFixed(2)}}</div>
            </v-slide-y-reverse-transition>
          </div>
        </div>

        <div class="container fee-total tax-total" v-show="!fetchError">
          <div class="fee-total__name">Tax</div>
          <div class="fee-total__value">
            <v-slide-y-reverse-transition name="slide" mode="out-in">
              <div>${{totalTax.toFixed(2)}}</div>
            </v-slide-y-reverse-transition>
          </div>
        </div> -->

        <div class="container fee-total payment-total pt-5" v-show="!fetchError">
          <div class="fee-total__name">Total Amount (CAD)</div>
          <!--<div class="fee-total__currency">CAD</div>-->
          <div class="fee-total__value">
            <v-slide-y-reverse-transition name="slide" mode="out-in">
              <div><b>${{total.toFixed(2)}}</b></div>
            </v-slide-y-reverse-transition>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { FilingData } from 'sbc-common-components/src/models'

@Component({})
export default class FeeSummary extends Vue {
  @Prop({ default: () => [] })
  readonly filingData!: FilingData[]

  @Prop({ default: () => [] })
  readonly fees: any[]

  protected fetchError = ''

  protected get totalFees (): number {
    return this.fees instanceof Array ? this.fees.reduce((feeTotal: number, item: any) => {
      return feeTotal + item.filingFees + item.futureEffectiveFees + item.priorityFees + item.serviceFees
    }, 0) : 0
  }

  protected get totalTax (): number {
    return this.fees instanceof Array ? this.fees.reduce((taxTotal: number, item: any) => {
      const { gst = 0.00, pst = 0.00 } = item.tax
      return taxTotal + gst + pst
    }, 0) : 0
  }

  protected get total (): number {
    return this.fees instanceof Array ? this.fees.reduce((feeTotal: number, item: any) => {
      return feeTotal + item.total
    }, 0) : 0
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";
.fee-summary {
  background-color: $gray1;
}

.container {
  display: flex;
  flex-flow: row nowrap;
  line-height: 0;
  font-size: 1rem;
}
.fee-list {
  padding-left: 0 !important;
  border-bottom: 1px solid $gray4;
}

.filing_fees-list {
  border-bottom: 1px solid $gray3;
}

.filing_fees-list__item {
  &-name, &-value {
    font-weight: bold;
  }

  &-name {
    flex: 1 1 auto;
    margin-right: 2rem;
  }

  &-value {
    flex: 0 0 auto;
    text-align: right;
  }
}

.filing_fees-list__item + .filing_fees-list__item {
  border-top: 1px solid $gray3;
}

.filing_fees-total {
  align-items: center;
  letter-spacing: -0.01rem;
  line-height: auto;

  &__name {
    flex: 1 1 auto;
    margin-right: auto;
    font-weight: bold;
  }

  &__currency {
    margin-right: 0.5rem;
    color: $gray5;
    font-weight: normal;
  }

  &__value {
    font-size: 1.65rem;
    font-weight: bold700;
  }
}

.container.payment-total {
  font-weight: bold;
  color: $dk-text;
}

.container.fee-total,
.container.fee-list__item {
  justify-content: space-between;
}

.header {
  font-size: 1.125rem;
  color: $dk-text;
  border-bottom: 1px solid $gray4;
}
</style>
