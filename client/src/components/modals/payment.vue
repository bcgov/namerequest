<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Make a Payment</v-card-text>
      <v-card-text class="normal-copy">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
          <div>
            <ul style="list-style: none; padding-left: 0">
              <li>
                <h4>Requested Name</h4>
                {{name}}
              </li>
              <li>
                <h4>Nature of Business</h4>
                {{nrData.natureBusinessInfo}}
              </li>
              <li>
                <h4>Additional Business Info</h4>
                {{nrData.additionalInfo}}
              </li>
            </ul>
          </div>
          <div>
            <ul style="list-style: none; padding-left: 0">
              <li>
                <h4>Contact Info</h4>
                <ul style="list-style: none; padding-left: 0">
                  <li>{{`${applicant.firstName} ${applicant.middleName} ${applicant.lastName}`}}</li>
                  <li>{{`${applicant.addrLine1} ${applicant.addrLine2}`}}</li>
                  <li>{{`${applicant.city}, ${applicant.stateProvinceCd}`}}</li>
                  <li>{{`${applicant.countryTypeCd}, ${applicant.postalCd}`}}</li>
                  <li>{{applicant.emailAddress}}</li>
                  <li>{{applicant.phoneNumber}}</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        <fee-summary
          v-bind:filingData="[...paymentDetails]"
          v-bind:fees="[...paymentFees]"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createPayment" id="payment-pay-btn" class="primary" text>Accept</v-btn>
        <v-btn @click="hideModal" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import FeeSummary from '@/components/fee-summary.vue'

import paymentModule from '@/modules/payment'
import newRequestModule, { NewRequestModule } from '@/store/new-request-module'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as corpTypes from '@/modules/payment/corp-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'

import {
  PostApplicantI
} from "@/models"

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
    FeeSummary
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.PAYMENT_MODAL_IS_VISIBLE]
    }
  }
})
export default class PaymentModal extends Vue {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      this.fetchFees()
    }
  }

  async showModal () {
    await paymentModule.togglePaymentModal(true)
  }

  async hideModal () {
    await paymentModule.togglePaymentModal(false)
  }

  /**
   * This uses snake_case GET params
   */
  async fetchFees () {
    const corpType = 'NRO' // We may need to handle more than one type at some point?

    const response = await paymentService.getPaymentFees({
      'corp_type': corpType,
      'filing_type_code': filingTypes.NM606,
      'jurisdiction': jurisdictions.BC,
      'date': new Date().toISOString(),
      'priority': this.priorityRequest || false
    })
    await paymentModule.setPaymentFees(response.data)
  }

  async createPayment () {
    // Grab the applicant info from state
    const corpType = 'NRO' // We may need to handle more than one type at some point?
    const methodOfPayment = 'CC' // We may need to handle more than one type at some point?

    const { firstName, lastName, addrLine1, addrLine2, city, stateProvinceCd, countryTypeCd, postalCd } = this.applicant
    const { corpNum } = this.nrData

    const response = await paymentService.createPaymentRequest({
      paymentInfo: {
        methodOfPayment: methodOfPayment
      },
      businessInfo: {
        corpType: corpType,
        businessIdentifier: corpNum || 'TST12345678', // TODO: Confirm this!
        businessName: this.name,
        contactInfo: {
          // firstName: firstName,
          // lastName: lastName,
          addressLine1: `${addrLine1} ${addrLine2}`,
          city: city,
          province: stateProvinceCd,
          country: countryTypeCd,
          // postalCode: postalCd
          postalCode: postalCd
        }
      },
      // Use frontend data
      'filing_info': {
        'corp_type': 'string',
        'date': 'string',
        'filing_types': [
          {
            'filing_type_code': 'string',
            'priority': true,
            'filing_description': 'string'
          }
        ]
      }
    })

    const { invoices = [] } = response.data

    await paymentModule.setPayment(response.data)
    await paymentModule.setPaymentInvoice(invoices[0])

    this.hideModal()

    paymentModule.toggleReceiptModal(true)
  }

  async fetchInvoice () {
    const paymentId = null
    const response = await paymentService.getInvoiceRequest(paymentId, {})
    await paymentModule.setPaymentInvoice(response.data)
  }

  async fetchReceipt () {
    const paymentId = null
    const response = await paymentService.getReceiptRequest(paymentId, {})
    await paymentModule.setPaymentReceipt(response.data)
  }

  get applicant () {
    const nameRequest: NewRequestModule = newRequestModule
    const applicantInfo: Partial<PostApplicantI> = nameRequest.applicant || {}
    return applicantInfo
  }

  get isPersonsName () {
    const nameRequest: NewRequestModule = newRequestModule
    const isPersonsName: boolean = nameRequest.isPersonsName
    return isPersonsName
  }

  get name () {
    const nameRequest: NewRequestModule = newRequestModule
    const name: string = nameRequest.name
    return name
  }

  get entityType () {
    const nameRequest: NewRequestModule = newRequestModule
    const entityType: string = nameRequest.entityType
    return entityType
  }

  get nrData () {
    const nameRequest: NewRequestModule = newRequestModule
    const nrData: Partial<any> = nameRequest.nrData || {}
    return nrData
  }

  get priorityRequest () {
    const nameRequest: NewRequestModule = newRequestModule
    const priorityRequest: boolean = nameRequest.priorityRequest
    return priorityRequest
  }

  get paymentDetails () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DETAILS]
  }

  get paymentFees () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_FEES]
  }
}
</script>
