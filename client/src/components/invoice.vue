<template>
  <v-card>
    <header class="font-weight-bold px-3 py-3">
      <slot name="header">Invoice Details</slot>
    </header>

    <div v-show="fetchError">
      <v-alert color="error" icon="warning" outlined>{{fetchError}}</v-alert>
    </div>

    <ul class="fee-list" v-show="!fetchError && receipt">
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Ref #</div>
        <div class="fee-list__item-value">{{receipt.receiptNumber}}</div>
      </li>
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Payment Date</div>
        <div class="fee-list__item-value">{{new Date(receipt.receiptDate).toLocaleDateString("en-US")}}</div>
      </li>
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Amount</div>
        <div class="fee-list__item-value">${{receipt.receiptAmount.toFixed(2)}} CAD</div>
      </li>
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Status</div>
        <div class="fee-list__item-value">{{summary.statusCode}}</div>
      </li>
    </ul>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import '../plugins/vuetify'

@Component({})
export default class Invoice extends Vue {
  /* class properties */
  @Prop({ default: {
    reference_number: null,
    created_on: null,
    created_name: '',
    updated_on: null,
    updated_name: '',
    paid: 0.00,
    refund: null,
    service_fees: 0.00,
    total: 0.00,
    // The payment reference
    references: [
      {
        id: '',
        receipt_number: '',
        reference_number: '',
        status_code: ''
      }
    ],
    status_code: ''
  } })
  protected receipt: any

  protected fetchError: string = ''
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme.scss";

header {
  color: white;
  background: $BCgovBlue5;
}

.container {
  display: flex;
  flex-flow: row nowrap;
  line-height: 1.2rem;
  font-size: 0.875rem;
}

.filing_receipt-list {
  border-bottom: 1px solid $gray3;
}

.filing_receipt-list__item {
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

.filing_receipt-list__item + .filing_receipt-list__item {
  border-top: 1px solid $gray3;
}

.filing_receipt-total {
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
    font-weight: bold;
  }
}

.container.fee-total {
  font-weight: bold;
}

.fee-list__item-name {
  font-weight: bold;
}

.container.fee-list__item {
  justify-content: space-between;
}

.container.fee-list__item {
  border-bottom: 1px dotted grey;
}
</style>
