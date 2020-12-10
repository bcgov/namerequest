<template>
  <v-expand-transition>
    <!-- do not display until payments are fetched -->
    <section class="payment-summary" v-if="summary">
      <v-row class="py-5" no-gutters>
        <div class="col1 align-self-center">{{receiptNumber}}</div>
        <div class="col2 align-self-center">{{receiptDate}}</div>
        <div class="col3 align-self-center">{{receiptDescription}}</div>
        <div class="col4 align-self-center">${{receiptAmount}}</div>
        <div class="col5 align-self-center">
          <v-btn class="download-receipt-btn float-right" :loading="loading"
            @click="downloadReceipt()">Download PDF</v-btn>
        </div>
      </v-row>
    </section>
  </v-expand-transition>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import PaymentMixin from '@/components/payment/payment-mixin'
import ReceiptMixin from '@/components/mixins/receipt-mixin'

@Component({})
export default class PaymentSummary extends Mixins(PaymentMixin, ReceiptMixin) {
  @Prop(Object)
  readonly summary: any

  /** Used to show loading state on button. */
  private loading = false

  private get receiptNumber (): string {
    return `Receipt No. ${this.summary?.receipt.receiptNumber}`
  }

  private get receiptDate (): string {
    return this.summary?.receipt.receiptDate
  }

  private get receiptDescription (): string {
    const lineItem = this.summary?.payment.sbcPayment.lineItems[0] // just look at first one
    return this.rcptDescToName(lineItem?.description)
  }

  private get receiptAmount (): string {
    return `${this.summary?.receipt.receiptAmount.toFixed(2)} CAD`
  }

  public async downloadReceipt () {
    const id = this.summary?.id
    this.loading = true
    await this.downloadReceiptPdf(id)
    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
@import "@/assets/scss/theme";

.col1 {
  flex: 0 0 23.75%;
  max-width: 23.75%;
  font-weight: bold;
}

.col2 {
  flex: 0 0 20%;
  max-width: 20%;
}

.col3 {
  flex: 0 0 18.75%;
  max-width: 18.75%;
}

.col4 {
  flex: 0 0 16.25%;
  max-width: 16.25%;
  text-align: right;
}

.col5 {
  flex: 0 0 21.25%;
  max-width: 21.25%;
}
</style>
