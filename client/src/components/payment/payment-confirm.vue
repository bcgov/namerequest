<template>
  <v-card>
    <!--<header class="font-weight-bold px-3 py-3">
      <slot name="header">Payment Details</slot>
    </header>-->

    <div v-show="fetchError">
      <v-alert color="error" icon="warning" outlined>{{fetchError}}</v-alert>
    </div>

    <ul class="fee-list" v-show="!fetchError">
      <li class="container fee-list__item">
        <div class="fee-list__item-name">
          NR Number<sup>*</sup>
        </div>
        <div class="fee-list__item-value"><strong>{{nrNum}}</strong></div>
      </li>
      <li>
        <small style="font-weight: normal; font-size: 0.7rem">
          * Use this code to check the status of your application
        </small>
      </li>
    </ul>

    <request-details
      v-bind:applicant="applicant"
      v-bind:nameChoices="nameChoices"
      v-bind:name="name"
    />

    <ul class="fee-list" v-show="!fetchError">
      <li class="container fee-list__item" v-if="receipt">
        <div class="fee-list__item-name">Receipt #</div>
        <div class="fee-list__item-value">{{receipt.receiptNumber}}</div>
      </li>
      <li class="container fee-list__item" v-if="receipt">
        <div class="fee-list__item-name">Payment Date</div>
        <div class="fee-list__item-value">{{receipt.receiptDate}}</div>
      </li>
      <li class="container fee-list__item" v-if="receipt">
        <div class="fee-list__item-name">Amount</div>
        <div class="fee-list__item-value">${{receipt.receiptAmount.toFixed(2)}} CAD</div>
      </li>
      <li class="container fee-list__item" v-if="summary">
        <div class='fee-list__item-name'>Status</div>
        <div class='fee-list__item-value'>{{summary.statusCode}}</div>
      </li>
    </ul>
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import RequestDetails from '@/components/common/request-details.vue'
import { ApplicantI } from '@/models'

@Component({
  components: {
    RequestDetails
  }
})
export default class PaymentConfirm extends Vue {
  @Prop(String) nrNum: string
  @Prop(Object) summary: any
  @Prop(Object) receipt: any
  @Prop(Object) applicant: ApplicantI
  @Prop(Array) nameChoices: {
    type: any[]
    required: false
  }
  @Prop(String) name: string

  protected fetchError = ''
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";

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
