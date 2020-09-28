<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Upgrade Request to Priority</v-card-text>
      <v-card-text class="copy-normal">
        <fee-summary
          v-bind:filingData="[...paymentDetails]"
          v-bind:fees="[...paymentFees]"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="confirmPayment" id="payment-pay-btn" class="primary" text>Accept</v-btn>
        <v-btn @click="hideModal" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'

import FeeSummary from '@/components/payment/fee-summary.vue'
import RequestDetails from '@/components/common/request-details.vue'

import paymentModule from '@/modules/payment'

import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'

import PaymentMixin from '@/components/payment/payment-mixin'
import NameRequestMixin from '@/components/mixins/name-request-mixin'

@Component({
  components: {
    RequestDetails,
    FeeSummary
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.UPGRADE_MODAL_IS_VISIBLE]
    }
  }
})
export default class UpgradeModal extends Mixins(NameRequestMixin, PaymentMixin) {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      const paymentConfig = {
        filingType: filingTypes.NM606,
        jurisdiction: jurisdictions.BC,
        priorityRequest: this.priorityRequest || false
      }

      this.fetchFees(paymentConfig)
    }
  }

  async showModal () {
    await paymentModule.toggleUpgradeModal(true)
  }

  async hideModal () {
    await paymentModule.toggleUpgradeModal(false)
  }

  async confirmPayment () {
    const { nrId, priorityRequest } = this
    this.createPayment(nrId, filingTypes.NM606, priorityRequest)
  }
}
</script>

<style lang="scss">
  .choice-indicator {
    background-color: #002e5e;
    color: white;
    border-radius: 100%;
    width: 1.75rem;
    height: 1.75rem;
    margin-right: 0.5rem;
    margin-bottom: 5px;
    box-sizing: border-box;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
</style>
