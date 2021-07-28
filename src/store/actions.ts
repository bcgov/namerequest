import querystring from 'qs'
import axios from 'axios'
import {
  CorpNumRequests,
  EntityType,
  Location,
  NameCheckAnalysisJurisdiction,
  NameCheckAnalysisType,
  NameCheckConflictType,
  NameCheckErrorType,
  NrState,
  RequestCode
} from '@/enums'
import { BAD_REQUEST, NOT_FOUND, OK, SERVICE_UNAVAILABLE } from 'http-status-codes'
import { sanitizeName } from '@/plugins/utilities'
import removeAccents from 'remove-accents'
import { getFeatureFlag, sleep } from '@/plugins'
import NamexServices from '@/services/namex.services'

// List Data
import { CanJurisdictions, Designations, IntlJurisdictions, RequestActions } from '@/list-data'

// Interfaces
import {
  CleanedNameIF,
  ConversionTypesI,
  NameRequestI,
  NewRequestNameSearchI,
  ParsedRestrictedResponseIF,
  RestrictedResponseIF,
  SelectOptionsI,
  StatsI,
  SubmissionTypeT,
  StaffPaymentIF,
  QuickSearchParamsI,
  QuickSearchParsedRespI,
  ConflictListItemI
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
    // FUTURE: instead of "mutating the component", route to "/existing/:id"
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
  commit('mutateSubmissionType', 'normal')
  commit('mutateShowActualInput', false)
  commit('resetApplicantDetails')
  commit('resetNrData')
  commit('resetRequestExaminationOrProvideConsent')
  commit('resetNameChoices')
  commit('mutateNameRequest', {})
  commit('mutateNameAnalysisTimedOut', false)
  commit('mutateAnalyzeDesignationPending', false)
  commit('mutateAnalyzeStructurePending', false)
  commit('mutateAnalyzeConflictsPending', false)
  commit('mutateConflictsConditional', [])
  commit('mutateConflictsExact', [])
  commit('mutateConflictsRestricted', [])
  commit('mutateConflictsSimilar', [])
  commit('mutateDesignationsCheckUse', [])
  commit('mutateDesignationsMismatched', [])
  commit('mutateDesignationsMisplaced', [])
  commit('mutateMissingDescriptive', false)
  commit('mutateMissingDesignation', false)
  commit('mutateMissingDistinctive', false)
  commit('mutateNameCheckErrorClear', NameCheckErrorType.ERROR_DESIGNATION)
  commit('mutateNameCheckErrorClear', NameCheckErrorType.ERROR_EXACT)
  commit('mutateNameCheckErrorClear', NameCheckErrorType.ERROR_RESTRICTED)
  commit('mutateNameCheckErrorClear', NameCheckErrorType.ERROR_SIMILAR)
  commit('mutateNameCheckErrorClear', NameCheckErrorType.ERROR_STRUCTURE)
  commit('mutateNumbersCheckUse', [])
  commit('mutateSpecialCharacters', [])
}

export const cancelAnalyzeName: ActionIF = ({ commit, getters }, destination: string) => {
  commit('mutateAnalyzeDesignationPending', false)
  commit('mutateAnalyzeStructurePending', false)
  commit('mutateAnalyzeConflictsPending', false)
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
    commit('mutateLocation', Location.BC)
  } else if (getters.getNr.xproJurisdiction) {
    let { xproJurisdiction } = getters.getNr
    let location: Location
    for (let key of ['value', 'text']) {
      if (CanJurisdictions.some(jurisdiction => jurisdiction[key].toUpperCase() === xproJurisdiction)) {
        location = Location.CA
        break
      }
      if (IntlJurisdictions.some(jurisdiction => jurisdiction[key].toUpperCase() === xproJurisdiction)) {
        location = Location.IN
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
    request_action_cd = RequestCode.ASSUMED
  }
  commit('mutateRequestAction', request_action_cd)
  if (request_action_cd !== RequestCode.NEW) {
    let reqObj = RequestActions.find(type => type.value === request_action_cd)
    commit('mutateExtendedRequestType', reqObj)
  }
  if (getters.getNr.corpNum) {
    commit('mutateCorpNum', getters.getNr.corpNum)
  }
  if (getters.getNrState === NrState.DRAFT) {
    commit('mutateSubmissionTabComponent', 'NamesCapture')
  } else {
    commit('mutateSubmissionTabComponent', 'ApplicantInfo1')
  }
  commit('mutateDisplayedComponent', 'ExistingRequestEdit')
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

// FUTURE: not an action - move it to another module?
export const fetchCorpNum = async ({ getters }, corpNum: string): Promise<any> => {
  if (getters.getShowCorpNum) {
    if (getters.getShowCorpNum === CorpNumRequests.MRAS) {
      return checkMRAS({ getters }, corpNum)
    } else {
      return checkCOLIN({ getters }, corpNum)
    }
  }
}

// FUTURE: not an action - move it to another module?
export const checkCOLIN = ({ getters }, corpNum: string) => {
  // Remove BC prefix as Colin only supports base number with no prefix for BC's
  const cleanedCorpNum = corpNum.replace(/^BC+/i, '')
  let url = `colin/${cleanedCorpNum}`
  return axios.post(url, {})
}

// FUTURE: not an action - move it to another module?
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

// FUTURE: not an action - move it to another module?
export const getNrStateData = ({ getters }) => {
  let nrState = getters.getNrState
  if (getters.getAssumedName) nrState = NrState.ASSUMED
  let data: any
  switch (nrState) {
    case NrState.DRAFT:
      data = getters.getDraftNameReservation
      break
    case NrState.COND_RESERVED:
      data = getters.conditionalNameReservation
      break
    case NrState.RESERVED:
      data = getters.reservedNameReservation
      break
    case NrState.ASSUMED:
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

// FUTURE: not an action - move it to another module?
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
    const data = await NamexServices.patchNameRequests(getters.getNrId, getters.getRequestActionCd,
      getters.getEditNameReservation)
    if (data) {
      // FUTURE: change this flow to use the patch response instead of getting the request again and remove code below
      // FUTURE: cases where applicants can be a list or object -> make this consistent (api) + update UI accordingly
      // need to set phone/email in case they changed in the patch
      if (data.applicants instanceof Array && data.applicants.length > 0) {
        sessionStorage.setItem('BCREG-emailAddress', data.applicants[0].emailAddress)
        sessionStorage.setItem('BCREG-phoneNumber', data.applicants[0].phoneNumber)
      } else {
        sessionStorage.setItem('BCREG-emailAddress', data.applicants?.emailAddress)
        sessionStorage.setItem('BCREG-phoneNumber', data.applicants?.phoneNumber)
      }
      commit('mutateNameRequest', data)
      // FUTURE: remove checkin/checkout process (api should handle it whenever a put/patch is attempted)
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
    if (!getters.getNrId) {
      const data = getNrTypeData({ getters }, 'draft')
      request = await NamexServices.postNameRequests(getters.getRequestActionCd, data)
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
      request = await NamexServices.putNameReservation(getters.getNrId, getters.getRequestActionCd, data)
      if (request) commit('setNrResponse', request)
    }
    if (request) await dispatch('toggleConfirmNrModal', true)
  }
}

export const setCurrentJsDate: ActionIF = ({ commit }, date: Date): void => {
  commit('mutateCurrentJsDate', date)
}

export const setName: ActionIF = ({ commit }, name: string): void => {
  commit('mutateName', name)
}

export const setLocation: ActionIF = ({ commit }, location: Location): void => {
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

export const setEntityTypeCd: ActionIF = ({ commit }, entityTypeCd: EntityType): void => {
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

export const setExtendedRequestType: ActionIF = ({ commit }, extendedRequestType: SelectOptionsI): void => {
  commit('mutateExtendedRequestType', extendedRequestType)
}

export const setRequestAction: ActionIF = ({ commit }, requestAction: RequestCode): void => {
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

//
// Dialog Actions
//
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

export const setFolioNumber: ActionIF = ({ commit }, folioNumber: string): void => {
  commit('mutateFolioNumber', folioNumber)
}
/** Name Check actions
 * FUTURE: move these into a factory if converting to composition api
 */
export const getMatchesExact = async (
  { commit },
  token: string,
  cleanedName: string
): Promise<Array<ConflictListItemI>> => {
  const exactResp = await axios.get('/exact-match?query=' + cleanedName, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }).catch(() => {
    commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_EXACT)
    return null
  })
  return exactResp?.data ? parseExactNames(exactResp.data) : []
}
export const getMatchesSimilar = async (
  { commit },
  token: string,
  cleanedName: string,
  exactNames: Array<ConflictListItemI>
): Promise<Array<ConflictListItemI>> => {
  const synonymResp = await axios.get('/requests/synonymbucket/' + cleanedName + '/*', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }).catch(() => {
    commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_SIMILAR)
    return null
  })
  if (synonymResp?.data) synonymResp.data.exactNames = exactNames || []
  return synonymResp?.data ? parseSynonymNames(synonymResp.data) : []
}
export const getMatchesRestricted = async (
  { commit, getters },
  token: string,
  cleanedName: string
): Promise<ParsedRestrictedResponseIF> => {
  const restrictedResp = await axios.get(`/documents:restricted_words?content=${cleanedName}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }).catch(() => {
    commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_RESTRICTED)
    return null
  })
  return restrictedResp?.data
    ? parseRestrictedWords({ getters }, restrictedResp.data)
    : { conditionalInstructions: [], conditionalWords: [], restrictedWords: [] }
}

export const getNameAnalysis: ActionIF = async (
  { commit, getters },
  options: { xpro: boolean, designationOnly: boolean }
) => {
  const name = getters.getFullName
  try {
    if (options.designationOnly) commit('mutateAnalyzeDesignationPending', true)
    else commit('mutateAnalyzeStructurePending', true)
    commit('resetRequestExaminationOrProvideConsent')
    const params: NewRequestNameSearchI = {
      name: name,
      location: getters.getLocation,
      entity_type_cd: getters.getEntityTypeCd,
      request_action_cd: getters.getRequestActionCd,
      jurisdiction: options.xpro ? NameCheckAnalysisJurisdiction.XPRO : NameCheckAnalysisJurisdiction.BC,
      analysis_type: options.designationOnly ? NameCheckAnalysisType.DESIGNATION : NameCheckAnalysisType.STRUCTURE
    }
    const analysis = await NamexServices.nameAnalysis(params)
    // verify the user did not start a new search on a different name
    if (name === getters.getFullName) {
      const json = analysis
      commit('mutateAnalysisJSON', json)
      if (Array.isArray(json.issues) && json.issues.length > 0) {
        for (let i = 0; i < json.issues.length; i++) {
          switch (json.issues[i].issue_type) {
            case 'add_descriptive':
              commit('mutateMissingDescriptive', true)
              continue
            case 'add_distinctive':
              commit('mutateMissingDistinctive', true)
              continue
            case 'designation_non_existent':
              commit('mutateMissingDesignation', true)
              continue
            case 'designation_mismatch':
              if (Array.isArray(json.issues[i].name_actions) && json.issues[i].name_actions.length > 0) {
                let items = json.issues[i].name_actions.map(item => { return item.word })
                items = [...new Set(items)]
                commit('mutateDesignationsMismatched', items)
              }
              continue
            case 'designation_misplaced':
              if (Array.isArray(json.issues[i].name_actions) && json.issues[i].name_actions.length > 0) {
                let items = json.issues[i].name_actions.map(item => { return item.word })
                items = [...new Set(items)]
                commit('mutateDesignationsMisplaced', items)
              }
              continue
            case 'end_designation_more_than_once':
              if (Array.isArray(json.issues[i].name_actions) && json.issues[i].name_actions.length > 0) {
                let items = json.issues[i].name_actions.map(item => { return item.word })
                items = [...new Set(items)]
                commit('mutateDesignationsMisplaced', items)
              }
              continue
            case 'incorrect_year':
              if (Array.isArray(json.issues[i].name_actions) && json.issues[i].name_actions.length > 0) {
                let items = json.issues[i].name_actions.map(item => { return item.word })
                items = [...new Set(items)]
                commit('mutateNumbersCheckUse', items)
              }
              continue
            default:
              if (Array.isArray(json.issues[i].name_actions) && json.issues[i].name_actions.length > 0) {
                let items = json.issues[i].name_actions.map(item => { return item.word })
                items = [...new Set(items)]
                commit('mutateDesignationsCheckUse', items)
              }
          }
        }
      }
      if (options.designationOnly) commit('mutateAnalyzeDesignationPending', false)
      else commit('mutateAnalyzeStructurePending', false)
    }
  } catch (err) {
    // verify the user did not start a new search on a different name
    if (name === getters.getFullName) {
      const msg = await NamexServices.handleApiError(err, 'Could not get name analysis')
      console.error('getNameAnalysis() =', msg) // eslint-disable-line no-console
      if (options.designationOnly) {
        commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_DESIGNATION)
        commit('mutateAnalyzeDesignationPending', false)
      } else {
        commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_STRUCTURE)
        commit('mutateAnalyzeStructurePending', false)
      }
    }
  }
}

export const getQuickSearch = async (
  { commit, getters },
  cleanedName: CleanedNameIF,
  checks: QuickSearchParamsI
): Promise<QuickSearchParsedRespI> => {
  try {
    const quickSearchPublicId = window['quickSearchPublicId']
    const quickSearchPublicSecret = window['quickSearchPublicSecret']

    // throw error if no quickSearchPublicId or quickSearchPublicSecret
    if (!quickSearchPublicId || !quickSearchPublicSecret) {
      throw new Error('quickSearchPublicId/quickSearchPublicSecret not set in config')
    }
    const encodedAuth = btoa(`${quickSearchPublicId}:${quickSearchPublicSecret}`)

    const tokenResp = await axios.post(window['authTokenUrl'], 'grant_type=client_credentials', {
      headers: { Authorization: `Basic ${encodedAuth}`, 'content-type': 'application/x-www-form-urlencoded' }
    })
    const token = tokenResp.data.access_token
    const exactNames = checks.exact ? await getMatchesExact({ commit }, token, cleanedName.exactMatch) : []
    // pass in exactNames so that we can check for duplicates
    const synonymNames = (
      checks.similar
        ? await getMatchesSimilar({ commit }, token, cleanedName.synonymMatch, exactNames)
        : []
    )
    const parsedRestrictedResp: ParsedRestrictedResponseIF = (
      checks.restricted
        ? await getMatchesRestricted({ commit, getters }, token, cleanedName.restrictedMatch)
        : { restrictedWords: [], conditionalWords: [], conditionalInstructions: [] }
    )

    return {
      exactNames: exactNames,
      synonymNames: synonymNames,
      restrictedWords: parsedRestrictedResp.restrictedWords,
      conditionalWords: parsedRestrictedResp.conditionalWords,
      conditionalInstructions: parsedRestrictedResp.conditionalInstructions
    }
  } catch (err) {
    const msg = await NamexServices.handleApiError(err, 'Could not get quick search')
    // send error to sentry and move on to detailed search
    // (do not show error to user)
    console.error('getQuickSearch() =', msg) // eslint-disable-line no-console
    // add errors to name check for all quick search checks
    if (checks.exact) commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_EXACT)
    if (checks.similar) commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_SIMILAR)
    if (checks.restricted) commit('mutateNameCheckErrorAdd', NameCheckErrorType.ERROR_RESTRICTED)

    return {
      exactNames: [],
      synonymNames: [],
      restrictedWords: [],
      conditionalWords: [],
      conditionalInstructions: []
    }
  }
}

export const nameCheckClearError = ({ commit }, key: NameCheckErrorType): void => {
  commit('mutateNameCheckErrorClear', key)
}

export const parseExactNames = (json: { names: [string] }): Array<ConflictListItemI> => {
  let nameObjs = json?.names || []
  let names = []
  for (let i = 0; i < nameObjs.length; i++) {
    names.push({ name: `${nameObjs[i]['name']}`, type: NameCheckConflictType.EXACT })
  }
  return names
}

export const parseRestrictedWords = ({ getters }, resp: RestrictedResponseIF): ParsedRestrictedResponseIF => {
  const phrases = resp.restricted_words_conditions
  let parsedResp: ParsedRestrictedResponseIF = {
    conditionalInstructions: [],
    conditionalWords: [],
    restrictedWords: []
  }
  // restrictedWords: add any word with cnd_info[..].allow_use = N
  // conditionalWords: all other words in the list
  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i].word_info.phrase.toUpperCase()

    // ignore rules
    const entityCd = getters.getEntityTypeCd
    if (entityCd === EntityType.CR && Designations[EntityType.CC].words.includes(phrase)) continue
    if (Designations[entityCd].words.includes(phrase)) continue

    // split into restricted vs conditional
    let restricted = false
    // there can be multiple conditions per word / phrase
    for (let k in phrases[i].cnd_info) {
      if (phrases[i].cnd_info[k].allow_use === 'N') {
        restricted = true
        break
      }
    }

    // add restricted and conditional info to the response
    if (restricted) parsedResp.restrictedWords.push(phrase)
    else {
      parsedResp.conditionalWords.push(phrase)
      for (let k in phrases[i].cnd_info) {
        let info = phrases[i].cnd_info[k].text ? phrases[i].cnd_info[k].text?.trim() : ''
        if (info && !info.endsWith('.')) info = info + '.'
        const instructions = phrases[i].cnd_info[k].instructions
          ? `${info} ${phrases[i].cnd_info[k].instructions}`
          : info
        parsedResp.conditionalInstructions.push({
          word: phrase,
          instructions: instructions || 'This word needs to be reviewed by staff.'
        })
      }
    }
  }
  return parsedResp
}

export const parseSynonymNames = (
  json: {
    names: Array<string>,
    exactNames: Array<ConflictListItemI>
  }): Array<ConflictListItemI> => {
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
        names.push({ name: name, type: NameCheckConflictType.SIMILAR })
      }
    }
  }
  return names
}

export const setDesignation: ActionIF = ({ commit }, designation: string): void => {
  commit('mutateDesignation', designation)
}

export const setDoNameCheck: ActionIF = ({ commit }, check: boolean): void => {
  commit('mutateDoNameCheck', check)
}

export const startAnalyzeName: ActionIF = async ({ commit, getters }) => {
  resetAnalyzeName({ commit, getters })
  setUserCancelledAnalysis({ commit, getters }, false)
  /* validation */
  if (!getters.getRequestActionCd) commit('setErrors', 'request_action_cd')
  if (!getters.getLocation) commit('setErrors', 'location')
  if (!getters.getEntityTypeCd) commit('setErrors', 'entity_type_cd')
  // if designation selection is required
  if (!getters.getIsXproMras && Designations[getters.getEntityTypeCd]?.end) {
    if (!getters.getDesignation) commit('setErrors', 'designation')
  }
  if ([Location.CA, Location.IN].includes(getters.getLocation) &&
    ![RequestCode.MVE].includes(getters.getRequestActionCd) && !getters.getRequestJurisdictionCd) {
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
  // prep name for analysis
  let name = removeAccents(getters.getName)
  name = name.toUpperCase()
  // auto fix LTD/INC/CORP designations without a period unless xpro
  if (!getters.getIsXproMras) {
    name = name.replace(/^LTD$/g, 'LTD.')
      .replace(/^LTD\s/g, 'LTD. ')
      .replace(/\sLTD\s/g, ' LTD. ')
      .replace(/\sLTD$/g, ' LTD.')
      .replace(/^INC$/g, 'INC.')
      .replace(/^INC\s/g, 'INC. ')
      .replace(/\sINC\s/g, ' INC. ')
      .replace(/\sINC$/g, ' INC.')
      .replace(/^CORP$/g, 'CORP.')
      .replace(/^CORP\s/g, 'CORP. ')
      .replace(/\sCORP\s/g, ' CORP. ')
      .replace(/\sCORP$/g, ' CORP.')
  }
  commit('mutateName', name)
  const designation = getters.getDesignation
  commit('mutateFullName', `${name} ${designation}`)
  commit('mutateNameOriginal', name) // Set original name for reset baseline
  /* xpro get name call */
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
  /* name check */
  if (getters.getDoNameCheck) {
    commit('mutateAnalyzeDesignationPending', true)
    commit('mutateAnalyzeStructurePending', true)
    commit('mutateAnalyzeConflictsPending', true)
    commit('mutateDisplayedComponent', 'NameCheck')
    // similar name check / conditional + restricted word check
    startQuickSearch({ commit, getters }, { exact: true, similar: true, restricted: true })
    // we don't do a structure name check for xpro names
    if (getters.getIsXproMras) {
      commit('mutateAnalyzeDesignationPending', false)
      commit('mutateAnalyzeStructurePending', false)
    } else {
      // designation check
      getNameAnalysis(
        { commit, getters },
        { xpro: false, designationOnly: true })
      // descriptive/distinctive check - if disabled in LD then ignore
      if (getFeatureFlag('disable-analysis')) {
        commit('mutateAnalyzeStructurePending', false)
      } else {
        getNameAnalysis(
          { commit, getters },
          { xpro: false, designationOnly: false })
      }
      // special chars
      const specialChars = name.match(/[~`$%_{}|\\<>]/g)
      if (specialChars) commit('mutateSpecialCharacters', specialChars)
      else commit('mutateSpecialCharacters', [])
      // extra designation rules that aren't in the backend for coops/cccs
      const entity_type_cd = getters.getEntityTypeCd
      if ([EntityType.CP, EntityType.XCP, EntityType.CC].includes(entity_type_cd)) {
        let entityPhraseChoices = []
        let basePhrases = Designations[entity_type_cd].words
        // these are the inner phrases for the CCC and CP types.  Filtering out CR designations from CPs has no effect
        // and CCC designations are a mix of CR-type ending designations and CCC specific inner phrases so filter out
        // the CR designations for the purposes of this getter
        entityPhraseChoices = basePhrases.filter(phrase => !Designations[EntityType.CR].words.includes(phrase))
        if (entityPhraseChoices.some(phrase => name.startsWith(phrase))) {
          let phrase = name.split(' ')[0].replace('COMMUNITY', 'COMMUNITY CONTRIBUTION COMPANY')
          commit('mutateDesignationsCheckUse', [phrase])
        } else if (entityPhraseChoices.every(phrase => {
          phrase = phrase.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
          return (name.search(new RegExp('(\\s)' + phrase + '(\\s|$)')) === -1)
        })) {
          commit('mutateMissingDesignation', true)
        }
      }
    }
  } else {
    // skip name check
    commit('mutateAnalyzeDesignationPending', false)
    commit('mutateAnalyzeStructurePending', false)
    commit('mutateAnalyzeConflictsPending', false)
    setActiveComponent({ commit }, 'NamesCapture')
  }
}
export const startQuickSearch = async ({ commit, getters }, checks: QuickSearchParamsI) => {
  commit('mutateAnalyzeConflictsPending', true)
  if (getters.getFullName) {
    const name = getters.getFullName
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
      .replace(/(`|~|!|\||\(|\)|\[|\]|\{|\}|:|"|\^|#|%|\?|,|\*|)/g, '')

    const cleanedName = {
      'exactMatch': exactMatchName,
      'synonymMatch': synonymsName,
      'restrictedMatch': getters.getName
    }
    const resp = await getQuickSearch({ commit, getters }, cleanedName, checks)
    // make sure a new search on a different name has not started
    if (getters.getFullName === name) {
      if (checks.exact) commit('mutateConflictsExact', resp.exactNames)
      if (checks.similar) commit('mutateConflictsSimilar', resp.synonymNames)
      if (checks.restricted) {
        commit('mutateConflictsRestricted', resp.restrictedWords)
        commit('mutateConflictsConditional', resp.conditionalWords)
        commit('mutateConflictsConditionalInstructions', resp.conditionalInstructions)
      }

      commit('mutateAnalyzeConflictsPending', false)
    }
  }
}
