import { Component, Vue } from 'vue-property-decorator'
import * as paymentTypes from '@/modules/payment/store/types'
import * as paymentService from '@/modules/payment/services'
import paymentModule from '@/modules/payment'
import { CreatePaymentParams } from '@/modules/payment/models'
import { PaymentStatus } from '@/enums'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

@Component
export default class extends Vue {
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

  get paymentStatus (): PaymentStatus {
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
    } catch (err) {
      // don't console.error - getPaymentFees() already did that
      await errorModule.setAppError(
        { id: 'fetch-fees-error', error: 'Could not fetch fees' } as ErrorI
      )
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
      },
      headers: {}
    }
    const token = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
    const accountInfo = sessionStorage.getItem(SessionStorageKeys.CurrentAccount)
    let headers = {}
    if (token && accountInfo) {
      const parsedAccountInfo = JSON.parse(accountInfo)
      headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Account-Id': parsedAccountInfo.id
      }
    }
    req.headers = headers
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
    } catch (err) {
      // don't console.error - createPaymentRequest() already did that
      await errorModule.setAppError(
        { id: 'create-payment-error', error: 'Could not create payment' } as ErrorI
      )
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
    const paymentPortalUrl = sessionStorage.getItem('PAYMENT_PORTAL_URL')
    const url = `${paymentPortalUrl}/${paymentToken}/${redirectUrl}`
    // eslint-disable-next-line no-console
    // console.log(`Forwarding to SBC Payment Portal -> Payment redirect URL: ${redirectUrl}`)
    window.location.href = url
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
    } catch (err) {
      // don't console.error - generateReceiptRequest() already did that
      await errorModule.setAppError(
        { id: 'download-receipt-pdf-error', error: 'Could not download receipt PDF' } as ErrorI
      )
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
      const token = sessionStorage.getItem(SessionStorageKeys.KeyCloakToken)
      const accountInfo = sessionStorage.getItem(SessionStorageKeys.CurrentAccount)
      let headers = {}
      if (token && accountInfo) {
        const parsedAccountInfo = JSON.parse(accountInfo)
        headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Account-Id': parsedAccountInfo.id
        }
      }
      const paymentResponse = await paymentService.getNameRequestPayment(nrId, paymentId, headers)
      if (!paymentResponse) throw new Error('Got error from getNameRequestPayment()')

      const { payment, sbcPayment =
      { receipts: [], status_code: '' }, statusCode, completionDate } = paymentResponse

      await paymentModule.setPayment(payment)
      await paymentModule.setSbcPayment(sbcPayment)
      if (sbcPayment &&
        sbcPayment.receipts instanceof Array &&
        sbcPayment.receipts.length > 0) {
        const receipt = sbcPayment.receipts[0]
        await paymentModule.setPaymentReceipt(receipt)
      }
      return true
    } catch (err) {
      // don't console.error - getNameRequestPayment() already did that
      await errorModule.setAppError(
        { id: 'fetch-nr-payment-error', error: 'Could not fetch NR payment' }
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
    } catch (err) {
      // don't console.error - getNameRequestPayments() already did that
      await errorModule.setAppError(
        { id: 'fetch-nr-payments-error', error: 'Could not fetch NR payments' }
      )
      return false
    }
  }
}
