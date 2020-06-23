<template>
  <v-card>
    <header class="font-weight-bold px-3 py-3">
      <slot name="header">Fee Summary</slot>
    </header>

    <div v-show="fetchError">
      <v-alert color="error" icon="warning" outlined>{{fetchError}}</v-alert>
    </div>

    <v-slide-y-transition group tag="ul" class="fee-list" v-show="!fetchError">
      <template
        v-show="(totalFilingFees > 0 && lineItem.filing_fees) || (totalFilingFees == 0)"
        v-for="lineItem in fees"
        >
        <li class="container fee-list__item"
          :key="lineItem.filing_type"
          >
          <div class="fee-list__item-name">{{lineItem.filing_type}}</div>
          <div class="fee-list__item-value" v-if="lineItem.filing_fees > 0">${{lineItem.filing_fees.toFixed(2)}}</div>
          <div class="fee-list__item-value" v-else>No Fee</div>
        </li>
        <li class="container fee-list__item"
          v-if="lineItem.priority_fees"
          :key="lineItem.filing_type_code+'-priority'"
          >
          <div class="fee-list__item-name pl-3">Priority Fee</div>
          <div class="fee-list__item-value">${{lineItem.priority_fees.toFixed(2)}}</div>
        </li>
        <li class="container fee-list__item"
          v-if="lineItem.service_fees"
          :key="lineItem.filing_type_code+'-transaction'"
          >
          <div class="fee-list__item-name pl-3">Service Fee</div>
          <div class="fee-list__item-value">${{lineItem.service_fees.toFixed(2)}}</div>
        </li>
      </template>
    </v-slide-y-transition>

    <div class="container fee-total" v-show="!fetchError">
      <div class="fee-total__name">Total Fees</div>
      <!--<div class="fee-total__currency">CAD</div>-->
      <div class="fee-total__value">
        <v-slide-y-reverse-transition name="slide" mode="out-in">
          <div>${{totalFilingFees.toFixed(2)}} CAD</div>
        </v-slide-y-reverse-transition>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import '../plugins/vuetify'
import { Fee, FilingData } from 'sbc-common-components/src/models'

@Component({})
export default class FeeSummary extends Vue {
  /* This prop is an array of filing data. See model for details. */
  @Prop({ default: [] })
  protected filingData!: Array<FilingData>

  @Prop({ default: '' })
  protected payURL!: string

  /* class properties */
  @Prop({ default: [] })
  protected fees: any[] = []

  protected fetchError: string = ''

  /* lifecycle event */
  protected mounted (): void {
    // console.log('%c FeeModule-Data Received on Mount as %s %s', 'color: blue; font-size: 12px',
    //   JSON.stringify(this.filingData), this.payURL)

    /* FeeServices.getFee(this.filingData, this.payURL)
      .then(data => {
        this.fetchError = ''
        this.filing_fees = data
        this.emitTotalFee(this.totalFilingFees)
      })
      .catch((error: any) => {
        this.fetchError = 'Error fetching fees' + error
      }) */
  }

  /* getter */
  protected get totalFilingFees (): number {
    return this.fees.reduce((acc: number, item: any) => acc + item.filing_fees, 0)
  }

  protected get totalTax (): number {
    return this.fees.reduce((acc: number, item: any) => acc + item.filing_fees, 0)
  }

  /* watcher */
  @Watch('filingData')
  protected onFilingDataChanged (val: string, oldVal: string): void {
    // console.log('%c FeeModule-Watch Activated as %s', 'color: blue; font-size: 12px',
    //   JSON.stringify(this.filingData))

    /* FeeServices.getFee(this.filingData, this.payURL).then((data: any) => {
      this.fetchError = ''
      this.filing_fees = data
      this.emitTotalFee(this.totalFilingFees)
    }).catch((error: any) => {
      this.fetchError = 'Error fetching fees' + error
    }) */
  }

  /* emitter */
  @Emit('total-fee')
  protected emitTotalFee (val: number): void {}
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/theme.scss";

header {
  color: #fff;
  background: $BCgovBlue5;
}

.container {
  display: flex;
  flex-flow: row nowrap;
  line-height: 1.2rem;
  font-size: 0.875rem;
}

.filing_fees-list {
  border-bottom: 1px solid $gray3;
}

.filing_fees-list__item {
  &-name, &-value {
    font-weight: 700;
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
    font-weight: 700;
  }

  &__currency {
    margin-right: 0.5rem;
    color: $gray5;
    font-weight: 500;
  }

  &__value {
    font-size: 1.65rem;
    font-weight: 700;
  }
}

.container.fee-total {
  font-weight: bold;
}

.fee-list__item-name {
  font-weight: bold;
}

.container.fee-total,
.container.fee-list__item {
  justify-content: space-between;
}

.container.fee-list__item {
  border-bottom: 1px dotted grey;
}
</style>
