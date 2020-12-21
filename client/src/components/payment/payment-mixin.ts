import { Component, Vue } from 'vue-property-decorator'
import * as paymentTypes from '@/modules/payment/store/types'
import * as paymentService from '@/modules/payment/services'
import paymentModule from '@/modules/payment'
import { NameRequestPaymentResponse, CreatePaymentParams } from '@/modules/payment/models'
import { PaymentApiError } from '@/modules/payment/services'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'

@Component
export default class PaymentMixin extends Vue {
  get sbcPayment () {
    return this.$store.getters[paymentTypes.GET_SBC_PAYMENT]
  }

  get sbcPaymentStatus () {
    return this.$store.getters[paymentTypes.GET_SBC_PAYMENT_STATUS]
  }

  get payment () {
    return this.$store.getters[paymentTypes.GET_PAYMENT]
  }

  get paymentId () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_ID]
  }

  get paymentToken () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_TOKEN]
  }

  get paymentStatus () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_STATUS]
  }

  get paymentDate () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DATE]
  }

  get paymentRequest () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_REQUEST]
  }

  get paymentDetails () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DETAILS]
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
    const summaries = payments.map(payment => {
      const { id, sbcPayment } = payment
      let receipt
      if (sbcPayment &&
        sbcPayment.receipts instanceof Array &&
        sbcPayment.receipts.length > 0) {
        receipt = sbcPayment.receipts[0]
      }

      return {
        id,
        payment,
        receipt
      }
    })
    return summaries
  }

  async fetchFees (paymentConfig): Promise<boolean> {
    const { corpType, filingType, jurisdiction, priorityRequest } = paymentConfig
    try {
      // NB: params uses snake_case
      const response = await paymentService.getPaymentFees({
        'corp_type': corpType,
        'filing_type_code': filingType,
        'jurisdiction': jurisdiction,
        'date': new Date().toISOString(),
        'priority': priorityRequest
      })
      await paymentModule.setPaymentFees(response)
      return true
    } catch (error) {
      console.error('fetchFees() =', error) // eslint-disable-line no-console
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-fees-error', error: error.message } as ErrorI)
      }
      return false
    }
  }

  async createPayment (params: CreatePaymentParams, onSuccess: (paymentResponse) => void): Promise<boolean> {
    const { nrId, filingType, priorityRequest, action } = params
    // Comment this out to use direct pay
    // const methodOfPayment = 'CC' // We may need to handle more than one type at some point?

    if (!nrId) {
      // eslint-disable-next-line no-console
      console.warn('NR ID is not present in params, cannot continue!')
      return false
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
      const paymentResponse = await paymentService.createPaymentRequest(nrId, action, req)
      const { payment, sbcPayment = { receipts: [] } } = paymentResponse

      await paymentModule.setPayment(payment)
      // await paymentModule.setPaymentReceipt(sbcPayment.receipts[0])
      await paymentModule.setPaymentRequest(req)

      if (onSuccess) {
        // Execute callback
        onSuccess(paymentResponse)
      }
      return true
    } catch (error) {
      console.error('createPayment() =', error) // eslint-disable-line no-console
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'payment-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'create-payment-error', error: error.message } as ErrorI)
      }
      return false
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
      console.error('fetchReceiptPdf() =', error) // eslint-disable-line no-console
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-error', error: error.message } as ErrorI)
      }
    }
  }

  async downloadReceipt () {
    const { paymentId } = this
    await this.downloadReceiptPdf(paymentId)
  }

  /**
   * Grab the receipt PDF and download / display it for the user...
   * @param paymentId
   */
  async downloadReceiptPdf (paymentId) {
    try {
      const response = await paymentService.generateReceiptRequest(paymentId)
      const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payment-receipt-${paymentId}.pdf`)
      document.body.appendChild(link)
      link.click()
    } catch (error) {
      console.error('downloadReceiptPdf() =', error) // eslint-disable-line no-console
      if (error instanceof PaymentApiError) {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-api-error', error: error.message } as ErrorI)
      } else {
        await errorModule.setAppError({ id: 'fetch-receipt-pdf-error', error: error.message } as ErrorI)
      }
    }
  }

  /**
   * Fetches the specified NR payment.
   * @param nrId the NR id
   * @param paymentId the payment id
   * @returns True if successful, otherwise False
   */
  async fetchNrPayment (nrId: number, paymentId: number): Promise<boolean> {
    try {
      const paymentResponse = await paymentService.getNameRequestPayment(nrId, paymentId, {})
      if (!paymentResponse) throw new Error('Got error from getNameRequestPayment()')

      const { payment, sbcPayment =
      { receipts: [], status_code: '' }, token, statusCode, completionDate } = paymentResponse

      await paymentModule.setPayment(payment)
      await paymentModule.setSbcPayment(sbcPayment)
      if (sbcPayment &&
        sbcPayment.receipts instanceof Array &&
        sbcPayment.receipts.length > 0) {
        const receipt = sbcPayment.receipts[0]
        await paymentModule.setPaymentReceipt(receipt)
      }
      return true
    } catch (error) {
      console.error('fetchNrPayment() =', error) // eslint-disable-line no-console
      await errorModule.setAppError(
        { id: 'fetch-nr-payment-error', error: 'Could not fetch payment' }
      )
      return false
    }
  }

  /**
   * Fetches all payments for the specified NR.
   * @param nrId the NR id
   * @returns True if successful, otherwise False
   */
  async fetchNrPayments (nrId: number): Promise<boolean> {
    try {
      const paymentsResponse = await paymentService.getNameRequestPayments(nrId, {})
      if (!paymentsResponse) throw new Error('Got error from getNameRequestPayments()')

      await paymentModule.setPayments(paymentsResponse)
      return true
    } catch (error) {
      console.error('fetchNrPayments() =', error) // eslint-disable-line no-console
      await errorModule.setAppError(
        { id: 'fetch-nr-payments-error', error: 'Could not fetch payments' }
      )
      return false
    }
  }
}
