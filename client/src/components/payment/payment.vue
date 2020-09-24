<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Confirm Name Request</v-card-text>
      <v-card-text class="copy-normal">
        <request-details
          v-bind:applicant="applicant"
          v-bind:nameChoices="nameChoices"
        />
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
import RequestDetails from '@/components/common/request-details.vue'

import paymentModule from '@/modules/payment'
import { NameRequestPaymentResponse } from '@/modules/payment/models'
import newRequestModule, { NewRequestModule } from '@/store/new-request-module'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as corpTypes from '@/modules/payment/corp-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'

import {
  ApplicantI
} from '@/models'

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { PaymentApiError } from '@/modules/payment/services'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'

@Component({
  components: {
    RequestDetails,
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
    try {
      const corpType = 'NRO' // We may need to handle more than one type at some point?

      const response = await paymentService.getPaymentFees({
        'corp_type': corpType,
        'filing_type_code': this.filingType,
        'jurisdiction': jurisdictions.BC,
        'date': new Date().toISOString(),
        'priority': this.priorityRequest || false
      })
      await paymentModule.setPaymentFees(response)
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-fees-error', error: error.message } as ErrorI)
      }
    }
  }

  async createPayment () {
    // Grab the applicant info from state
    const methodOfPayment = 'CC' // We may need to handle more than one type at some point?

    const { filingType, priorityRequest, nrId } = this

    if (!nrId) {
      // eslint-disable-next-line no-console
      console.warn('NR ID is not present in NR, cannot continue!')
      return
    }

    // This is the minimum required to make a payment!
    // Any additional data supplied here, eg. supplying
    // a businessInfo object, will override values found
    // in the corresponding Name Request
    const req = {
      paymentInfo: {
        methodOfPayment: methodOfPayment
      },
      filingInfo: {
        filingTypes: [
          {
            filingTypeCode: filingType,
            priority: priorityRequest || false
          }
        ]
      }
    }

    try {
      const paymentResponse: NameRequestPaymentResponse = await paymentService.createPaymentRequest(nrId, req)
      const { payment, sbcPayment = { invoices: [] }, token, statusCode, completionDate } = paymentResponse

      await paymentModule.setPayment(payment)
      await paymentModule.setPaymentInvoice(sbcPayment.invoices[0])
      await paymentModule.setPaymentRequest(req)

      // Grab the new payment ID
      const { paymentId } = this

      // TODO: Remove this one, we don't want to set the payment to session once we're done!
      // TODO: Or... we could add a debug payments mode?
      sessionStorage.setItem('payment', `${JSON.stringify(payment)}`)
      // Store the payment ID to sessionStorage, that way we can start the user back where we left off
      sessionStorage.setItem('paymentInProgress', 'true')
      sessionStorage.setItem('paymentId', `${paymentId}`)
      sessionStorage.setItem('paymentToken', `${token}`)
      sessionStorage.setItem('nrId', `${nrId}`)

      // Redirect user to Service BC Pay Portal
      // Set the redirect URL to specify OUR payment ID so we can
      // grab the payment when we're directed back to our application
      const redirectUrl = encodeURIComponent(
        `${document.baseURI}/?paymentId=${paymentId}`
      )

      // eslint-disable-next-line no-console
      console.log(`Forwarding to SBC Payment Portal -> Payment redirect URL: ${redirectUrl}`)

      // TODO: We could make this string configurable too... not necessary at this time
      const paymentPortalUrl = `${this.$PAYMENT_PORTAL_URL}/${token}/${redirectUrl}`
      window.location.href = paymentPortalUrl
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'create-payment-error', error: error.message } as ErrorI)
      }
    }
  }

  get applicant (): Partial<ApplicantI> | undefined {
    const nameRequest: NewRequestModule = newRequestModule
    const applicantInfo: Partial<ApplicantI> = nameRequest.applicant || undefined
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

  /**
   * eg:
   * {
   *     name1: 'ACME Construction',
   *     name2: 'ACME Home Construction',
   *     name3: 'ACME Commercial Construction',
   *     designation1: 'Ltd.',
   *     designation2: 'Ltd.',
   *     designation3: 'Ltd.'
   * }
   */
  get nameChoices () {
    const nameRequest: NewRequestModule = newRequestModule
    const nameRequestChoices: {} = nameRequest.nameChoices || {}

    /** Test
     {
        name1: 'ACME Construction',
        name2: 'ACME Home Construction',
        name3: 'ACME Commercial Construction',
        designation1: 'Ltd.',
        designation2: 'Ltd.',
        designation3: 'Ltd.'
     }
     */
    const parseNameChoices = (nameChoices) => {
      return Object.keys(nameChoices)
        .reduce((names, key, idx) => {
          // Key will be either 'name' or 'designation'
          const nameIdx = key.match(/[\d]+$/)[0]
          const typeKey = key.substring(0, key.lastIndexOf(nameIdx))
          names[nameIdx] = names[nameIdx] || { name: undefined, designation: undefined }
          names[nameIdx][typeKey] = nameChoices[key]
          return names
        }, [])
        .map((choice) => {
          return (choice.name && choice.designation)
            ? `${choice.name} ${choice.designation}`
            : (choice.name && !choice.designation)
              ? `${choice.name}`
              : undefined
        })
        .filter((name) => !!name)
    }

    return parseNameChoices(nameRequestChoices)
  }

  // TODO: Where is this used?
  get entity_type_cd () {
    const nameRequest: NewRequestModule = newRequestModule
    const entity_type_cd: string = nameRequest.entity_type_cd
    return entity_type_cd
  }

  get nrData () {
    const nameRequest: NewRequestModule = newRequestModule
    const nrData: Partial<any> = nameRequest.nrData || {}
    return nrData
  }

  get nr () {
    const nameRequest: NewRequestModule = newRequestModule
    const nr: Partial<any> = nameRequest.nr || {}
    return nr
  }

  get nrId () {
    return newRequestModule.nrId
  }

  get priorityRequest () {
    const nameRequest: NewRequestModule = newRequestModule
    const priorityRequest: boolean = nameRequest.priorityRequest
    return priorityRequest
  }

  get filingType () {
    const { priorityRequest } = this
    let filingType = filingTypes.NM620
    if (priorityRequest) {
      // TODO: NM521 isn't working for calculating fees...
      filingType = filingTypes.NM620
    }

    return filingType
  }

  get payment () {
    return this.$store.getters[paymentTypes.GET_PAYMENT]
  }

  get paymentId () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_ID]
  }

  get paymentDetails () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DETAILS]
  }

  get paymentFees () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_FEES]
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
