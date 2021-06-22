import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { AxiosRequestConfig } from 'axios'
import { ACCEPTED, CREATED, NO_CONTENT, OK } from 'http-status-codes'

import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'
import { PaymentStatus, StaffPaymentOptions } from '@/enums'
import { ActionMixin } from '@/mixins'
import * as paymentTypes from '@/modules/payment/store/types'
import { CreatePaymentParams, NameRequestPaymentResponse } from '@/modules/payment/models'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'
import { StaffPaymentIF } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import NamexServices from '@/services/namex.services'

@Component({})
export class PaymentMixin extends Mixins(ActionMixin) {
  // Global actions
  @Action setPayment!: ActionBindingIF
  @Action setPayments!: ActionBindingIF
  @Action setPaymentFees!: ActionBindingIF
  @Action setPaymentReceipt!: ActionBindingIF
  @Action setPaymentRequest!: ActionBindingIF
  @Action setSbcPayment!: ActionBindingIF

  // Global getter
  @Getter getCurrentJsDate!: Date
  @Getter getStaffPayment!: StaffPaymentIF

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
    const summaries = payments?.map(payment => {
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
      const response = await this.getPaymentFees({
        'corp_type': corpType,
        'filing_type_code': filingType,
        'jurisdiction': jurisdiction,
        'date': this.getCurrentJsDate.toISOString(), // "now" in UTC
        'priority': priorityRequest
      })
      await this.setPaymentFees(response)
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
    let headers = this.buildStaffPayment()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      headers['Content-Type'] = 'application/json'
    }
    if (accountInfo) {
      const parsedAccountInfo = JSON.parse(accountInfo)
      headers['Account-Id'] = parsedAccountInfo.id
    }
    req.headers = headers
    try {
      const paymentResponse = await this.createPaymentRequest(nrId, action, req)
      // set nr in session storage before redirecting to pay (this is how we find our way back afterwards)
      if (paymentResponse.nrNum?.includes('NR L')) {
        sessionStorage.setItem('BCREG-NRL', paymentResponse.nrNum)
        sessionStorage.setItem('BCREG-nrNum', null)
      } else if (paymentResponse.nrNum) {
        sessionStorage.setItem('BCREG-NRL', null)
        sessionStorage.setItem('BCREG-nrNum', paymentResponse.nrNum)
      }

      const { payment, sbcPayment = { receipts: [] } } = paymentResponse

      await this.setPayment(payment)
      // await paymentModule.setPaymentReceipt(sbcPayment.receipts[0]) // *** TODO: new code != old code ???
      await this.setPaymentRequest(req)

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

  /** Build Staff Payment data. **/
  buildStaffPayment () {
    // Populate Staff Payment according to payment option
    let headers = {}
    switch (this.getStaffPayment.option) {
      case StaffPaymentOptions.FAS:
        headers['routingSlipNumber'] = this.getStaffPayment.routingSlipNumber
        break

      case StaffPaymentOptions.BCOL:
        headers['bcolAccountNumber'] = this.getStaffPayment.bcolAccountNumber
        headers['datNumber'] = this.getStaffPayment.datNumber
        headers['folioNumber'] = this.getStaffPayment.folioNumber // this overrides original folio number
        break

      case StaffPaymentOptions.NO_FEE:
        headers['waiveFees'] = true
        break

      case StaffPaymentOptions.NONE: // should never happen
        break
    }
    return headers
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
    const url = `${paymentPortalUrl}${paymentToken}/${redirectUrl}`
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
      const response = await this.generateReceiptRequest(paymentId)
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
      const paymentResponse = await this.getNameRequestPayment(nrId, paymentId, headers)
      if (!paymentResponse) throw new Error('Got error from getNameRequestPayment()')

      const { payment, sbcPayment =
      { receipts: [], status_code: '' }, statusCode, completionDate } = paymentResponse

      await this.setPayment(payment)
      await this.setSbcPayment(sbcPayment)
      if (sbcPayment &&
        sbcPayment.receipts instanceof Array &&
        sbcPayment.receipts.length > 0) {
        const receipt = sbcPayment.receipts[0]
        await this.setPaymentReceipt(receipt)
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
      const paymentsResponse = await this.getNameRequestPayments(nrId, {})
      if (!paymentsResponse) throw new Error('Got error from getNameRequestPayments()')

      await this.setPayments(paymentsResponse)
      return true
    } catch (err) {
      // don't console.error - getNameRequestPayments() already did that
      await errorModule.setAppError(
        { id: 'fetch-nr-payments-error', error: 'Could not fetch NR payments' }
      )
      return false
    }
  }

  // TODO: move to NamexServices
  async createPaymentRequest (nrId, action, data): Promise<NameRequestPaymentResponse> {
    const url = `${NamexServices.namexUrl()}/payments/${nrId}/${action}`
    try {
      const response = await NamexServices.axios.post(url, data)
      if (response?.data && [OK, CREATED, ACCEPTED, NO_CONTENT].includes(response?.status)) {
        return response.data
      }
      throw new Error(`Invalid response = ${response}`)
    } catch (err) {
      console.error('createPaymentRequest() =', err) // eslint-disable-line no-console
      const msg = await this.handleApiError(err, 'Could not create payment request')
      // console.error('createPaymentRequest() =', msg) // eslint-disable-line no-console
      throw new Error(msg)
    }
  }

  // TODO: move to NamexServices
  async getNameRequestPayment (nrId, paymentId, params): Promise<NameRequestPaymentResponse> {
    const url = `${NamexServices.namexUrl()}/payments/${nrId}/payment/${paymentId}`
    try {
      const response = await NamexServices.axios.get(url, params)
      // TODO: check response status and data - make sure error handling is not changed
      return response.data
    } catch (err) {
      const msg = await this.handleApiError(err, 'Could not get name request payment')
      console.error('getNameRequestPayment() =', msg) // eslint-disable-line no-console
      throw new Error(msg)
    }
  }

  // TODO: move to NamexServices
  async getNameRequestPayments (nrId, params): Promise<NameRequestPaymentResponse[]> {
    const url = `${NamexServices.namexUrl()}/payments/${nrId}`
    try {
      const response = await NamexServices.axios.get(url, params)
      // TODO: check response status and data - make sure error handling is not changed
      return response.data
    } catch (err) {
      const msg = await this.handleApiError(err, 'Could not get name request payments')
      console.error('getNameRequestPayments() =', msg) // eslint-disable-line no-console
      throw new Error(msg)
    }
  }

  // TODO: move to NamexServices
  async getPaymentFees (params): Promise<any> {
    const url = `${NamexServices.namexUrl()}/payments/fees`
    try {
      // TODO: check response status and data - make sure error handling is not changed
      const response = await NamexServices.axios.post(url, params)
      return response.data
    } catch (err) {
      const msg = await this.handleApiError(err, 'Could not get payment fees')
      console.error('getPaymentFees() =', msg) // eslint-disable-line no-console
      throw new Error(msg)
    }
  }

  // TODO: move to NamexServices
  async generateReceiptRequest (paymentId): Promise<any> {
    const params = { responseType: 'arraybuffer' } as AxiosRequestConfig
    const url = `${NamexServices.namexUrl()}/payments/${paymentId}/receipt`
    try {
      const response = await NamexServices.axios.post(url, {}, params)
      // TODO: check response status and data - make sure error handling is not changed
      return response.data
    } catch (err) {
      const msg = await this.handleApiError(err, 'Could not generate payment receipt')
      console.error('generateReceiptRequest() =', msg) // eslint-disable-line no-console
      throw new Error(msg)
    }
  }
}
