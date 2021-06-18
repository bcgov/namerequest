import querystring from 'qs'
import axios from 'axios'
import { CorpNumRequests, NrState } from '@/enums'
import { BAD_REQUEST, NOT_FOUND, OK, SERVICE_UNAVAILABLE } from 'http-status-codes'
import { removeExcessSpaces, sanitizeName } from '@/plugins/utilities'
import { getFeatureFlag, sleep } from '@/plugins'
import NamexServices from '@/services/namex.services'

// List Data
import { CanJurisdictions, IntlJurisdictions, RequestActions } from '@/list-data'

// Interfaces
import {
  ConversionTypesI,
  LocationT, NameRequestI,
  NewRequestNameSearchI,
  SelectOptionsI,
  StatsI,
  SubmissionTypeT,
  StaffPaymentIF
} from '@/interfaces'
import { ActionIF } from '@/interfaces/store-interfaces'

const qs: any = querystring
let source: any

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

// for xpro too
export const getNameAnalysis: ActionIF = async ({ commit, getters }, xpro: boolean) => {
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
    const analysis = await NamexServices.nameAnalysis(params, xpro)

    if (getters.getAnalyzePending) {
      const json = analysis
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
    const msg = await NamexServices.handleApiError(err, 'Could not get name analysis')
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

/**
 * Confirms whether the specified action is allowed.
 * @param action the action to confirm
 * @returns True if confirmed, otherwise False
 */
export const confirmAction: ActionIF = async ({ commit, getters }, action: string): Promise<boolean> => {
  try {
    const nrData = await NamexServices.getNameRequest(true)
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

    const request = await NamexServices.getNameRequest(false)
    if (!request) {
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
    commit('mutateNameRequest', request)
    commit('mutateDisplayedComponent', 'ExistingRequestDisplay')
  } catch (err) {
    const msg = await NamexServices.handleApiError(err, 'Could not find name request')
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

/**
 * Stores NR data into app state and displays the ExistingRequestDisplay component.
 * NB: To fetch the NR from the API, use getNameRequest().
 * @param nrData the NR data object
 */
export const loadExistingNameRequest:ActionIF = async ({ commit }, nrData: any) => {
  if (!nrData) {
    commit('mutateNameRequest', {
      text: 'No records were found that match the information you entered.<br>' +
        'Please verify the NR Number and the phone / email and try again.',
      failed: true
    })
    commit('mutateDisplayedComponent', 'Tabs')
  } else {
    const { names } = nrData
    commit('resetApplicantDetails')
    commit('setNrResponse', nrData)
    commit('updateReservationNames', names)
    // *** TODO: instead of "mutating the component", route to "/existing/:id"
    commit('mutateDisplayedComponent', 'ExistingRequestDisplay')
  }
}

export const setStats: ActionIF = async ({ commit }, stats: StatsI) => {
  commit('mutateStats', stats)
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
  let { entity_type_cd } = getters.getNr
  if (getters.getEntityTypesBC.some(type => type.value === entity_type_cd)) {
    commit('mutateLocation', 'BC')
  } else if (getters.getNr.xproJurisdiction) {
    let { xproJurisdiction } = getters.getNr
    let location: LocationT
    for (let key of ['value', 'text']) {
      if (CanJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
        location = 'CA'
        break
      }
      if (IntlJurisdictions.some(jurisdiction => jurisdiction[key] === xproJurisdiction)) {
        location = 'IN'
        break
      }
    }
    commit('mutateLocation', location)
  }
  commit('mutateEntityType', entity_type_cd)
  if (!getters.getEntityTypeOptions.some(option => option.value === entity_type_cd)) {
    let obj = getters.getEntityTypesBC.find(entity => entity.value === entity_type_cd)
      ? getters.getEntityTypesBC.find(entity => entity.value === entity_type_cd)
      : getters.getEntityTypesXPRO.find(entity => entity.value === entity_type_cd)
    commit('mutateEntityTypeAddToSelect', obj)
  }
  let { requestTypeCd, request_action_cd } = getters.getNr

  if (['AS', 'AL', 'XASO', 'XCASO', 'UA'].includes(requestTypeCd)) {
    request_action_cd = 'ASSUMED'
  }
  commit('mutateRequestAction', request_action_cd)
  if (request_action_cd !== 'NEW') {
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
      const msg = await NamexServices.handleApiError(err, 'Could not get quick search')
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
    commit('mutateNRData', { key: 'homeJurisNum', value: getters.getCorpSearch })
    if (!getters.getHasNoCorpNum) {
      const profile: any = await fetchMRASProfile({ commit, getters })
      if (profile) {
        const hasMultipleNames = profile?.LegalEntity?.names && profile?.LegalEntity?.names.constructor === Array
        name = hasMultipleNames
          ? sanitizeName(profile?.LegalEntity?.names[0]?.legalName)
          : sanitizeName(profile?.LegalEntity?.names?.legalName)
        commit('mutateName', name)
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
          : getNameAnalysis({ commit, getters }, false)
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
        : getNameAnalysis({ commit, getters }, true)
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
    if (getters.getShowCorpNum === CorpNumRequests.MRAS) {
      return checkMRAS({ getters }, corpNum)
    } else {
      return checkCOLIN({ getters }, corpNum)
    }
  }
}

// TODO: Not a real action
export const checkCOLIN = ({ getters }, corpNum: string) => {
  // Remove BC prefix as Colin only supports base number with no prefix for BC's
  const cleanedCorpNum = corpNum.replace(/^BC+/i, '')
  let url = `colin/${cleanedCorpNum}`
  return axios.post(url, {})
}

// TODO: Not a real action
export const checkMRAS = ({ getters }, corpNum: string) => {
  let { xproJurisdiction } = getters.getNrData
  let { SHORT_DESC } = CanJurisdictions.find(jur => jur.text === xproJurisdiction)
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
        const msg = await NamexServices.handleApiError(err, 'Could not fetch mras profile')
        console.error('fetchMRASProfile() =', msg) // eslint-disable-line no-console
      }
      commit('mutateName')
      commit('mutateMrasSearchResult', status)
      commit('mutateMrasSearchInfoModalVisible', true)
    }
  }
  return null
}

// TODO: not a real action
export const getNrStateData = ({ getters }) => {
  let nrState = getters.getNrState
  if (getters.getAssumedName) nrState = 'ASSUMED'
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
  return data
}

// TODO: not a real action
export const getNrTypeData = ({ getters }, type: string) => {
  if (getters.getAssumedName) type = 'assumed'
  let data: any
  switch (type) {
    case 'assumed':
    case 'draft':
      data = getters.getDraftNameReservation
      break
    case 'conditional':
      data = getters.getConditionalNameReservation
      break
    case 'reserved':
      data = getters.getReservedNameReservation
      break
  }
  return data
}

/** Submits an edited NR or a new name submission. */
export const submit: any = async ({ commit, getters, dispatch }): Promise<any> => {
  if (getters.getEditMode) {
    // TODO-CAM: Refactor the way these async requests are used to provide conditional booleans
    // @ts-ignore
    const requestAction = getters.getRequestActionOriginal || getters.getRequestActionCd
    const data = await NamexServices.patchNameRequests(getters.getNrId, requestAction, getters.getEditNameReservation)
    if (data) {
      // TODO: change this flow to use the patch response instead of getting the request again and remove code below
      // TODO: cases where applicants can be a list or object -> make this consistent (api) + update UI accordingly
      // need to set phone/email in case they changed in the patch
      if (data.applicants instanceof Array && data.applicants.length > 0) {
        sessionStorage.setItem('BCREG-emailAddress', data.applicants[0].emailAddress)
        sessionStorage.setItem('BCREG-phoneNumber', data.applicants[0].phoneNumber)
      } else {
        sessionStorage.setItem('BCREG-emailAddress', data.applicants?.emailAddress)
        sessionStorage.setItem('BCREG-phoneNumber', data.applicants?.phoneNumber)
      }
      commit('mutateNameRequest', data)
      // TODO: remove checkin/checkout process (api should handle it whenever a put/patch is attempted)
      // @ts-ignore
      const checkin = await NamexServices.checkinNameRequest(getters.getNrId, getters.getNrState)
      if (checkin) {
        commit('mutateDisplayedComponent', 'Success')
        await sleep(1000) // wait for a second to show the update success
        const nrData = await NamexServices.getNameRequest(true)
        if (nrData) loadExistingNameRequest({ commit }, nrData)
      }
    }
  } else {
    let request
    const requestAction = getters.getRequestActionOriginal || getters.getRequestActionCd
    if (!getters.getNrId) {
      const data = getNrTypeData({ getters }, 'draft')
      request = await NamexServices.postNameRequests(requestAction, data)
      if (request) commit('setNrResponse', request)
    } else {
      const data = getNrStateData({ getters })
      if (!getters.isEditMode && [NrState.COND_RESERVED, NrState.RESERVED].includes(getters.getNrState)) {
        request = await NamexServices.getNameRequest(true)
        if (request?.stateCd === NrState.CANCELLED) {
          await setActiveComponent('Timeout')
          return
        }
      }
      request = await NamexServices.putNameReservation(getters.getNrId, requestAction, data)
      if (request) commit('setNrResponse', request)
    }
    if (request) await dispatch('togglePaymentModal', true)
  }
}

export const setCurrentJsDate: ActionIF = ({ commit }, date: Date): void => {
  commit('mutateCurrentJsDate', date)
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

export const setExistingRequestSearch: ActionIF = (
  { commit, getters },
  existingRequest: { key: string, value: string }
): void => {
  const prefix = 'BCREG-'
  // if nr changes set session email/phone to whatever is in store (prevents previous values from interfering)
  if (existingRequest.value.includes('NR')) {
    sessionStorage.setItem(prefix + 'emailAddress', getters.getExistingRequestSearch.emailAddress)
    sessionStorage.setItem(prefix + 'phoneNumber', getters.getExistingRequestSearch.phoneNumber)
  }
  if (existingRequest.value.includes('NR L')) {
    sessionStorage.setItem(prefix + 'nrl', existingRequest.value)
  } else {
    sessionStorage.setItem(prefix + existingRequest.key, existingRequest.value)
  }
  commit('mutateExistingRequestSearch', existingRequest)
}

export const setNrResponse: ActionIF = ({ commit }, request: NameRequestI): void => {
  commit('setNrResponse', request)
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

export const setNRData: ActionIF = ({ commit }, nrData: any): void => {
  commit('mutateNRData', nrData)
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

export const setKeycloakRoles: ActionIF = ({ commit }, keycloakRoles: string[]): void => {
  commit('mutateKeycloakRoles', keycloakRoles)
}

export const setStaffPayment: ActionIF = ({ commit }, staffPayment: StaffPaymentIF): void => {
  commit('mutateStaffPayment', staffPayment)
}
