<template>
  <v-card v-if="summary" class="payment-summary">

    <header class="font-weight-bold pa-3">
      <span>
        <small>{{receipt.receiptDate}}</small>
      </span>
      <span style="float: right" v-if="receipt">
        <small><small>Receipt No.</small></small> {{receipt.receiptNumber}}
      </span>
    </header>

    <div v-show="fetchError">
      <v-alert color="error" icon="mdi-alert" outlined>{{fetchError}}</v-alert>
    </div>

    <ul class="fee-list" v-show="!fetchError">
      <li class="container fee-list__item" v-if="receipt">
        <div class="fee-list__item-name">Amount</div>
        <div class="fee-list__item-value">${{receipt.receiptAmount.toFixed(2)}} CAD</div>
      </li>
      <li class="container fee-list__item" v-if="summary">
        <div class="fee-list__item-name">Status</div>
        <div class="fee-list__item-value">{{summary.statusCode}}</div>
      </li>
      <li class="container fee-list__item">
        <div class="fee-list__item-name">Receipt</div>
        <div class="fee-list__item-value">
          <v-btn text small class="primary download-receipt-btn"
            :loading="loading" @click="downloadReceipt()">Download PDF</v-btn>
        </div>
      </li>
    </ul>

  </v-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import '../../plugins/vuetify'

import { NameRequestPaymentResponse } from '@/modules/payment/models'

import RequestDetails from '@/components/common/request-details.vue'
import PaymentMixin from '@/components/payment/payment-mixin'

@Component({
  components: {
    RequestDetails
  }
})
export default class PaymentSummary extends Mixins(PaymentMixin) {
  @Prop(Number)
  readonly id: number

  @Prop(Object)
  readonly summary: any

  @Prop(Object)
  readonly receipt: any

  protected fetchError = ''

  private loading = false

  async downloadReceipt () {
    const { id } = this
    this.loading = true
    await this.downloadReceiptPdf(id)
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";

header {
  color: #fff;
  background: $BCgovBlue5;
}

.container.fee-list__item {
  display: flex;
  flex-flow: row nowrap;
  line-height: 1.2rem;
  font-size: 0.875rem;
  justify-content: space-between;
  border-bottom: 1px dotted grey;
}

.fee-list__item-name {
  font-weight: bold;
}
</style>
