<template>
  <v-card>
    <header class="font-weight-bold px-3 py-3">
      <slot name="header">Invoice</slot>
    </header>

    <div v-show="fetchError">
      <v-alert color="error" icon="warning" outlined>{{fetchError}}</v-alert>
    </div>

    <ul class="fee-list" v-show="!fetchError && invoice">
      <!--<li class="container fee-list__item">
        <div class="fee-list__item-name">Account ID</div>
        <div class="fee-list__item-value">{{invoice.account_id}}</div>
      </li>-->
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Ref #</div>
        <div class="fee-list__item-value">{{invoice.reference_number}}</div>
      </li>
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Payment Date</div>
        <!--<div class="fee-list__item-value">{{invoice.payment_date}}</div>-->
        <div class="fee-list__item-value">{{new Date(invoice.created_on).toLocaleDateString("en-US")}}</div>
      </li>
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Amount</div>
        <div class="fee-list__item-value">{{invoice.paid}}</div>
      </li>
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Status</div>
        <div class="fee-list__item-value">{{invoice.status_code}}</div>
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
    account_id: null,
    created_by: null,
    created_on: null,
    id: null,
    line_items: null,
    links: [],
    paid: 0.00,
    payment_date: null,
    payment_id: null,
    reference_number: null,
    status_code: null
  } })
  protected invoice: any

  protected fetchError: string = ''
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

.filing_invoice-list {
  border-bottom: 1px solid $gray3;
}

.filing_invoice-list__item {
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

.filing_invoice-list__item + .filing_invoice-list__item {
  border-top: 1px solid $gray3;
}

.filing_invoice-total {
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

.container.fee-total,
.container.fee-list__item {
  justify-content: space-between;
}
</style>
