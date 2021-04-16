<template>
  <div class="fee-summary">
    <v-row no-gutters align="center" justify="center">
      <v-col cols="10">
        <v-row no-gutters class="pt-8 pb-4 header">
          <div class="font-weight-bold">Payment Details</div>
        </v-row>
        <v-row no-gutters class="my-0">
          <v-alert v-if="fetchError" color="error" icon="mdi-alert" outlined class="my-0" v-html="fetchError" />
        </v-row>
        <v-row no-gutters class="fee-list py-4">
          <v-col v-show="!fetchError">
            <v-row v-for="lineItem, index in fees"
                    :key="index"
                    no-gutters
                    v-show="(totalFees > 0 && lineItem.filingFees) || (totalFees === 0)">
              <v-col>
                <v-row no-gutters>
                  <v-col cols="8">
                    <v-row no-gutters justify="start">
                      <div>{{lineItem.filingType}}</div>
                    </v-row>
                  </v-col>
                  <v-col cols="4">
                    <v-row no-gutters justify="end">
                      <div v-if="lineItem.filingFees > 0">${{lineItem.filingFees.toFixed(2)}}</div>
                      <div v-else>No Fee</div>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row v-if="lineItem.priorityFees" no-gutters>
                  <v-col cols="8">
                    <v-row no-gutters justify="start">
                      <div>Priority Request fee</div>
                    </v-row>
                  </v-col>
                  <v-col cols="4">
                    <v-row no-gutters justify="end">
                      <div>${{lineItem.priorityFees.toFixed(2)}}</div>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row v-if="lineItem.serviceFees" no-gutters>
                  <v-col cols="8">
                    <v-row no-gutters justify="start">
                      <div>Service fee</div>
                    </v-row>
                  </v-col>
                  <v-col cols="4">
                    <v-row no-gutters justify="end">
                      <div>${{lineItem.serviceFees.toFixed(2)}}</div>
                    </v-row>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

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
        <v-row no-gutters class="pt-4 pb-8">
          <v-col cols="8">
            <v-row no-gutters justify="start">
              <div class="payment-total" v-show="!fetchError">
                Total Amount (CAD)
              </div>
            </v-row>
          </v-col>
          <v-col cols="4">
            <v-row no-gutters justify="end">
              <div class="payment-total">
                <v-slide-y-reverse-transition name="slide" mode="out-in">
                  <div><b>${{total.toFixed(2)}}</b></div>
                </v-slide-y-reverse-transition>
              </div>
            </v-row>
          </v-col>
        </v-row>
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

.fee-list {
  padding-left: 0 !important;
  border-bottom: 1px solid $gray4;
}

.payment-total {
  font-weight: bold;
  color: $dk-text;
}

.header {
  font-size: 1.125rem;
  color: $dk-text;
  border-bottom: 1px solid $gray4;
}
</style>
