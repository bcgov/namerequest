import Vue from 'vue'
import { Component } from 'vue-property-decorator'

import * as jurisdictions from '@/modules/payment/jurisdictions'
import * as paymentTypes from '@/modules/payment/store/types'
import * as paymentService from '@/modules/payment/services'
import paymentModule from '@/modules/payment'
import { NameRequestPaymentResponse, CreatePaymentParams } from '@/modules/payment/models'
import { PaymentApiError } from '@/modules/payment/services'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'
import newRequestModule from "@/store/new-request-module"

@Component
export default class PaymentMixin extends Vue {
  get payment () {
    return this.$store.getters[paymentTypes.GET_PAYMENT]
  }

  get paymentId () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_ID]
  }

  get paymentToken () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_TOKEN]
  }

  get paymentRequest () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_REQUEST]
  }

  get paymentDetails () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DETAILS]
  }

  get paymentInvoice () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_INVOICE]
  }

  get paymentReceipt () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_RECEIPT]
  }

  get paymentFees () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_FEES]
  }

  get payments () {
    return this.$store.getters[paymentTypes.GET_PAYMENTS]
  }

  get paymentSummaries () {
    const payments = this.$store.getters[paymentTypes.GET_PAYMENTS]
    const summaries = payments.map(payment => ({
      id: payment.id,
      payment: payment,
      // TODO: Just need to get this thing working, fix this later
      invoice: payment.sbcPayment.invoices[0]
    }))
    return summaries
  }

  /**
   * This uses snake_case GET params
   */
  async fetchFees (paymentConfig) {
    const { corpType, filingType, jurisdiction, priorityRequest } = paymentConfig
    try {
      const response = await paymentService.getPaymentFees({
        'corp_type': corpType,
        'filing_type_code': filingType,
        'jurisdiction': jurisdiction,
        'date': new Date().toISOString(),
        'priority': priorityRequest
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

  async createPayment (params: CreatePaymentParams, onSuccess: (paymentResponse) => void) {
    const { nrId, filingType, priorityRequest, action } = params
    // Comment this out to use direct pay
    // const methodOfPayment = 'CC' // We may need to handle more than one type at some point?

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
      // Comment this out to use direct pay
      /* paymentInfo: {
        methodOfPayment: methodOfPayment
      }, */
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
      const paymentResponse: NameRequestPaymentResponse = await paymentService.createPaymentRequest(nrId, action, req)
      const { payment, sbcPayment = { invoices: [] } } = paymentResponse

      await paymentModule.setPayment(payment)
      await paymentModule.setPaymentInvoice(sbcPayment.invoices[0])
      await paymentModule.setPaymentRequest(req)

      if (onSuccess) {
        // Execute callback
        onSuccess(paymentResponse)
      }
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'create-payment-error', error: error.message } as ErrorI)
      }
    }
  }

  /**
   * Redirect user to Service BC Pay Portal.
   * Set the redirect URL to specify OUR payment ID so we can
   * grab the payment when we're directed back to our application!
   * @param paymentId
   * @param paymentToken
   * @param redirectUrl
   */
  redirectToPaymentPortal (paymentId, paymentToken, redirectUrl) {
    // TODO: We could make this string configurable too... not necessary at this time
    const paymentPortalUrl = `${this.$PAYMENT_PORTAL_URL}/${paymentToken}/${redirectUrl}`
    // eslint-disable-next-line no-console
    console.log(`Forwarding to SBC Payment Portal -> Payment redirect URL: ${redirectUrl}`)
    window.location.href = paymentPortalUrl
  }

  async downloadReceipt () {
    const { paymentId } = this
    await this.fetchReceiptPdf(paymentId)
  }

  /**
   * Grab the receipt PDF and download / display it for the user...
   * @param paymentId
   */
  async fetchReceiptPdf (paymentId) {
    try {
      const response = await paymentService.getReceiptRequest(paymentId)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payment-receipt-${paymentId}.pdf`)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-error', error: error.message } as ErrorI)
      }
    }
  }

  async fetchNr (nrId) {
    const existingNr = await newRequestModule.getNameRequest(nrId)
    await newRequestModule.loadExistingNameRequest(existingNr)
  }

  async fetchNrPayment (nrId, paymentId) {
    try {
      const paymentResponse: NameRequestPaymentResponse = await paymentService.getNameRequestPayment(nrId, paymentId, {})
      const { payment, sbcPayment = { invoices: [] }, token, statusCode, completionDate } = paymentResponse

      await paymentModule.setPayment(payment)
      await paymentModule.setPaymentInvoice(sbcPayment.invoices[0])
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-nr-payment-error', error: error.message } as ErrorI)
      }
    }
  }

  async fetchNrPayments (nrId) {
    try {
      const paymentsResponse: NameRequestPaymentResponse[] = await paymentService.getNameRequestPayments(nrId, {})
      await paymentModule.setPayments(paymentsResponse)
    } catch (error) {
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-nr-payments-error', error: error.message } as ErrorI)
      }
    }
  }
}
