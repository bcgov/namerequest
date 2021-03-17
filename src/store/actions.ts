import querystring from 'qs'
import axios, { AxiosError } from 'axios'
import errorModule from '@/modules/error'
import paymentModule from '@/modules/payment'
import { ErrorI } from '@/modules/error/store/actions'
import {
  ConversionTypesI,
  ExistingRequestSearchI,
  LocationT, NameRequestI,
  NewRequestNameSearchI,
  SelectOptionsI, SubmissionTypeT
} from '@/interfaces'
import { NrAction, NrState, RollbackActions } from '@/enums'
import { NameRequestPayment } from '@/modules/payment/models'
import { BAD_REQUEST, NOT_FOUND, OK, SERVICE_UNAVAILABLE } from 'http-status-codes'
import { removeExcessSpaces, sanitizeName } from '@/plugins/utilities'
import { getFeatureFlag, sleep } from '@/plugins'

// List Data
// *** TODO: replace with `this.$requestActions`
import { RequestActions } from '@/list-data'

// Interfaces & Enums
import { ActionIF } from '@/interfaces/store-interfaces'
import get = Reflect.get;

const ANALYSIS_TIMEOUT_MS = 3 * 60 * 1000 // 3 minutes
const qs: any = querystring
let source: any

// TODO: Not a real Action
function isAxiosError (err: AxiosError | Error): boolean {
  return (err as AxiosError).isAxiosError !== undefined
}

// TODO: Not a real Action
async function handleApiError (err: any, defaultMessage = ''): Promise<string> {
  if (isAxiosError(err)) {
    let message = ''
    const responseData = err?.response?.data
    const hasResponseData = !!responseData

    if (hasResponseData && responseData instanceof Blob) {
      // Handle any cases where the API error response is a Blob (eg, request for PDF receipt fails).
      const errorText = await responseData.text()
      const errorJson = JSON.parse(errorText)
      if (errorJson?.message) {
        message = `${err.toString()} [ ${errorJson.message} ]`
      }
    } else if (hasResponseData && responseData instanceof String) {
      // Handle any cases where the API error response is a String.
      message = `${err.toString()} [ ${responseData.toString()} ]`
    } else if (hasResponseData && responseData.message) {
      // Handle any cases where the API error response in an object (eg, { message: 'Ipsum lorem dolor' }).
      message += responseData.message
      message = `${err.toString()} [ ${responseData.message} ]`
    } else if (defaultMessage) {
      // Handle any other cases.
      message = `${err.toString()} [ ${defaultMessage} ]`
    } else {
      return err.toString()
    }

    // Replace line breaks with HTML line breaks.
    return message.replace(/(?:\r\n|\r|\n)/g, '<br>')
  } else {
    // Handle non-axios error (ie, probably a JS error).
    return (err?.toString() || defaultMessage)
  }
}

// TODO: Not a real Action
export const downloadOutputs = async (id: string): Promise<void> => {
  try {
    const url = `namerequests/${id}/result`
    const headers = { 'Accept': 'application/pdf' }

    // Request PDF for specified id
    const response: any = await axios.get(url, { headers: headers, responseType: 'blob' as 'json' })

    // Create a new blob object with mime-type explicitly set, otherwise only Chrome works
    const blob = new Blob([response.data], { type: 'application/pdf' })

    // IE doesn't allow using a blob object directly as link href, so use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob)
    } else {
      // for other browsers, create a link pointing to the ObjectURL containing the blob
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      window.document.body.appendChild(a)
      a.setAttribute('style', 'display: none')
      a.href = url
      a.download = 'Name Request Results'
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    }
  } catch (error) {
    console.error('downloadOutputs() =', error) // eslint-disable-line no-console

    await errorModule.setAppError(
      { id: 'download-pdf-error', error: 'Could not download PDF' } as ErrorI
    )
  }
}

export const setActiveComponent: any = ({ commit }, component): void => {
  enum Tabs {
    NewSearch,
    ExistingRequestSearch
  }
  if (typeof Tabs[component] === 'number') {
    commit('mutateTabNumber', Tabs[component])
    commit('mutateDisplayedComponent', 'Tabs')

    return
  }

  enum SubmissionTabs {
    EntityNotAutoAnalyzed,
    NamesCapture,
    ApplicantInfo1,
    ApplicantInfo2,
    ApplicantInfo3 = ApplicantInfo2,
    InvalidActionMessage,
    Timeout
  }
  if (typeof SubmissionTabs[component] === 'number') {
    commit('mutateSubmissionTabNumber', SubmissionTabs[component])
    commit('mutateDisplayedComponent', 'SubmissionTabs')

    return
  }

  commit('mutateDisplayedComponent', component)
}

export const getNameAnalysis: ActionIF = async ({ commit, getters }) => {
  try {
    commit('mutateAnalyzePending', true)
    commit('mutateDisplayedComponent', 'AnalyzePending')
    commit('resetRequestExaminationOrProvideConsent')

    const params: NewRequestNameSearchI = {
      name: getters.getName,
      location: getters.getLocation,
      entity_type_cd: getters.getEntityTypeCd,
      request_action_cd: getters.getRequestActionCd
    }
    const { CancelToken } = axios
    const source = CancelToken.source()

    const resp = await axios.get('name-analysis', {
      params,
      cancelToken: source.token,
      timeout: ANALYSIS_TIMEOUT_MS
    })

    if (getters.getAnalyzePending) {
      const json = resp.data
      commit('mutateAnalysisJSON', json)
      if (Array.isArray(json.issues) && json.issues.length > 0) {
        let corpConflict = json.issues.find(issue => issue.issue_type === 'corp_conflict')
        if (corpConflict && Array.isArray(corpConflict.conflicts) && corpConflict.conflicts.length > 0) {
          let firstConflict = corpConflict.conflicts[0]
          if (firstConflict.id) {
            commit('mutateConflictId', firstConflict.id)
          }
        }
      }
      commit('mutateAnalyzePending', false)
      commit('mutateDisplayedComponent', 'AnalyzeResults')
    }
  } catch (err) {
    const msg = await handleApiError(err, 'Could not get name analysis')
    console.error('getNameAnalysis() =', msg) // eslint-disable-line no-console
    // FUTURE: fix error handling in case of network error (#5898)
    // (should not display "send to examination")
    if (err?.code === 'ECONNABORTED' || err?.message === 'Network Error') {
      commit('mutateNameAnalysisTimedOut', true)
      commit('mutateName', getters.getName)
      commit('mutateDisplayedComponent', 'SendToExamination')
      return
    }
    if (getters.getUserCancelledAnalysis) {
      commit('setActiveComponent', 'NamesCapture')
      return
    }
    commit('mutateDisplayedComponent', 'Tabs')
  }
}

export const getNameAnalysisXPRO: ActionIF = async ({ commit, getters }) => {
  try {
    commit('mutateAnalyzePending', true)
    commit('mutateDisplayedComponent', 'AnalyzePending')
    commit('resetRequestExaminationOrProvideConsent')

    const params: NewRequestNameSearchI = {
      name: getters.getName,
      location: getters.getLocation,
      entity_type_cd: getters.getEntityTypeCd,
      request_action_cd: getters.getRequestActionCd
    }
    const { CancelToken } = axios
    const source = CancelToken.source()

    const resp: any = await axios.get('/xpro-name-analysis', {
      params,
      cancelToken: source.token,
      timeout: ANALYSIS_TIMEOUT_MS
    })

    if (getters.getAnalyzePending) {
      const json = resp.data
      commit('mutateAnalysisJSON', json)
      if (Array.isArray(json.issues) && json.issues.length > 0) {
        let corpConflict = json.issues.find(issue => issue.issue_type === 'corp_conflict')
        if (corpConflict && Array.isArray(corpConflict.conflicts) && corpConflict.conflicts.length > 0) {
          let firstConflict = corpConflict.conflicts[0]
          if (firstConflict.id) {
            commit('mutateConflictId', firstConflict.id)
          }
        }
      }
      commit('mutateAnalyzePending', false)
      commit('mutateDisplayedComponent', 'AnalyzeResults')
    }
  } catch (err) {
    const msg = await handleApiError(err, 'Could not get name analysis xpro')
    console.error('getNameAnalysisXPRO() =', msg) // eslint-disable-line no-console
    // FUTURE: fix error handling in case of network error (#5898)
    // (should not display "send to examination")
    if (err?.code === 'ECONNABORTED' || err?.message === 'Network Error') {
      commit('mutateNameAnalysisTimedOut', true)
      commit('mutateName', this.getName)
      commit('mutateDisplayedComponent', 'SendToExamination')
      return
    }
    if (getters.getUserCancelledAnalysis) {
      commit('setActiveComponent', 'NamesCapture')
      return
    }
    commit('mutateDisplayedComponent', 'Tabs')
  }
}

/**
 * Confirms whether the specified action is allowed.
 * @param action the action to confirm
 * @returns True if confirmed, otherwise False
 */
export const confirmAction: ActionIF = async ({ commit }, action: string): Promise<boolean> => {
  try {
    const nrData = await this.getNameRequest(this.nr.id)
    if (!nrData) throw new Error('Got error from getNameRequest()')
    commit('setNrResponse', nrData)
    return Boolean(nrData.actions.includes(action))
  } catch (err) {
    // don't generate errors - getNameRequest() already did that
    return false
  }
}

export const findNameRequest: ActionIF = async ({ commit, getters }): Promise<void> => {
  try {
    resetAnalyzeName({ commit, getters })
    commit('mutateQuickSearch', true)
    commit('mutateDisplayedComponent', 'SearchPending')

    const params: ExistingRequestSearchI = {
      nrNum: getters.getExistingRequestSearch?.nrNum,
      phoneNumber: getters.getExistingRequestSearch?.phoneNumber,
      emailAddress: getters.getExistingRequestSearch?.emailAddress
    }
    const { CancelToken } = axios
    const source = CancelToken.source()

    const resp = await axios.get('/namerequests', {
      params,
      cancelToken: source.token
    })

    if (!resp || !resp.data || resp.data.length === 0) {
      commit('mutateNameRequest',
        {
          text: 'No records were found that match the information you entered.<br>' +
            'Please verify the NR Number and the phone / email and try again.',
          failed: true
        }
      )

      // go back to calling page
      commit('mutateDisplayedComponent', 'Tabs')

      return
    }
    commit('mutateNameRequest', resp.data)
    commit('mutateDisplayedComponent', 'ExistingRequestDisplay')
  } catch (err) {
    const msg = await handleApiError(err, 'Could not find name request')
    console.error('findNameRequest()', msg) // eslint-disable-line no-console
    commit('mutateNameRequest',
      {
        text: 'A network error occurred. Please check your network connection and try again.',
        failed: true
      }
    )
    // go back to calling page
    commit('mutateDisplayedComponent', 'Tabs')
  }
}

// TODO: Not a real Action / Update with real getters
export const addRequestActionComment: ActionIF = async ({ commit, getters }, data): Promise<any> => {
  try {
    const requestAction = getters.getRequestActionOriginal || getters.getRequestActionCd
    const action = RequestActions.find(request => request.value === requestAction)
    const { shortDesc } = action || { shortDesc: 'action not found' }
    const msg = `*** ${shortDesc} ***`

    if (!data['additionalInfo']) {
      // if data.additionalInfo is empty, just assign it to message
      data['additionalInfo'] = msg
      return data
    }

    if (data['additionalInfo'].includes(msg)) {
      // if message is already part of additionalInfo, do nothing, return
      return data
    }

    // by here we know there is some text in additionalInfo
    // but it does not contain the exact msg we must add
    // so we check if there is a previous request_action message
    // which no longer matches msg because we are editing
    let allShortDesc = RequestActions.map(request => `*** ${request.shortDesc} ***`)
    if (allShortDesc.some(desc => data['additionalInfo'].includes(desc))) {
      let desc = allShortDesc.find(sd => data['additionalInfo'].includes(sd))
      data['additionalInfo'] = data['additionalInfo'].replace(desc, msg)
      return data
    }

    // if there is no previous request_action message then
    // we just preserve whatever text there is and append msg
    data['additionalInfo'] += ` \n\n ${msg}`
    return data
  } catch (err) {
    const msg = await handleApiError(err, 'Could not add request action comment')
    console.error('addRequestActionComment() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'add-request-action-error', error: msg } as ErrorI)
    return null
  }
}

// TODO: Not a real Action.
/**
 * Fetches an existing NR from the API.
 * NB: To store the returned NR object into app state, use loadExistingNameRequest().
 * @param nrId the NR id
 * @returns the NR object (or null in case of error)
 */
export const getNameRequest = async (nrId: number): Promise<any> => {
  try {
    const response = await axios.get(`/namerequests/${nrId}`, {
      headers: { 'Content-Type': 'application/json' }
    })
    return response.data
  } catch (err) {
    const msg = await handleApiError(err, 'Could not get name request')
    console.error('getNameRequest() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'get-name-request-error', error: msg } as ErrorI)
    return null
  }
}

/**
 * Stores NR data into app state and displays the ExistingRequestDisplay component.
 * NB: To fetch the NR from the API, use getNameRequest().
 * @param nrData the NR data object
 */
export const loadExistingNameRequest:ActionIF = async ({ commit }, nrData: any) => {
  const handleEmptyResults = () => {
    commit('mutateNameRequest',
      {
        text: 'No records were found that match the information you entered.<br>' +
          'Please verify the NR Number and the phone / email and try again.',
        failed: true
      }
    )
    commit('mutateDisplayedComponent', 'Tabs')
  }

  const handleResults = (data) => {
    const { names } = data
    commit('resetApplicantDetails')
    commit('setNrResponse', data)
    commit('updateReservationNames', names)
    commit('mutateDisplayedComponent', 'ExistingRequestDisplay')
  }

  if (!nrData) {
    handleEmptyResults()
  } else {
    handleResults(nrData)
  }
}

// *** TODO: this should not be an "action"
export const fetchStats: ActionIF = async ({ commit }) => {
  try {
    let resp = await axios.get('/statistics')
    commit('mutateStats', resp)
  } catch (err) {
    const msg = await handleApiError(err, 'Could not get stats')
    console.error('fetchStats() =', msg) // eslint-disable-line no-console
  }
}

export const checkoutNameRequest: ActionIF = async ({ commit, getters }): Promise<boolean> => {
  try {
    const checkedOutBy = sessionStorage.getItem('checkedOutBy')
    const checkedOutDt = sessionStorage.getItem('checkedOutDt')

    let response: any
    if (checkedOutBy) {
      response = await axios.patch(`/namerequests/${getters.getNrId}/checkout`, {
        checkedOutBy: checkedOutBy,
        checkedOutDt: checkedOutDt
      }, {
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      response = await axios.patch(`/namerequests/${getters.getNrId}/checkout`, {}, {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = response.data || { checkedOutBy: null, checkedOutDt: null }
    sessionStorage.setItem('checkedOutBy', data.checkedOutBy)
    sessionStorage.setItem('checkedOutDt', data.checkedOutDt)

    return true
  } catch (err) {
    const msg = await handleApiError(err, 'Could not checkout name request')
    console.error('checkoutNameRequest() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'checkout-name-requests-error', error: msg } as ErrorI)
    return false
  }
}

export const checkinNameRequest = async ({ getters }): Promise<boolean> => {
  try {
    const checkedOutBy = sessionStorage.getItem('checkedOutBy')
    const checkedOutDt = sessionStorage.getItem('checkedOutDt')

    if (checkedOutBy) {
      await axios.patch(`/namerequests/${getters.getNrId}/checkin`, {
        checkedOutBy: checkedOutBy,
        checkedOutDt: checkedOutDt
      }, {
        headers: { 'Content-Type': 'application/json' }
      })

      sessionStorage.removeItem('checkedOutBy')
      sessionStorage.removeItem('checkedOutDt')

      return true
    }
  } catch (err) {
    const msg = await handleApiError(err, 'Could not checkin name request')
    console.error('checkinNameRequest() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'checkin-name-requests-error', error: msg } as ErrorI)
    return false
  }
}

export const patchNameRequests: ActionIF = async ({ commit, getters }): Promise<boolean> => {
  try {
    const nr = this.editNameReservation
    const requestData: any = nr && await addRequestActionComment({ commit, getters }, nr)

    // TODO-CAM: Fix request response usage as booleans
    // @ts-ignore
    const response: any = requestData &&
      await axios.patch(`/namerequests/${getters.getNrId}/edit`, requestData, {
        headers: { 'Content-Type': 'application/json' }
      })

    // TODO-CAM: Fix request response usage as booleans
    // @ts-ignore
    if (response?.data) {
      commit('mutateNameRequest', response.data)
      return true
    }

    throw new Error(`Invalid response = ${response}`)
  } catch (err) {
    const msg = await handleApiError(err, 'Could not patch name requests')
    console.error('patchNameRequests() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'patch-name-requests-error', error: msg } as ErrorI)
    return false
  }
}

export const patchNameRequestsByAction: ActionIF =
  async ({ commit, getters }, action: NrAction): Promise<boolean> => {
    try {
      const response = await axios.patch(`/namerequests/${getters.getNrId}/${action}`, {}, {
        headers: { 'Content-Type': 'application/json' }
      })

      if (response?.data) {
        commit('mutateNameRequest', response.data)
        return true
      }

      throw new Error(`Invalid response = ${response}`)
    } catch (err) {
      const msg = await handleApiError(err, 'Could not patch name requests by action')
      console.error('patchNameRequestsByAction() =', msg) // eslint-disable-line no-console
      await errorModule.setAppError({ id: 'patch-name-requests-by-action-error', error: msg } as ErrorI)
      return false
    }
  }

export const postNameRequests: any = async ({ commit, getters }, type: string): Promise<boolean> => {
  if (getters.getAssumedName) type = 'assumed'
  try {
    let data: any
    switch (type) {
      case 'assumed':
      case 'draft':
        data = getters.getDraftNameReservation
        break
      case 'conditional':
        data = getters.conditionalNameReservation
        break
      case 'reserved':
        data = getters.reservedNameReservation
        break
    }

    const requestData: any = data && await addRequestActionComment({ commit, getters }, data)
    const response: any = requestData && await axios.post(`/namerequests`, requestData, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (response?.data) {
      commit('setNrResponse', response.data)
      return true
    }

    throw new Error(`Invalid response = ${response}`)
  } catch (err) {
    const msg = await handleApiError(err, 'Could not post name requests')
    console.error('postNameRequests() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'post-name-requests-error', error: msg } as ErrorI)
    return false
  }
}

export const putNameReservation: any = async ({ commit, getters }, nrId) => {
  let nrState = getters.getNrState
  if (getters.getAssumedName) nrState = 'ASSUMED'
  try {
    let data: any
    switch (nrState) {
      case NrState.DRAFT:
        data = getters.getDraftNameReservation
        break
      // *** TODO: restore this after fixes
      case NrState.COND_RESERVED:
        data = getters.conditionalNameReservation
        break
      case NrState.RESERVED:
        data = getters.reservedNameReservation
        break
      case 'ASSUMED':
        data = getters.editNameReservation
        break
      case NrState.PENDING_PAYMENT:
        // The user clicked Review and Confirm, which POSTed the draft NR.
        // Then they closed the modal (eg, so they could fix something),
        // and now they clicked Review and Confirm again.
        // Treat this like a new NR, but keep the same state.
        data = getters.getDraftNameReservation
        data['stateCd'] = NrState.PENDING_PAYMENT
        break
    }

    if (getters.getShowCorpNum && getters.getCorpNum) {
      data['corpNum'] = getters.getCorpNum
    }

    const requestData = data && await this.addRequestActionComment({ commit, getters }, data)
    const response = requestData && await axios.put(`/namerequests/${nrId}`, requestData, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (response?.data) {
      commit('setNrResponse', response.data)
      return true
    }

    throw new Error(`Invalid response = ${response}`)
  } catch (err) {
    const msg = await handleApiError(err, 'Could not put name reservation')
    console.error('putNameReservation() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'put-name-reservation-error', error: msg } as ErrorI)
    return false
  }
}

// TODO: Not a real Action
export const setCompletePayment = async ({ nrId, paymentId, action }): Promise<NameRequestPayment> => {
  const paymentResponse: NameRequestPayment = {
    paymentSuccess: false
  }

  try {
    const response = await axios.patch(`/payments/${nrId}/payment/${paymentId}/${action}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (response?.status === OK) {
      paymentResponse.payment = response.data
      paymentResponse.httpStatusCode = response.status.toString()
      paymentResponse.paymentSuccess = true
    } else {
      // eslint-disable-next-line no-console
      console.error('completePayment(), status was not 200, response =', response)
      paymentResponse.httpStatusCode = response.status.toString()
      paymentResponse.paymentSuccess = false
    }

    return paymentResponse
  } catch (err) {
    const msg = await handleApiError(err, 'Could not complete payment')
    console.error('completePayment() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'complete-payment-error', error: msg } as ErrorI)
    return null
  }
}

// TODO: Not a real action
export const rollbackNameRequest = async ({ nrId, action }): Promise<boolean> => {
  try {
    // only cancel action is supported atm
    const validRollbackActions = [RollbackActions.CANCEL]

    // safety checks
    if (!nrId) {
      // NB: use console.error to capture issues to Sentry
      // ultimately this should never happen
      console.error('rollbackNameRequest(), invalid NR id') // eslint-disable-line no-console
      return false
    }
    if (!validRollbackActions.includes(action)) {
      // NB: use console.error to capture issues to Sentry
      // ultimately this should never happen
      console.error('rollbackNameRequest(), invalid action =', action) // eslint-disable-line no-console
      return false
    }

    const response = await axios.patch(`/namerequests/${nrId}/rollback/${action}`, {}, {
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response || response.status !== OK) {
      throw new Error(`Status was not 200, response = ${response}`)
    }

    return true
  } catch (err) {
    const msg = await handleApiError(err, 'Could not rollback name request')
    console.error('rollbackNameRequest() =', msg) // eslint-disable-line no-console
    await errorModule.setAppError({ id: 'rollback-name-request-error', error: msg } as ErrorI)
    return false
  }
}

export const userClickedStopAnalysis: ActionIF = ({ commit }) => {
  commit('mutateUserCancelledAnalysis', true)
  commit('mutateSubmissionType', 'examination')
}

export const resetAnalyzeName = ({ commit, getters }) => {
  commit('clearAssumedNameOriginal')
  if (!getters.getUserCancelledAnalysis) {
    commit('mutateAnalysisJSON', null)
  }
  commit('mutateCorpNum', '')
  commit('mutateEditMode', false)
  commit('mutateRequestActionOriginal', '')
  commit('mutateSubmissionType', 'normal')
  commit('mutateShowActualInput', false)
  commit('resetApplicantDetails')
  commit('resetNrData')
  commit('resetRequestExaminationOrProvideConsent')
  commit('resetNameChoices')
  commit('mutateNameRequest', {})
  commit('mutateNameAnalysisTimedOut', false)
  commit('mutateAnalyzePending', false)
}

export const cancelAnalyzeName: ActionIF = ({ commit, getters }, destination: string) => {
  commit('mutateAnalyzePending', false)
  if (source && source.cancel) {
    source.cancel()
    source = null
  }
  if (destination === 'Tabs') {
    commit('mutateName', getters.getOriginalName)
    commit('mutateUserCancelledAnalysis', false)
  }
  setActiveComponent({ commit }, destination)
  if (destination !== 'NamesCapture') {
    resetAnalyzeName({ commit, getters })
    commit('mutateQuickSearch', true)
  }
}

export const cancelEditExistingRequest: ActionIF = ({ commit }) => {
  commit('mutateDisplayedComponent', 'ExistingRequestDisplay')
  commit('resetApplicantDetails')
  commit('mutateNameChoicesToInitialState')
  commit('resetApplicantDetails', '')
  commit('resetNrData')
  commit('mutateEditMode', false)
}

export const editExistingRequest: ActionIF = ({ commit, getters }) => {
  commit('mutateEditMode', true)
  commit('populateApplicantData')
  commit('populateNrData')
  if (['clientFirstName', 'clientLastName', 'contact'].some(field => !!getters.getNr.applicants[field])) {
    commit('mutateActingOnOwnBehalf', false)
  }
  let { entity_type_cd } = this.nr
  if (getters.getEntityTypesBC.some(type => type.value === entity_type_cd)) {
    commit('mutateLocation', 'BC')
  } else if (getters.getNr.xproJurisdiction) {
    let { xproJurisdiction } = getters.getNr
    let location: LocationT
    for (let key of ['value', 'text']) {
      if (this.$canJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
        location = 'CA'
        break
      }
      if (this.$intlJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
        location = 'IN'
        break
      }
    }
    commit('mutateLocation', location)
  }
  commit('mutateEntityType', entity_type_cd)
  if (!this.entityTypeOptions.some(option => option.value === entity_type_cd)) {
    let obj = getters.getEntityTypesBC.find(entity => entity.value === entity_type_cd)
      ? getters.getEntityTypesBC.find(entity => entity.value === entity_type_cd)
      : getters.getEntityTypesXPRO.find(entity => entity.value === entity_type_cd)
    commit('mutateEntityTypeAddToSelect', obj)
  }
  let { requestTypeCd, request_action_cd } = getters.getNr
  if (['AS', 'AL', 'XASO', 'XCASO', 'UA'].includes(requestTypeCd)) {
    request_action_cd = 'ASSUMED'
  }
  if (request_action_cd !== 'NEW') {
    commit('mutateRequestAction', request_action_cd)
    let reqObj = RequestActions.find(type => type.value === request_action_cd)
    commit('mutateExtendedRequestType', reqObj)
  }
  if (getters.getNr.corpNum) {
    commit('mutateCorpNum', getters.getNr.corpNum)
  }
  if (getters.getNrState === 'DRAFT') {
    commit('mutateSubmissionTabComponent', 'NamesCapture')
  } else {
    commit('mutateSubmissionTabComponent', 'ApplicantInfo1')
  }
  commit('mutateDisplayedComponent', 'ExistingRequestEdit')
}

// TODO: Not an action
export const parseExactNames = (json: { names: [string] }) => {
  let nameObjs = json.names
  let names = []
  for (let i = 0; i < nameObjs.length; i++) {
    names.push({ name: `${nameObjs[i]['name']}`, type: 'exact' })
  }
  return names
}
// TODO: Not an action
export const parseSynonymNames = (json: { names: [string], exactNames: [{ name: string, type: string }] }) => {
  let duplicateNames = []
  for (let i = 0; i < json.exactNames.length; i++) {
    duplicateNames.push(json.exactNames[i].name)
  }
  let nameObjs = json.names
  let names = []
  for (let i = 0; i < nameObjs.length; i++) {
    if (nameObjs[i]['name_info']['id']) {
      let name = nameObjs[i]['name_info']['name']
      if (!duplicateNames.includes(name)) {
        names.push({ name: name, type: 'synonym' })
      }
    }
  }
  return names
}

export const getQuickSearch = async ({ commit, getters }, cleanedName: {exactMatch: string, synonymMatch: string}) => {
  const quickSearchPublicId = window['quickSearchPublicId']
  const quickSearchPublicSecret = window['quickSearchPublicSecret']

  // only do quick search if we have id and secret
  if (quickSearchPublicId && quickSearchPublicSecret) {
    try {
      commit('mutateDisplayedComponent', 'QuickSearchPending')
      let encodedAuth = btoa(`${quickSearchPublicId}:${quickSearchPublicSecret}`)

      const tokenResp = await axios.post(window['authTokenUrl'], 'grant_type=client_credentials', {
        headers: { Authorization: `Basic ${encodedAuth}`, 'content-type': 'application/x-www-form-urlencoded' }
      })

      let token = tokenResp.data.access_token
      const exactResp = await axios.get('/exact-match?query=' + cleanedName.exactMatch, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      const synonymResp = await axios.get('/requests/synonymbucket/' + cleanedName.synonymMatch + '/*', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })

      const exactNames = await parseExactNames(exactResp.data)

      // pass in exactNames so that we can check for duplicates
      synonymResp.data.exactNames = exactNames
      const synonymNames = await parseSynonymNames(synonymResp.data)
      commit('mutateQuickSearchNames', exactNames.concat(synonymNames))

      // check if they skipped
      if (getters.getQuickSearch) {
        commit('mutateDisplayedComponent', 'QuickSearchResults')
      }

      return
    } catch (err) {
      const msg = await handleApiError(err, 'Could not get quick search')
      // send error to sentry and move on to detailed search
      // (do not show error to user)
      console.error('getQuickSearch() =', msg) // eslint-disable-line no-console
    }
  }
  commit('mutateQuickSearch', false)
  await startAnalyzeName({ commit, getters })
}

// TODO: Not an Action
export const startQuickSearch = async ({ commit, getters }) => {
  if (getters.getName) {
    const name = getters.getName
    // eslint-disable-next-line no-useless-escape
    let exactMatchName = name.replace(' \/', '\/')
      .replace(/(^|\s+)(\$+(\s|$)+)+/g, '$1DOLLAR$3')
      .replace(/(^|\s+)(¢+(\s|$)+)+/g, '$1CENT$3')
      .replace(/\$/g, 'S')
      .replace(/¢/g, 'C')
      .replace(/\\/g, '')
      .replace(/\//g, '')
      .replace(/(`|~|!|\||\(|\)|\[|\]|\{|\}|:|"|\^|#|%|\?)/g, '')
      // eslint-disable-next-line no-useless-escape
      .replace(/[\+\-]{2,}/g, '')
      // eslint-disable-next-line no-useless-escape
      .replace(/\s[\+\-]$/, '')
    exactMatchName = exactMatchName.substring(0, 1) === '+' ? exactMatchName.substring(1) : exactMatchName
    exactMatchName = encodeURIComponent(exactMatchName)

    const synonymsName = name.replace(/\//g, ' ')
      .replace(/\\/g, ' ')
      .replace(/&/g, ' ')
      .replace(/\+/g, ' ')
      // eslint-disable-next-line no-useless-escape
      .replace(/\-/g, ' ')
      .replace(/(^| )(\$+(\s|$)+)+/g, '$1DOLLAR$3')
      .replace(/(^| )(¢+(\s|$)+)+/g, '$1CENT$3')
      .replace(/\$/g, 'S')
      .replace(/¢/g, 'C')
      .replace(/(`|~|!|\||\(|\)|\[|\]|\{|\}|:|"|\^|#|%|\?|,)/g, '')

    await getQuickSearch({ commit, getters }, { 'exactMatch': exactMatchName, 'synonymMatch': synonymsName })
  }
}

export const startAnalyzeName: ActionIF = async ({ commit, getters }) => {
  resetAnalyzeName({ commit, getters })
  setUserCancelledAnalysis({ commit, getters }, false)
  let name
  if (getters.getName) {
    name = sanitizeName(getters.getName)
  }

  if (!getters.getRequestActionCd) commit('setErrors', 'request_action_cd')
  if (!getters.getLocation) commit('setErrors', 'location')
  if (!getters.getEntityTypeCd) commit('setErrors', 'entity_type_cd')

  // set error if checkbox is shown and user hasn't confirmed it
  if (getters.getShowNoCorpDesignation && !getters.getNoCorpDesignation) {
    commit('setErrors', 'no_corp_designation')
  }
  if (['CA', 'IN'].includes(getters.getLocation) &&
    !['MVE'].includes(getters.getRequestActionCd) && !getters.getRequestJurisdictionCd) {
    commit('setErrors', 'jurisdiction')
    return
  }
  if (!getters.getCorpSearch) {
    if (!getters.getName) {
      commit('setErrors', 'name')
      return
    }
    if (getters.getName.length < 3) {
      commit('setErrors', 'length')
      return
    }
  }
  if (getters.getErrors.length > 0) {
    return
  }
  commit('mutateNameOriginal', name) // Set original name for reset baseline
  if (getters.getIsXproMras) {
    commit('mutateNRData', { key: 'xproJurisdiction', value: getters.getJurisdictionText })
    if (!getters.getHasNoCorpNum) {
      const profile: any = await fetchMRASProfile({ commit, getters })
      if (profile) {
        const hasMultipleNames = profile?.LegalEntity?.names && profile?.LegalEntity?.names.constructor === Array
        name = hasMultipleNames
          ? sanitizeName(profile?.LegalEntity?.names[0]?.legalName)
          : sanitizeName(profile?.LegalEntity?.names?.legalName)
        commit('mutateName', name)
        commit('mutateNRData', { key: 'homeJurisNum', value: this.corpSearch })
      } else {
        commit('mutateNoCorpNum', true)
        return
      }
    }
  }
  if (getters.getQuickSearch) {
    await startQuickSearch({ commit, getters })
    return
  }
  let testName = getters.getName.toUpperCase()
  testName = removeExcessSpaces(testName)
  // eslint-disable-next-line no-useless-escape
  if ((name !== testName) || name.match(/^[\[\]\^*\+-\/\=&\(\)\.,"'#@\!\?;:]/)) {
    commit('mutateDisplayedComponent', 'AnalyzeCharacters')
    commit('mutateName', name)
    return
  }
  if (getters.getNameIsSlashed) {
    commit('mutateName', name)
    commit('mutateDisplayedComponent', 'SendToExamination')

    return
  }
  commit('mutateName', name)
  if (getters.getLocation === 'BC' || getters.getRequestActionCd === 'MVE') {
    if (getters.getNameIsEnglish && !getters.getIsPersonsName &&
      !getters.getDoNotAnalyzeEntities.includes(getters.getEntityTypeCd)) {
      if (['NEW', 'MVE', 'DBA', 'CHG'].includes(getters.getRequestActionCd)) {
        getFeatureFlag('disable-analysis')
          ? commit('mutateDisplayedComponent', 'SendToExamination')
          : getNameAnalysis({ commit, getters })
        return
      }
    }
    commit('mutateDisplayedComponent', 'SendToExamination')
  } else {
    if (['AML', 'CHG', 'DBA', 'MVE', 'NEW', 'REH', 'REN', 'REST'].includes(getters.getRequestActionCd)) {
      if (getters.getDoNotAnalyzeEntities.includes(getters.getEntityTypeCd)) {
        commit('mutateDisplayedComponent', 'SendToExamination')
        return
      }
      getFeatureFlag('disable-analysis')
        ? commit('mutateDisplayedComponent', 'SendToExamination')
        : getNameAnalysisXPRO({ commit, getters })
    }
  }
}

export const setApplicantDetails: ActionIF = ({ commit }, appKV) => {
  commit('mutateApplicant', appKV)
  if (!appKV || !appKV.value || appKV.key !== 'addrLine1') {
    commit('mutateAddressSuggestions', null)
  }
}

export const setAddressSuggestions: ActionIF = ({ commit }, addressSuggestions: any[]) => {
  commit('mutateAddressSuggestions', addressSuggestions)
}

// TODO: Not a real action?
export const fetchCorpNum = async ({ getters }, corpNum: string): Promise<any> => {
  if (getters.getShowCorpNum) {
    if (getters.getShowCorpNum === 'mras') {
      return this.checkMRAS(corpNum)
    } else {
      return this.checkCOLIN(corpNum)
    }
  }
}

// TODO: Not a real action
export const checkCOLIN = (corpNum: string) => {
  // Remove BC prefix as Colin only supports base number with no prefix for BC's
  const cleanedCorpNum = corpNum.replace(/^BC+/i, '')
  let url = `colin/${cleanedCorpNum}`
  return axios.post(url, {})
}

// TODO: Not a real action
export const checkMRAS = (corpNum: string) => {
  let { xproJurisdiction } = this.nrData
  let { SHORT_DESC } = this.$canJurisdictions.find(jur => jur.text === xproJurisdiction)
  let url = `mras-profile/${SHORT_DESC}/${corpNum}`
  return axios.get(url)
}

export const fetchMRASProfile = async ({ commit, getters }): Promise<any> => {
  if (getters.getCorpSearch) {
    try {
      let url = `mras-profile/${getters.getRequestJurisdictionCd}/${getters.getCorpSearch}`
      const response = await axios.get(url)
      if (response?.status === OK) {
        return response.data
      }
      throw new Error(`Status was not 200, response = ${response}`)
    } catch (err) {
      const status: number = err?.response?.status
      // do not generate console error for the errors codes
      // that mras-search-info page handles
      if (![BAD_REQUEST, NOT_FOUND, SERVICE_UNAVAILABLE].includes(status)) {
        const msg = await handleApiError(err, 'Could not fetch mras profile')
        console.error('fetchMRASProfile() =', msg) // eslint-disable-line no-console
      }
      commit('mutateName')
      commit('mutateMrasSearchResult', status)
      commit('mutateMrasSearchInfoModalVisible', true)
    }
  }
  return null
}

/** Submits an edited NR or a new name submission. */
export const submit: any = async ({ commit, getters }): Promise<any> => {
  // TODO: Handle Edit Submit
  if (getters.isEditMode) {
    // TODO-CAM: Refactor the way these async requests are used to provide conditional booleans
    // @ts-ignore
    if (await patchNameRequests()) {
      // @ts-ignore
      if (await checkinNameRequest()) {
        commit('mutateDisplayedComponent', 'Success')
        await sleep(1000) // wait for a second to show the update success
        await this.fetchNr(+getters.getNrId)
      }
    }
  } else {
    let request
    if (!getters.getNrId) {
      request = await postNameRequests({ commit, getters }, 'draft')
    } else {
      if (!getters.isEditMode && [NrState.COND_RESERVED, NrState.RESERVED].includes(getters.getNrState)) {
        request = await getNameRequest(getters.getNrId)
        if (request?.stateCd === NrState.CANCELLED) {
          await setActiveComponent('Timeout')
          return
        }
      }
      request = await putNameReservation(getters.getNrId)
    }
    if (request) await paymentModule.togglePaymentModal(true)
  }
}

export const setName: ActionIF = ({ commit }, name: string): void => {
  commit('mutateName', name)
}

export const setLocation: ActionIF = ({ commit }, location: LocationT): void => {
  commit('mutateLocation', location)
}

export const setDisplayedComponent: ActionIF = ({ commit }, component: string): void => {
  commit('mutateDisplayedComponent', component)
}

export const setTabNumber: ActionIF = ({ commit }, tabNumber: number): void => {
  commit('mutateTabNumber', tabNumber)
}

export const setCorpSearch: ActionIF = ({ commit }, corpSearch: string): void => {
  commit('mutateCorpSearch', corpSearch)
}

export const setEntityTypeCd: ActionIF = ({ commit }, entityTypeCd: string): void => {
  commit('mutateEntityType', entityTypeCd)
}

export const setConversionType: ActionIF = ({ commit }, conversionType: string): void => {
  commit('mutateConversionType', conversionType)
}

export const setJurisdiction: ActionIF = ({ commit }, jurisdictionCd: string): void => {
  commit('mutateJurisdiction', jurisdictionCd)
}

export const setIsPersonsName: ActionIF = ({ commit }, isPersonsName: boolean): void => {
  commit('mutateIsPersonsName', isPersonsName)
}

export const setNameIsEnglish: ActionIF = ({ commit }, isEnglishName: boolean): void => {
  commit('mutateNameIsEnglish', isEnglishName)
}

export const setNoCorpNum: ActionIF = ({ commit }, noCorpNum: boolean): void => {
  commit('mutateNoCorpNum', noCorpNum)
}

export const setNoCorpDesignation: ActionIF = ({ commit }, noCorpDesignation: boolean): void => {
  commit('mutateNoCorpDesignation', noCorpDesignation)
}

export const setExtendedRequestType: ActionIF = ({ commit }, extendedRequestType: SelectOptionsI): void => {
  commit('mutateExtendedRequestType', extendedRequestType)
}

export const setRequestAction: ActionIF = ({ commit }, requestAction: string): void => {
  commit('mutateRequestAction', requestAction)
}

export const setConversionTypeAddToSelect: ActionIF = ({ commit }, conversionType: ConversionTypesI): void => {
  commit('mutateConversionTypeAddToSelect', conversionType)
}

export const setEntityTypeAddToSelect: ActionIF = ({ commit }, entityType: SelectOptionsI): void => {
  commit('mutateEntityTypeAddToSelect', entityType)
}

export const setClearErrors: ActionIF = ({ commit }): void => {
  commit('clearErrors')
}

export const setUserCancelledAnalysis: ActionIF = ({ commit }, cancelledAnalysis: boolean): void => {
  commit('mutateUserCancelledAnalysis', cancelledAnalysis)
}

export const setNameRequest: ActionIF = ({ commit }, nameRequest: NameRequestI): void => {
  commit('mutateNameRequest', nameRequest)
}

export const setExistingRequestSearch: ActionIF = ({ commit }, existingRequest: { key, value }): void => {
  commit('mutateExistingRequestSearch', existingRequest)
}

export const setNrResponse: ActionIF = ({ commit }, response: NameRequestI): void => {
  commit('setNrResponse', response)
}

export const setSubmissionTabNumber: ActionIF = ({ commit }, tabNumber: number): void => {
  commit('mutateSubmissionTabNumber', tabNumber)
}

export const setSubmissionType: ActionIF = ({ commit }, submissionType: SubmissionTypeT): void => {
  commit('mutateSubmissionType', submissionType)
}

export const setCorpNum: ActionIF = ({ commit }, corpNum: string): void => {
  commit('mutateCorpNum', corpNum)
}

export const setActingOnOwnBehalf: ActionIF = ({ commit }, isActingOnOwn: boolean): void => {
  commit('mutateActingOnOwnBehalf', isActingOnOwn)
}

export const setApplicant: ActionIF = ({ commit }, applicant: any): void => {
  commit('mutateApplicant', applicant)
}

export const setNRData: ActionIF = ({ commit }, applicant: any): void => {
  commit('mutateNRData', applicant)
}

export const setEditMode: ActionIF = ({ commit }, editMode: boolean): void => {
  commit('mutateEditMode', editMode)
}

export const setAssumedNameOriginal: ActionIF = ({ commit }): void => {
  commit('mutateAssumedNameOriginal')
}

export const setNameChoicesToInitialState: ActionIF = ({ commit }): void => {
  commit('mutateNameChoicesToInitialState')
}

export const setNameChoices: ActionIF = ({ commit }, choiceObj: any): void => {
  commit('mutateNameChoices', choiceObj)
}

export const setPriorityRequest: ActionIF = ({ commit }, isPriorityRequest: boolean): void => {
  commit('mutatePriorityRequest', isPriorityRequest)
}

export const setIsLoadingSubmission: ActionIF = ({ commit }, isLoading: boolean): void => {
  commit('mutateIsLoadingSubmission', isLoading)
}

export const setShowActualInput: ActionIF = ({ commit }, showInput: boolean): void => {
  commit('mutateShowActualInput', showInput)
}

export const setQuickSearch: ActionIF = ({ commit }, quickSearch: boolean): void => {
  commit('mutateQuickSearch', quickSearch)
}

// *** Dialog Actions ***
export const setIncorporateLoginModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateIncorporateLoginModalVisible', isVisible)
}

export const setPickEntityModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutatePickEntityModalVisible', isVisible)
}

export const setPickRequestTypeModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutatePickRequestTypeModalVisible', isVisible)
}

export const setMrasSearchInfoModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateMrasSearchInfoModalVisible', isVisible)
}

export const setExitModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateExitModalVisible', isVisible)
}

export const setSubmissionTabComponent: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateSubmissionTabComponent', isVisible)
}

export const setConditionsModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateConditionsModalVisible', isVisible)
}

export const setAffiliationErrorModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateAffiliationErrorModalVisible', isVisible)
}

export const setHelpMeChooseModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateHelpMeChooseModalVisible', isVisible)
}

export const setLocationInfoModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateLocationInfoModalVisible', isVisible)
}

export const setNrRequiredModalVisible: ActionIF = ({ commit }, isVisible: boolean): void => {
  commit('mutateNrRequiredModalVisible', isVisible)
}

export const setRequestExaminationOrProvideConsent: ActionIF = ({ commit }, requestExamOrConsent: any): void => {
  commit('mutateRequestExaminationOrProvideConsent', requestExamOrConsent)
}
