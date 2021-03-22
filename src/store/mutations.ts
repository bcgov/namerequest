import Vue from 'vue'
import { StateIF } from '@/interfaces/state-interface'
import {
  AnalysisJSONI,
  ConversionTypesI,
  LocationT,
  NameRequestI,
  SelectOptionsI,
  StatsI,
  SubmissionTypeT, WaitingAddressSearchI
} from '@/interfaces/models'

export const clearErrors = (state: StateIF) => {
  state.stateModel.newRequestModel.errors = []
}

export const mutateActingOnOwnBehalf = (state: StateIF, actingOnOwnBehalf: boolean) => {
  state.stateModel.newRequestModel.actingOnOwnBehalf = actingOnOwnBehalf
}

export const mutateAddressSuggestions = (state: StateIF, addressSuggestions: any[]) => {
  if (!addressSuggestions) {
    state.stateModel.newRequestModel.addressSuggestions = null
  } else {
    state.stateModel.newRequestModel.addressSuggestions = Object.assign([], addressSuggestions)
  }
}

export const mutateAnalysisJSON = (state: StateIF, analysisJSON: AnalysisJSONI) => {
  state.stateModel.newRequestModel.analysisJSON = analysisJSON
}

export const mutateApplicant = (state: StateIF, appKV: any) => {
  if (Array.isArray(appKV)) {
    for (let address of appKV) {
      state.stateModel.newRequestModel.applicant[address.name] = address.value
    }
  }
  if (appKV.key === 'postalCd') {
    appKV.value = appKV.value.toUpperCase()
  }
  state.stateModel.newRequestModel.applicant[appKV.key] = appKV.value
}

export const mutateConflictId = (state: StateIF, conflictId: string) => {
  state.stateModel.newRequestModel.conflictId = conflictId
}

export const mutateConversionType = (state: StateIF, conversionType: string) => {
  state.stateModel.newRequestModel.conversionType = conversionType
}

export const mutateConversionTypeAddToSelect = (state: StateIF, conversionTypeAddToSelect: ConversionTypesI) => {
  state.stateModel.newRequestModel.conversionTypeAddToSelect = conversionTypeAddToSelect
}

export const mutateCorpNum = (state: StateIF, corpNum: string) => {
  state.stateModel.newRequestModel.corpNum = corpNum
}

export const mutateCorpSearch = (state: StateIF, corpNum: string) => {
  state.stateModel.newRequestModel.corpSearch = corpNum
}

export const mutateDisplayedComponent = (state: StateIF, componentName: string) => {
  state.stateModel.newRequestModel.displayedComponent = componentName
}

export const mutateEditMode = (state: StateIF, editMode: boolean) => {
  state.stateModel.newRequestModel.editMode = editMode
}

export const mutateEntityType = (state: StateIF, entity_type_cd: string) => {
  state.stateModel.newRequestModel.entity_type_cd = entity_type_cd
}

export const mutateEntityTypeAddToSelect = (state: StateIF, entityTypeAddToSelect: SelectOptionsI) => {
  state.stateModel.newRequestModel.entityTypeAddToSelect = entityTypeAddToSelect
}

export const resetEntityTypeAddToSelect = (state: StateIF) => {
  state.stateModel.newRequestModel.entityTypeAddToSelect = null
}

export const mutateExistingRequestSearch = (state: StateIF, { key, value }) => {
  state.stateModel.newRequestModel.existingRequestSearch[key] = value
}

export const mutateExistingRequestSearchToInitialState = (state: StateIF) => {
  state.stateModel.newRequestModel.existingRequestSearch = {
    emailAddress: '',
    nrNum: '',
    phoneNumber: ''
  }
}

export const mutateExtendedRequestType = (state: StateIF, extendedRequestType: SelectOptionsI) => {
  state.stateModel.newRequestModel.extendedRequestType = extendedRequestType
}

export const mutateGetNameReservationFailed = (state: StateIF, getNameReservationFailed: boolean) => {
  state.stateModel.newRequestModel.getNameReservationFailed = getNameReservationFailed
}

export const mutateHelpMeChooseModalVisible = (state: StateIF, helpMeChooseModalVisible: boolean) => {
  state.stateModel.newRequestModel.helpMeChooseModalVisible = helpMeChooseModalVisible
}

export const mutateIncorporateLoginModalVisible = (state: StateIF, incorporateLoginModalVisible: boolean) => {
  state.stateModel.newRequestModel.incorporateLoginModalVisible = incorporateLoginModalVisible
}

export const mutateAffiliationErrorModalVisible = (state: StateIF, affiliationErrorModalVisible: boolean) => {
  state.stateModel.newRequestModel.affiliationErrorModalVisible = affiliationErrorModalVisible
}

export const mutateIsPersonsName = (state: StateIF, isPersonsName: boolean) => {
  state.stateModel.newRequestModel.isPersonsName = isPersonsName
}

export const mutateLocation = (state: StateIF, location: LocationT) => {
  if (location === state.stateModel.newRequestModel.location) {
    return
  }
  // entity type needs to be reset when the location changes (options depend on location)
  state.stateModel.newRequestModel.entity_type_cd = ''
  if (location === 'INFO') {
    state.stateModel.newRequestModel.location = location
    return
  }
  if (state.stateModel.newRequestModel.location === 'CA' || state.stateModel.newRequestModel.location === 'IN') {
    if (location === 'CA' || location === 'IN') {
      state.stateModel.newRequestModel.location = location
      return
    }
  }
  state.stateModel.newRequestModel.entityTypeAddToSelect = null
  state.stateModel.newRequestModel.location = location
}

export const mutateLocationInfoModalVisible = (state: StateIF, locationInfoModalVisible: boolean) => {
  state.stateModel.newRequestModel.locationInfoModalVisible = locationInfoModalVisible
}

export const mutateMrasSearchResult = (state: StateIF, mrasSearchResultCode: number) => {
  state.stateModel.newRequestModel.mrasSearchResultCode = mrasSearchResultCode
}

export const mutateMrasSearchInfoModalVisible = (state: StateIF, mrasSearchInfoModalVisible: boolean) => {
  state.stateModel.newRequestModel.mrasSearchInfoModalVisible = mrasSearchInfoModalVisible
}

export const mutateJurisdiction = (state: StateIF, request_jurisdiction_cd: string) => {
  state.stateModel.newRequestModel.request_jurisdiction_cd = request_jurisdiction_cd
}

export const mutateCurrentJsDate = (state: StateIF, date: Date) => {
  state.stateModel.common.currentJsDate = date
}

export const mutateName = (state: StateIF, name: string) => {
  state.stateModel.newRequestModel.name = name
}

export const mutateNameOriginal = (state: StateIF, nameOriginal: string) => {
  state.stateModel.newRequestModel.nameOriginal = nameOriginal
}

export const mutateNoCorpNum = (state: StateIF, noCorpNum: boolean) => {
  state.stateModel.newRequestModel.noCorpNum = noCorpNum
}

export const mutateNoCorpDesignation = (state: StateIF, noCorpDesignation: boolean) => {
  state.stateModel.newRequestModel.noCorpDesignation = noCorpDesignation
}

export const mutateNROriginal = (state: StateIF, nrOriginal: NameRequestI) => {
  state.stateModel.newRequestModel.nrOriginal = nrOriginal
}

export const mutateNameChoices = (state: StateIF, choiceObj: any) => {
  state.stateModel.newRequestModel.nameChoices[choiceObj.key] = choiceObj.value
}

export const mutateNameChoicesToInitialState = (state: StateIF) => {
  state.stateModel.newRequestModel.nameChoices = {
    name1: '',
    designation1: '',
    name2: '',
    designation2: '',
    name3: '',
    designation3: ''
  }
}

export const mutateNameIsEnglish = (state: StateIF, nameIsEnglish: boolean) => {
  state.stateModel.newRequestModel.nameIsEnglish = nameIsEnglish
}

export const mutateIsLoadingSubmission = (state: StateIF, isLoadingSubmission: boolean) => {
  state.stateModel.newRequestModel.isLoadingSubmission = isLoadingSubmission
}

export const mutateNameRequest = (state: StateIF, nr: NameRequestI) => {
  state.stateModel.newRequestModel.nr = nr
}

export const mutateNameRequestByKey = (state: StateIF, kv: any) => {
  Vue.set(
    state.stateModel.newRequestModel.nr,
    kv.key,
    kv.value
  )
}

export const mutateNRData = (state: StateIF, { key, value }) => {
  state.stateModel.newRequestModel.nrData[key] = value
}

export const mutateNRDataByKey = (state: StateIF, kv: any) => {
  Vue.set(
    state.stateModel.newRequestModel.nr,
    kv.key,
    kv.value
  )
}

export const mutateNrRequiredModalVisible = (state: StateIF, nrRequiredModalVisible: boolean) => {
  state.stateModel.newRequestModel.nrRequiredModalVisible = nrRequiredModalVisible
}

export const mutatePickEntityModalVisible = (state: StateIF, pickEntityModalVisible: boolean) => {
  state.stateModel.newRequestModel.pickEntityModalVisible = pickEntityModalVisible
}

export const mutatePickRequestTypeModalVisible = (state: StateIF, pickRequestTypeModalVisible: boolean) => {
  state.stateModel.newRequestModel.pickRequestTypeModalVisible = pickRequestTypeModalVisible
}

export const mutatePriorityRequest = (state: StateIF, priorityRequest: boolean) => {
  state.stateModel.newRequestModel.priorityRequest = priorityRequest
}

export const mutateRequestAction = (state: StateIF, action: string) => {
  state.stateModel.newRequestModel.conversionType = ''
  state.stateModel.newRequestModel.request_action_cd = action
  if (action === 'MVE' && state.stateModel.newRequestModel.location === 'BC') {
    state.stateModel.newRequestModel.location = 'CA'
    state.stateModel.newRequestModel.entity_type_cd = 'XCR'
  }
}

export const mutateRequestExaminationOrProvideConsent = (state: StateIF, { index, type, value }) => {
  state.stateModel.newRequestModel.requestExaminationOrProvideConsent[index][type] = value
}

export const mutateShowActualInput = (state: StateIF, showActualInput: boolean) => {
  state.stateModel.newRequestModel.showActualInput = showActualInput
}

export const mutateStats = (state: StateIF, stats: StatsI) => {
  state.stateModel.newRequestModel.stats = stats
}

export const mutateSubmissionTabComponent = (state: StateIF, component: string) => {
  enum Components {
    EntityNotAutoAnalyzed,
    NamesCapture,
    ApplicantInfo1,
    ApplicantInfo2
  }
  let tab = parseInt(Components[component])
  state.stateModel.newRequestModel.submissionTabNumber = tab
}

export const mutateSubmissionTabNumber = (state: StateIF, submissionTabNumber: number) => {
  state.stateModel.newRequestModel.submissionTabNumber = submissionTabNumber
}

export const mutateSubmissionType = (state: StateIF, submissionType: SubmissionTypeT) => {
  state.stateModel.newRequestModel.submissionType = submissionType
}

export const mutateTabNumber = (state: StateIF, tabNumber: number) => {
  state.stateModel.newRequestModel.tabNumber = tabNumber
}

export const mutateWaitingAddressSearch = (state: StateIF, appKV: WaitingAddressSearchI) => {
  state.stateModel.newRequestModel.waitingAddressSearch = appKV
}

export const populateApplicantData = (state: StateIF) => {
  for (let key in state.stateModel.newRequestModel.nr.applicants) {
    Vue.set(
      state.stateModel.newRequestModel.applicant,
      key,
      state.stateModel.newRequestModel.nr.applicants[key]
    )
  }
}

export const populateNrData = (state: StateIF) => {
  for (let key in state.stateModel.newRequestModel.nrData) {
    if (state.stateModel.newRequestModel.nr[key]) {
      Vue.set(
        state.stateModel.newRequestModel.nrData,
        key,
        state.stateModel.newRequestModel.nr[key]
      )
    }
  }
  state.stateModel.newRequestModel.entity_type_cd = state.stateModel.newRequestModel.nr.entity_type_cd
}

export const resetEditFormValues = (state: StateIF) => {
  state.stateModel.newRequestModel.nr = state.stateModel.newRequestModel.nrOriginal
}

export const resetApplicantDetails = (state: StateIF) => {
  for (let key in state.stateModel.newRequestModel.applicant) {
    if (key === 'countryTypeCd') {
      state.stateModel.newRequestModel.applicant[key] = 'CA'
      continue
    }
    state.stateModel.newRequestModel.applicant[key] = ''
  }
}

export const resetNrData = (state: StateIF) => {
  for (let key in state.stateModel.newRequestModel.nrData) {
    Vue.set(
      state.stateModel.newRequestModel.nrData,
      key,
      ''
    )
  }
}

export const resetRequestExaminationOrProvideConsent = (state: StateIF) => {
  for (let n of [0, 1, 2]) {
    for (let type of ['send_to_examiner', 'obtain_consent', 'conflict_self_consent']) {
      state.stateModel.newRequestModel.requestExaminationOrProvideConsent[n][type] = false
    }
  }
}

export const setErrors = (state: StateIF, errors: string) => {
  if (Array.isArray(state.stateModel.newRequestModel.errors) && state.stateModel.newRequestModel.errors.length > 0) {
    state.stateModel.newRequestModel.errors = state.stateModel.newRequestModel.errors.concat(errors)
    return
  }
  state.stateModel.newRequestModel.errors = [errors]
}

export const setNrResponse = (state: StateIF, data: NameRequestI): boolean => {
  try {
    state.stateModel.newRequestModel.nr = data
    const { applicants = [] } = state.stateModel.newRequestModel.nr

    if (applicants instanceof Array) {
      // setApplicantDetails(applicants[0]) // OLD CODE
      state.stateModel.newRequestModel.applicant = { ...applicants[0] }
    } else if (applicants) {
      // setApplicantDetails(applicants) // OLD CODE
      state.stateModel.newRequestModel.applicant = { ...applicants }
    } else {
      // applicants is null/undefined
    }
    return true
  } catch (err) {
    console.error('setNrResponse() =', err) // eslint-disable-line no-console
    return false
  }
}

export const updateReservationNames = (state: StateIF, nrName: [] = []) => {
  nrName.forEach(({ choice, name = '', designation = '' }) => {
    state.stateModel.newRequestModel.nameChoices[`name${choice}`] = name
    state.stateModel.newRequestModel.nameChoices[`designation${choice}`] = designation
  })
}

export const mutateAssumedNameOriginal = (state: StateIF) => {
  state.stateModel.newRequestModel.assumedNameOriginal = state.stateModel.newRequestModel.name
}

export const mutateRequestActionOriginal = (state: StateIF, requestActionOriginal: string) => {
  state.stateModel.newRequestModel.requestActionOriginal = requestActionOriginal
}

export const resetNameChoices = (state: StateIF) => {
  for (let key in state.stateModel.newRequestModel.nameChoices) {
    Vue.set(
      state.stateModel.newRequestModel.nameChoices,
      key,
      ''
    )
  }
}

export const mutateNameAnalysisTimedOut = (state: StateIF, nameAnalysisTimedOut: boolean) => {
  state.stateModel.newRequestModel.nameAnalysisTimedOut = nameAnalysisTimedOut
}

export const mutateConditionsModalVisible = (state: StateIF, conditionsModalVisible: boolean) => {
  state.stateModel.newRequestModel.conditionsModalVisible = conditionsModalVisible
}

export const mutateExitModalVisible = (state: StateIF, exitModalVisible: boolean) => {
  state.stateModel.newRequestModel.exitModalVisible = exitModalVisible
}

export const clearAssumedNameOriginal = (state: StateIF) => {
  state.stateModel.newRequestModel.assumedNameOriginal = ''
}

export const mutateUserCancelledAnalysis = (state: StateIF, userCancelledAnalysis: boolean) => {
  state.stateModel.newRequestModel.userCancelledAnalysis = userCancelledAnalysis
}

export const mutateQuickSearch = (state: StateIF, quickSearch: boolean) => {
  state.stateModel.newRequestModel.quickSearch = quickSearch
}

export const mutateQuickSearchNames = (state: StateIF, quickSearchNames: object[]) => {
  state.stateModel.newRequestModel.quickSearchNames = quickSearchNames
}

export const mutateAnalyzePending = (state: StateIF, analyzePending: boolean) => {
  state.stateModel.newRequestModel.analyzePending = analyzePending
}
