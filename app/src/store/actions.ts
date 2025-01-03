import querystring from 'qs'
import axios from 'axios'
import {
  CompanyTypes,
  EntityStates,
  EntityTypes,
  Location,
  NameCheckAnalysisJurisdiction,
  NameCheckAnalysisType,
  NameCheckConflictType,
  NameCheckErrorType,
  NrAffiliationErrors,
  NrRequestActionCodes,
  NrState,
  NrType,
  XproNameType
} from '@/enums'
import { BAD_REQUEST, NOT_FOUND, OK, SERVICE_UNAVAILABLE } from 'http-status-codes'
import removeAccents from 'remove-accents'
import { GetFeatureFlag, Sleep, sanitizeName } from '@/plugins'
import NamexServices from '@/services/namex-services'
import { DFLT_MIN_LENGTH, DFLT_MAX_LENGTH, MRAS_MIN_LENGTH, MRAS_MAX_LENGTH }
  from '@/components/new-request/constants'

// List Data
import { CanJurisdictions, Designations, IntlJurisdictions, RequestActions } from '@/list-data'

// Interfaces
import {
  BusinessSearchIF,
  CleanedNameIF,
  ConflictListItemI,
  ConversionTypesI,
  NameRequestI,
  NewRequestNameSearchI,
  ParsedRestrictedResponseIF,
  QuickSearchParamsI,
  QuickSearchParsedRespI,
  RefundParamsIF,
  RequestActionsI,
  RestrictedResponseIF,
  SelectOptionsI,
  StatsI,
  StaffPaymentIF,
  SubmissionTypeT
} from '@/interfaces'

const qs: any = querystring // eslint-disable-line @typescript-eslint/no-unused-vars
let source: any

export const setActiveComponent = ({ commit }, component): void => {
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
export const confirmAction = async ({ commit }, action: string): Promise<boolean> => {
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

export const findNameRequest = async ({ commit, getters }): Promise<void> => {
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
export const loadExistingNameRequest = async ({ commit }, nrData: any): Promise<void> => {
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

export const setStats = async ({ commit }, stats: StatsI): Promise<void> => {
  commit('mutateStats', stats)
}

export const userClickedStopAnalysis = ({ commit }): void => {
  commit('mutateUserCancelledAnalysis', true)
  commit('mutateSubmissionType', 'examination')
}

export const resetAnalyzeName = ({ commit, getters }): void => {
  commit('clearAssumedNameOriginal')
  if (!getters.getUserCancelledAnalysis) {
    commit('mutateAnalysisJSON', null)
  }
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

export const cancelAnalyzeName = ({ commit, getters }, destination: string): void => {
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

export const cancelEditExistingRequest = ({ commit }): void => {
  commit('mutateDisplayedComponent', 'ExistingRequestDisplay')
  commit('resetApplicantDetails')
  commit('mutateNameChoicesToInitialState')
  commit('resetApplicantDetails', '')
  commit('resetNrData')
  commit('mutateEditMode', false)
}

// called to commit data into "newRequestModel" object
const commitExistingData = ({ commit, getters }): void => {
  commit('populateApplicantData')
  commit('populateNrData')
  if (['clientFirstName', 'clientLastName', 'contact'].some(field => !!getters.getNr.applicants[field])) {
    commit('mutateActingOnOwnBehalf', false)
  }
  const { entity_type_cd } = getters.getNr
  if (getters.getEntityTypesBC.some(type => type.value === entity_type_cd)) {
    commit('mutateLocation', Location.BC)
  } else if (getters.getNr.xproJurisdiction) {
    const { xproJurisdiction } = getters.getNr
    let location: Location
    for (const key of ['value', 'text']) {
      if (CanJurisdictions.some(j => j[key].toUpperCase() === xproJurisdiction.toUpperCase())) {
        location = Location.CA
        break
      }
      if (IntlJurisdictions.some(j => j[key].toUpperCase() === xproJurisdiction.toUpperCase())) {
        location = Location.IN
        break
      }
    }
    commit('mutateLocation', location)
  }
  commit('mutateEntityType', entity_type_cd)
  if (!getters.getEntityTypeOptions.some(option => option.value === entity_type_cd)) {
    const obj = getters.getEntityTypesBC.find(entity => entity.value === entity_type_cd)
      ? getters.getEntityTypesBC.find(entity => entity.value === entity_type_cd)
      : getters.getEntityTypesXPRO.find(entity => entity.value === entity_type_cd)
    commit('mutateEntityTypeAddToSelect', obj)
  }
  const { requestTypeCd } = getters.getNr
  let { request_action_cd } = getters.getNr
  if (
    [XproNameType.AS, XproNameType.AL, XproNameType.XASO, XproNameType.XCASO, XproNameType.UA].includes(requestTypeCd)
  ) {
    request_action_cd = NrRequestActionCodes.ASSUMED
  }
  commit('mutateRequestAction', request_action_cd)
  if (request_action_cd !== NrRequestActionCodes.NEW_BUSINESS) {
    const reqObj = RequestActions.find(type => type.value === request_action_cd)
    commit('mutateExtendedRequestType', reqObj)
  }
  if (getters.getNr.corpNum) {
    commit('mutateCorpNum', getters.getNr.corpNum)
  }
}

export const editExistingRequest = ({ commit, getters }): void => {
  commit('mutateEditMode', true)
  commitExistingData({ commit, getters })
  if (getters.getNrState === NrState.DRAFT) {
    commit('mutateSubmissionTabComponent', 'NamesCapture')
  } else {
    commit('mutateSubmissionTabComponent', 'ApplicantInfo1')
  }
  commit('mutateDisplayedComponent', 'ExistingRequestEdit')
}

export const setApplicantDetails = ({ commit }, appKV): void => {
  commit('mutateApplicant', appKV)
  if (!appKV || !appKV.value || appKV.key !== 'addrLine1') {
    commit('mutateAddressSuggestions', null)
  }
}

export const setAddressSuggestions = ({ commit }, addressSuggestions: any[]): void => {
  commit('mutateAddressSuggestions', addressSuggestions)
}

/**
 * Searches Entities or COLIN to fetch a business' info.
 * @param corpNum the business identifier to search for
 * @returns a resolved promise on success or a rejected promise on failure
 */
// FUTURE: not an action - move it to another module?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function searchBusiness ({ getters }, corpNum: string): Promise<BusinessSearchIF> {
  try {
    // first try to find business in Entities (Legal API)
    const data = await NamexServices.searchEntities(corpNum)
    // for restoration requests, verify business eligibility
    if (getters.isRestoration && data.state !== EntityStates.HISTORICAL) {
      // check if business is eligible for restoration by verifying restorationExpiryDate exists and not expired
      if (!data.restorationExpiryDate ||
        getters.getCurrentJsDate.toISOString().slice(0, 10) > data.restorationExpiryDate) {
        throw new Error('This business is not eligible for restoration name request')
      }
    }

    return {
      identifier: data.identifier,
      legalName: data.legalName,
      legalType: data.legalType,
      state: data.state
    }
  } catch (error) {
    if ((error as any).response?.status === NOT_FOUND) {
      // now try to find business in COLIN
      try {
        const data = await NamexServices.searchColin(corpNum)
        return {
          identifier: corpNum,
          legalName: data.legalName,
          legalType: data.legalType,
          state: data.state
        }
      } catch (error) {
        return Promise.reject(error) // network error
      }
    }

    return Promise.reject(error) // network error
  }
}

export const fetchMRASProfile = async ({ commit, getters }): Promise<any> => {
  if (getters.getCorpSearch) {
    try {
      const url = `mras-profile/${getters.getJurisdictionCd}/${getters.getCorpSearch}`
      const response = await axios.get(url)
      if (response?.status === OK) {
        return response.data
      }
      throw new Error(`Status was not 200, response = ${response}`)
    } catch (error) {
      const err = error as any
      const status: number = err?.response?.status
      // do not generate console error for the errors codes
      // that mras-search-info page handles
      if (![BAD_REQUEST, NOT_FOUND, SERVICE_UNAVAILABLE].includes(status)) {
        const msg = await NamexServices.handleApiError(err, 'Could not fetch mras profile')
        console.error('fetchMRASProfile() =', msg) // eslint-disable-line no-console
      }
      commit('mutateName', '')
      commit('mutateMrasSearchResult', status)
      commit('mutateMrasSearchInfoModalVisible', true)
    }
  }
  return null
}

// FUTURE: not an action - move it to another module?
export const getNrStateData = ({ getters }): any => {
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
export const getNrTypeData = ({ getters }, type: NrType): any => {
  if (getters.getAssumedName) type = NrType.ASSUMED
  switch (type) {
    case NrType.ASSUMED:
    case NrType.DRAFT:
      return getters.getDraftNameReservation
    case NrType.CONDITIONAL:
      return getters.getConditionalNameReservation
    case NrType.RESERVED:
      return getters.getReservedNameReservation
  }
  return undefined // should never happen
}

/** Submits an edited NR or a new name submission. */
export const submit = async ({ commit, getters, dispatch }): Promise<any> => {
  if (getters.getEditMode) {
    // FUTURE: Refactor the way these async requests are used to provide conditional booleans
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
        // cancel edit mode
        commit('mutateEditMode', false)

        // show success page briefly
        commit('mutateDisplayedComponent', 'Success')
        await Sleep(1000)

        // reload NR and show existing NR component
        const nrData = await NamexServices.getNameRequest(true)
        if (nrData) loadExistingNameRequest({ commit }, nrData)
      }
    }
  } else {
    let request
    if (!getters.getNrId) {
      const data = getNrTypeData({ getters }, NrType.DRAFT)
      request = await NamexServices.postNameRequest(getters.getRequestActionCd, data)
      if (request) commit('setNrResponse', request)
    } else {
      const data = getNrStateData({ getters })
      if (!getters.isEditMode && [NrState.COND_RESERVED, NrState.RESERVED].includes(getters.getNrState)) {
        request = await NamexServices.getNameRequest(true)
        if (request?.stateCd === NrState.CANCELLED) {
          setActiveComponent({ commit }, 'Timeout')
          return
        }
      }
      request = await NamexServices.putNameReservation(getters.getNrId, getters.getRequestActionCd, data)
      if (request) commit('setNrResponse', request)
    }
    if (request) await dispatch('toggleConfirmNrModal', true)
  }
}

/**
 * Re-submits an expired NR (without changing the current NR data).
 */
export const resubmit = async ({ commit, getters }): Promise<boolean> => {
  // safety check
  if (getters.getEditMode) {
    console.error('resubmit() - should not be edit mode') // eslint-disable-line no-console
    return false
  }

  // get current NR data
  const nrData = getters.getNr

  // safety check
  if (!nrData) {
    console.error('resubmit() - could not get current NR data') // eslint-disable-line no-console
    return false
  }

  // commit the original NR's data
  commitExistingData({ commit, getters })

  // build the request data
  const nrTypeData = getNrTypeData({ getters }, NrType.DRAFT)

  // add resubmit NR number (for internal use only - API ignores it)
  nrTypeData['resubmitNrNum'] = nrData['nrNum']
  // check against entity types if it should have designation or not : if length returns to be 0
  // then NR should not have any designation otherwise work as getNameDesignation
  const checkEntityType = (Designations[nrData['entity_type_cd']].words.length === 0)
  // clean names data
  nrTypeData['names'] = nrData.names.map(name => ({
    choice: name.choice,
    consent_words: '',
    conflict1: '',
    conflict1_num: '',
    designation: !checkEntityType ? getNameDesignation(name) : '',
    name: name.name,
    name_type_cd: name.name_type_cd
  }))

  // clean applicants partyIds
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [key, value] of Object.entries(nrTypeData['applicants'])) {
    value['partyId'] = ''
  }

  // post new NR
  const request = await NamexServices.postNameRequest(getters.getRequestActionCd, nrTypeData)
  if (request) {
    commit('setNrResponse', request)
    return true
  }

  return false
}

/**
 * Sometimes name objects have a null designation (because the designation is part of the name).
 * This helper returns the designation, if there is one, or the last word of the name, which is
 * assumed to be the designation.
 */
function getNameDesignation (name: any): string {
  if (name.designation) return name.designation
  const words = name.name.split(' ')
  const len = words.length
  return words[len - 1]
}

export const setCurrentJsDate = ({ commit }, date: Date): void => {
  commit('mutateCurrentJsDate', date)
}

export const setName = ({ commit }, name: string): void => {
  commit('mutateName', name)
}

export const setLocation = ({ commit }, location: Location): void => {
  commit('mutateLocation', location)
}

export const setDisplayedComponent = ({ commit }, component: string): void => {
  commit('mutateDisplayedComponent', component)
}

export const setTabNumber = ({ commit }, tabNumber: number): void => {
  commit('mutateTabNumber', tabNumber)
}

export const setCorpSearch = ({ commit }, corpSearch: string): void => {
  commit('mutateCorpSearch', corpSearch)
}

export const setEntityTypeCd = ({ commit }, entityTypeCd: EntityTypes): void => {
  commit('mutateEntityType', entityTypeCd)
}

export const setOriginEntityTypeCd = ({ commit }, originEntityTypeCd: EntityTypes): void => {
  commit('mutateOriginEntityType', originEntityTypeCd)
}

export const setConversionType = ({ commit }, conversionType: string): void => {
  commit('mutateConversionType', conversionType)
}

export const setJurisdictionCd = ({ commit }, jurisdictionCd: string): void => {
  commit('mutateJurisdictionCd', jurisdictionCd)
}

export const setIsLearBusiness = ({ commit }, isLearBusiness: boolean): void => {
  commit('mutateIsLearBusiness', isLearBusiness)
}

export const setIsPersonsName = ({ commit }, isPersonsName: boolean): void => {
  commit('mutateIsPersonsName', isPersonsName)
}

export const setNameIsEnglish = ({ commit }, isEnglishName: boolean): void => {
  commit('mutateNameIsEnglish', isEnglishName)
}

export const setNoCorpNum = ({ commit }, noCorpNum: boolean): void => {
  commit('mutateNoCorpNum', noCorpNum)
}

export const setExtendedRequestType = ({ commit }, extendedRequestType: SelectOptionsI): void => {
  commit('mutateExtendedRequestType', extendedRequestType)
}

export const setRequestAction = ({ commit }, requestAction: NrRequestActionCodes): void => {
  commit('mutateRequestAction', requestAction)
}

export const setConversionTypeAddToSelect = ({ commit }, conversionType: ConversionTypesI): void => {
  commit('mutateConversionTypeAddToSelect', conversionType)
}

export const setEntityTypeAddToSelect = ({ commit }, entityType: SelectOptionsI): void => {
  commit('mutateEntityTypeAddToSelect', entityType)
}

export const setClearErrors = ({ commit }): void => {
  commit('clearErrors')
}

export const setUserCancelledAnalysis = ({ commit }, cancelledAnalysis: boolean): void => {
  commit('mutateUserCancelledAnalysis', cancelledAnalysis)
}

export const setNameRequest = ({ commit }, nameRequest: NameRequestI): void => {
  commit('mutateNameRequest', nameRequest)
}

export const setExistingRequestSearch = (
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

export const setNrResponse = ({ commit }, request: NameRequestI): void => {
  commit('setNrResponse', request)
}

export const setSubmissionTabNumber = ({ commit }, tabNumber: number): void => {
  commit('mutateSubmissionTabNumber', tabNumber)
}

export const setSubmissionType = ({ commit }, submissionType: SubmissionTypeT): void => {
  commit('mutateSubmissionType', submissionType)
}

export const setCorpNum = ({ commit }, corpNum: string): void => {
  commit('mutateCorpNum', corpNum)
}

export const setActingOnOwnBehalf = ({ commit }, isActingOnOwn: boolean): void => {
  commit('mutateActingOnOwnBehalf', isActingOnOwn)
}

export const setNRData = ({ commit }, nrData: any): void => {
  commit('mutateNRData', nrData)
}

export const setEditMode = ({ commit }, editMode: boolean): void => {
  commit('mutateEditMode', editMode)
}

export const setAssumedNameOriginal = ({ commit }): void => {
  commit('mutateAssumedNameOriginal')
}

export const setNameChoicesToInitialState = ({ commit }): void => {
  commit('mutateNameChoicesToInitialState')
}

export const setNameChoices = ({ commit }, choiceObj: any): void => {
  commit('mutateNameChoices', choiceObj)
}

export const setPriorityRequest = ({ commit }, isPriorityRequest: boolean): void => {
  commit('mutatePriorityRequest', isPriorityRequest)
}

export const setIsLoadingSubmission = ({ commit }, isLoading: boolean): void => {
  commit('mutateIsLoadingSubmission', isLoading)
}

export const setShowActualInput = ({ commit }, showInput: boolean): void => {
  commit('mutateShowActualInput', showInput)
}

//
// Dialog Actions
//
export const setPickEntityModalVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutatePickEntityModalVisible', isVisible)
}

export const setMrasSearchInfoModalVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutateMrasSearchInfoModalVisible', isVisible)
}

export const setExitModalVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutateExitModalVisible', isVisible)
}

export const setExitIncompletePaymentVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutateExitIncompletePaymentVisible', isVisible)
}

export const setSubmissionTabComponent = ({ commit }, isVisible: boolean): void => {
  commit('mutateSubmissionTabComponent', isVisible)
}

export const setConditionsModalVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutateConditionsModalVisible', isVisible)
}

export const setAffiliationErrorModalValue = ({ commit }, modalValue: NrAffiliationErrors): void => {
  commit('mutateAffiliationErrorModalValue', modalValue)
}

export const setHelpMeChooseModalVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutateHelpMeChooseModalVisible', isVisible)
}

export const setNrRequiredModalVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutateNrRequiredModalVisible', isVisible)
}

export const setSocietiesModalVisible = ({ commit }, isVisible: boolean): void => {
  commit('mutateSocietiesModalVisible', isVisible)
}

export const setRequestExaminationOrProvideConsent = ({ commit }, requestExamOrConsent: any): void => {
  commit('mutateRequestExaminationOrProvideConsent', requestExamOrConsent)
}

export const setKeycloakRoles = ({ commit }, keycloakRoles: string[]): void => {
  commit('mutateKeycloakRoles', keycloakRoles)
}

export const setStaffPayment = ({ commit }, staffPayment: StaffPaymentIF): void => {
  commit('mutateStaffPayment', staffPayment)
}

export const setFolioNumber = ({ commit }, folioNumber: string): void => {
  commit('mutateFolioNumber', folioNumber)
}

export const setWindowWidth = ({ commit }, width: number): void => {
  commit('mutateWindowWidth', width)
}

export const setHotjarUserId = ({ commit }, hotjarUserId: string): void => {
  commit('mutateHotjarUserId', hotjarUserId)
}

/**
 * Name Check actions
 * FUTURE: move these into a factory if converting to composition api
 */
const getMatchesExact = async (
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

const getMatchesSimilar = async (
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

const getMatchesRestricted = async (
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

export const getNameAnalysis = async (
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

const getQuickSearch = async (
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

const parseExactNames = (json: { names: [string] }): Array<ConflictListItemI> => {
  const nameObjs = json?.names || []
  const names = []
  for (let i = 0; i < nameObjs.length; i++) {
    names.push({ name: `${nameObjs[i]['name']}`, type: NameCheckConflictType.EXACT })
  }
  return names
}

const parseRestrictedWords = ({ getters }, resp: RestrictedResponseIF): ParsedRestrictedResponseIF => {
  const phrases = resp.restricted_words_conditions
  const parsedResp: ParsedRestrictedResponseIF = {
    conditionalInstructions: [],
    conditionalWords: [],
    restrictedWords: []
  }
  // restrictedWords: add any word with cnd_info[..].allow_use = N
  // conditionalWords: all other words in the list
  for (let i = 0; i < phrases.length; i++) {
    const phrase = phrases[i].word_info.phrase.toUpperCase()

    // rules for ignoring restricted/conditional phrases
    const entityCd = getters.getEntityTypeCd
    if (entityCd === EntityTypes.CR && Designations[EntityTypes.CC].words.includes(phrase)) continue
    if (Designations[entityCd].words.includes(phrase)) continue

    // split into restricted vs conditional
    let restricted = false
    // there can be multiple conditions per word / phrase
    for (const k in phrases[i].cnd_info) {
      if (phrases[i].cnd_info[k].allow_use === 'N') {
        restricted = true
        break
      }
    }

    // add restricted and conditional info to the response
    if (restricted) parsedResp.restrictedWords.push(phrase)
    else {
      parsedResp.conditionalWords.push(phrase)
      for (const k in phrases[i].cnd_info) {
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

const parseSynonymNames = (
  json: {
    names: Array<string>,
    exactNames: Array<ConflictListItemI>
  }): Array<ConflictListItemI> => {
  const duplicateNames = []
  for (let i = 0; i < json.exactNames.length; i++) {
    duplicateNames.push(json.exactNames[i].name)
  }
  const nameObjs = json.names
  const names = []
  for (let i = 0; i < nameObjs.length; i++) {
    if (nameObjs[i]['name_info']['id']) {
      const name = nameObjs[i]['name_info']['name']
      if (!duplicateNames.includes(name)) {
        names.push({ name: name, type: NameCheckConflictType.SIMILAR })
      }
    }
  }
  return names
}

export const setDesignation = ({ commit }, designation: string): void => {
  commit('mutateDesignation', designation)
}

export const setDoNameCheck = ({ commit }, check: boolean): void => {
  commit('mutateDoNameCheck', check)
}

export const startEditName = ({ commit, getters }) => {
  if (!getters.getEntityTypeCd) commit('setErrors', 'entity_type_cd')
}

export const startAnalyzeName = async ({ commit, getters }) => {
  resetAnalyzeName({ commit, getters })
  setUserCancelledAnalysis({ commit }, false)

  // check basic state values
  if (!getters.getRequestActionCd) commit('setErrors', 'request_action_cd')
  if (!getters.getLocation) commit('setErrors', 'location')
  if (!getters.getEntityTypeCd) commit('setErrors', 'entity_type_cd')

  // check if designation selection is required and present
  if (!getters.isXproFlow && Designations[getters.getEntityTypeCd]?.end) {
    if (!getters.getDesignation) commit('setErrors', 'designation')
  }

  // check if jurisdiction selection is required and present
  if (
    [Location.CA, Location.IN].includes(getters.getLocation) &&
    ![NrRequestActionCodes.MOVE].includes(getters.getRequestActionCd) &&
    !getters.getJurisdictionCd
  ) {
    commit('setErrors', 'jurisdiction')
    return
  }

  if (!getters.getCorpSearch) {
    if (!getters.getName) {
      commit('setErrors', 'name')
      return
    }

    const min = getters.isXproFlow ? MRAS_MIN_LENGTH : DFLT_MIN_LENGTH
    const max = getters.isXproFlow ? MRAS_MAX_LENGTH : DFLT_MAX_LENGTH

    if (getters.getName.length < min) {
      commit('setErrors', 'min_length')
      return
    }
    if (getters.getName.length > max) {
      commit('setErrors', 'max_length')
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
  if (!getters.isXproFlow) {
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

  // xpro get name call
  if (getters.isXproFlow) {
    commit('mutateXproJurisdiction', getters.getJurisdictionText)
    // set home juris num only if we have a corp num
    // (don't set if we entered a corp name instead)
    if (!getters.getHasNoCorpNum) {
      commit('mutateHomeJurisNum', getters.getCorpSearch)
    }
    // only make MRAS call for MRAS jurisdictions and if we have a corp num
    if (getters.isMrasJurisdiction && !getters.getHasNoCorpNum) {
      const profile = await fetchMRASProfile({ commit, getters })
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

  // name check
  if (getters.getDoNameCheck) {
    commit('mutateAnalyzeDesignationPending', true)
    commit('mutateAnalyzeStructurePending', true)
    commit('mutateAnalyzeConflictsPending', true)
    commit('mutateDisplayedComponent', 'NameCheck')
    // similar name check / conditional + restricted word check
    startQuickSearch({ commit, getters }, { exact: true, similar: true, restricted: true })
    // we don't do a structure name check for xpro names
    if (getters.isXproFlow) {
      commit('mutateAnalyzeDesignationPending', false)
      commit('mutateAnalyzeStructurePending', false)
    } else {
      // designation check
      getNameAnalysis(
        { commit, getters },
        { xpro: false, designationOnly: true })
      // descriptive/distinctive check - if disabled in LD then ignore
      if (GetFeatureFlag('disable-analysis')) {
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
      if ([EntityTypes.CP, EntityTypes.XCP, EntityTypes.CC].includes(entity_type_cd)) {
        let entityPhraseChoices = []
        const basePhrases = Designations[entity_type_cd].words
        // these are the inner phrases for the CCC and CP types.  Filtering out CR designations from CPs has no effect
        // and CCC designations are a mix of CR-type ending designations and CCC specific inner phrases so filter out
        // the CR designations for the purposes of this getter
        entityPhraseChoices = basePhrases.filter(phrase => !Designations[EntityTypes.CR].words.includes(phrase))
        if (entityPhraseChoices.some(phrase => name.startsWith(phrase))) {
          const phrase = name.split(' ')[0].replace('COMMUNITY', 'COMMUNITY CONTRIBUTION COMPANY')
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

export const setRefundParams = ({ commit }, refundParams: RefundParamsIF): void => {
  commit('mutateRefundParams', refundParams)
}

export const setIncorporateNowErrorStatus = ({ commit }, errorIncorporateNow: boolean): void => {
  commit('mutateIncorporateNowErrorStatus', errorIncorporateNow)
}

export const setAmalgamateNowErrorStatus = ({ commit }, errorAmalgamateNow: boolean): void => {
  commit('mutateAmalgamateNowErrorStatus', errorAmalgamateNow)
}

export const setContinuationInErrorStatus = ({ commit }, errorContinuationIn: boolean): void => {
  commit('mutateContinuationInErrorStatus', errorContinuationIn)
}

export const setSearchBusiness = ({ commit }, val: BusinessSearchIF): void => {
  commit('mutateSearchBusiness', val)
}

export const setSearchCompanyType = ({ commit }, val: CompanyTypes): void => {
  commit('mutateSearchCompanyType', val)
}

export const setSearchJurisdiction = ({ commit }, val: any): void => {
  commit('mutateSearchJurisdiction', val)
}

export const setSearchRequest = ({ commit }, val: RequestActionsI): void => {
  commit('mutateSearchRequest', val)
}
