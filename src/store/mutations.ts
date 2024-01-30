import Vue from 'vue'
import {
  AnalysisJSONI,
  BusinessSearchIF,
  ConditionalInstructionI,
  ConversionTypesI,
  NameRequestI,
  RefundParamsIF,
  RequestActionsI,
  SelectOptionsI,
  StaffPaymentIF,
  StateIF,
  StatsI,
  SubmissionTypeT,
  WaitingAddressSearchI
} from '@/interfaces'
import {
  CompanyTypes,
  EntityTypes,
  Location,
  NameCheckErrorType,
  NrAffiliationErrors,
  NrRequestActionCodes,
  NrRequestTypeCodes,
  PriorityCode
} from '@/enums'

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
    for (const element of appKV) {
      state.stateModel.newRequestModel.applicant[element.name] = element.value
    }
  }
  if (appKV.key === 'postalCd') {
    appKV.value = appKV.value.toUpperCase()
  }
  state.stateModel.newRequestModel.applicant[appKV.key] = appKV.value
  // sessionStorage.setItem('BCREG-emailAddress', state.stateModel.newRequestModel.applicant?.emailAddress)
  // sessionStorage.setItem('BCREG-phoneNumber', state.stateModel.newRequestModel.applicant?.phoneNumber)
}

export const mutateConflictId = (state: StateIF, conflictId: string) => {
  state.stateModel.newRequestModel.conflictId = conflictId
}

export const mutateConversionType = (state: StateIF, conversionType: NrRequestTypeCodes) => {
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

export const mutateEntityType = (state: StateIF, entity_type_cd: EntityTypes) => {
  state.stateModel.newRequestModel.entity_type_cd = entity_type_cd
}

export const mutateOriginEntityType = (state: StateIF, origin_entity_type_cd: EntityTypes) => {
  state.stateModel.newRequestModel.origin_entity_type_cd = origin_entity_type_cd
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

export const mutateAffiliationErrorModalValue = (state: StateIF, affiliationErrorModalValue: NrAffiliationErrors) => {
  state.stateModel.newRequestModel.affiliationErrorModalValue = affiliationErrorModalValue
}

export const mutateIsPersonsName = (state: StateIF, isPersonsName: boolean) => {
  state.stateModel.newRequestModel.isPersonsName = isPersonsName
}

export const mutateLocation = (state: StateIF, location: Location) => {
  // don't reset location if it hasn't changed
  if (location === state.stateModel.newRequestModel.location) {
    return
  }

  // reset entity type on location changes (options depend on location)
  // except amalgamation since entity type was set before location
  if (state.stateModel.newRequestModel.request_action_cd !== NrRequestActionCodes.AMALGAMATE) {
    state.stateModel.newRequestModel.entity_type_cd = null
  }

  if (
    state.stateModel.newRequestModel.location === Location.CA ||
    state.stateModel.newRequestModel.location === Location.IN
  ) {
    if (location === Location.CA || location === Location.IN) {
      state.stateModel.newRequestModel.location = location
      return
    }
  }

  // reset recently-used entry on location changes
  // except amalgamation since recently-used entry was set before location
  if (state.stateModel.newRequestModel.request_action_cd !== NrRequestActionCodes.AMALGAMATE) {
    state.stateModel.newRequestModel.entityTypeAddToSelect = null
  }

  // finally, set location
  state.stateModel.newRequestModel.location = location
}

export const mutateMrasSearchResult = (state: StateIF, mrasSearchResultCode: number) => {
  state.stateModel.newRequestModel.mrasSearchResultCode = mrasSearchResultCode
}

export const mutateMrasSearchInfoModalVisible = (state: StateIF, mrasSearchInfoModalVisible: boolean) => {
  state.stateModel.newRequestModel.mrasSearchInfoModalVisible = mrasSearchInfoModalVisible
}

export const mutateJurisdictionCd = (state: StateIF, request_jurisdiction_cd: string) => {
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
  // store NR data
  state.stateModel.newRequestModel.nr = nr

  // store Priority Code
  mutatePriorityRequest(state, (nr?.priorityCd === PriorityCode.YES))

  // FUTURE: have 1 mutation for nr / applicant info and put these there
  const nrNum = state.stateModel.newRequestModel.nr?.nrNum
  if (nrNum?.includes('NR L')) {
    sessionStorage.setItem('BCREG-NRL', nrNum)
    sessionStorage.setItem('BCREG-nrNum', null)
  } else if (nrNum) {
    sessionStorage.setItem('BCREG-NRL', null)
    sessionStorage.setItem('BCREG-nrNum', nrNum)
  }
}

export const mutateNameRequestByKey = (state: StateIF, kv: any) => {
  Vue.set(
    state.stateModel.newRequestModel.nr,
    kv.key,
    kv.value
  )
  // FUTURE: have 1 mutation for nr / applicant info and put these there
  const nrNum = state.stateModel.newRequestModel.nr?.nrNum
  if (nrNum?.includes('NR L')) {
    sessionStorage.setItem('BCREG-NRL', nrNum)
    sessionStorage.setItem('BCREG-nrNum', null)
  } else if (nrNum) {
    sessionStorage.setItem('BCREG-NRL', null)
    sessionStorage.setItem('BCREG-nrNum', nrNum)
  }
}

export const mutateNRData = (state: StateIF, { key, value }) => {
  state.stateModel.newRequestModel.nrData[key] = value
}

export const mutateXproJurisdiction = (state: StateIF, val: string) => {
  state.stateModel.newRequestModel.nrData.xproJurisdiction = val
}

export const mutateHomeJurisNum = (state: StateIF, val: string) => {
  state.stateModel.newRequestModel.nrData.homeJurisNum = val
}

export const mutateNrRequiredModalVisible = (state: StateIF, nrRequiredModalVisible: boolean) => {
  state.stateModel.newRequestModel.nrRequiredModalVisible = nrRequiredModalVisible
}

export const mutatePickEntityModalVisible = (state: StateIF, pickEntityModalVisible: boolean) => {
  state.stateModel.newRequestModel.pickEntityModalVisible = pickEntityModalVisible
}

export const mutatePriorityRequest = (state: StateIF, priorityRequest: boolean) => {
  state.stateModel.newRequestModel.priorityRequest = priorityRequest
}

export const mutateRequestAction = (state: StateIF, requestCd: NrRequestActionCodes) => {
  state.stateModel.newRequestModel.conversionType = null
  state.stateModel.newRequestModel.request_action_cd = requestCd
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
  const tab = parseInt(Components[component])
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
  for (const key in state.stateModel.newRequestModel.nr.applicants) {
    Vue.set(
      state.stateModel.newRequestModel.applicant,
      key,
      state.stateModel.newRequestModel.nr.applicants[key]
    )
  }
  // FUTURE: have 1 mutation for nr / applicant info and put these there
  sessionStorage.setItem('BCREG-emailAddress', state.stateModel.newRequestModel.applicant?.emailAddress)
  sessionStorage.setItem('BCREG-phoneNumber', state.stateModel.newRequestModel.applicant?.phoneNumber)
}

export const populateNrData = (state: StateIF) => {
  for (const key in state.stateModel.newRequestModel.nrData) {
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
  for (const key in state.stateModel.newRequestModel.applicant) {
    if (key === 'countryTypeCd') {
      state.stateModel.newRequestModel.applicant[key] = Location.CA
      continue
    }
    state.stateModel.newRequestModel.applicant[key] = ''
  }
}

export const resetNrData = (state: StateIF) => {
  for (const key in state.stateModel.newRequestModel.nrData) {
    Vue.set(
      state.stateModel.newRequestModel.nrData,
      key,
      ''
    )
  }
}

export const resetRequestExaminationOrProvideConsent = (state: StateIF) => {
  for (const n of [0, 1, 2]) {
    for (const type of ['send_to_examiner', 'obtain_consent', 'conflict_self_consent']) {
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

export const setNrResponse = (state: StateIF, nr: NameRequestI) => {
  try {
    // set NR data
    mutateNameRequest(state, nr)

    // set Applicants
    const applicants = state.stateModel.newRequestModel.nr?.applicants || []
    if (applicants instanceof Array) {
      state.stateModel.newRequestModel.applicant = { ...applicants[0] }
    } else if (applicants) {
      state.stateModel.newRequestModel.applicant = { ...applicants }
    } else {
      // applicants is null/undefined
    }

    // populate Applicants
    populateApplicantData(state)
  } catch (err) {
    console.error('setNrResponse() =', err) // eslint-disable-line no-console
  }
}

export const updateReservationNames = (state: StateIF, nrNames: [] = []) => {
  nrNames.forEach(({ choice = 1, name = '', designation = '' }) => {
    state.stateModel.newRequestModel.nameChoices[`name${choice}`] = name
    state.stateModel.newRequestModel.nameChoices[`designation${choice}`] = designation
  })
}

export const mutateAssumedNameOriginal = (state: StateIF) => {
  state.stateModel.newRequestModel.assumedNameOriginal = state.stateModel.newRequestModel.name
}

export const resetNameChoices = (state: StateIF) => {
  for (const key in state.stateModel.newRequestModel.nameChoices) {
    Vue.set(
      state.stateModel.newRequestModel.nameChoices,
      key,
      ''
    )
  }
}

export const mutateConditionsModalVisible = (state: StateIF, conditionsModalVisible: boolean) => {
  state.stateModel.newRequestModel.conditionsModalVisible = conditionsModalVisible
}

export const mutateSocietiesModalVisible = (state: StateIF, societiesModalVisible: boolean) => {
  state.stateModel.newRequestModel.societiesModalVisible = societiesModalVisible
}

export const mutateExitModalVisible = (state: StateIF, exitModalVisible: boolean) => {
  state.stateModel.newRequestModel.exitModalVisible = exitModalVisible
}

export const mutateExitIncompletePaymentVisible = (state: StateIF, exitIncompletePaymentVisible: boolean) => {
  state.stateModel.newRequestModel.exitIncompletePaymentVisible = exitIncompletePaymentVisible
}

export const clearAssumedNameOriginal = (state: StateIF) => {
  state.stateModel.newRequestModel.assumedNameOriginal = ''
}

export const mutateUserCancelledAnalysis = (state: StateIF, userCancelledAnalysis: boolean) => {
  state.stateModel.newRequestModel.userCancelledAnalysis = userCancelledAnalysis
}

export const mutateKeycloakRoles = (state: StateIF, keyCloakRoles: Array<string>) => {
  state.stateModel.common.keycloakRoles = keyCloakRoles
}

export const mutateStaffPayment = (state: StateIF, staffPayment: StaffPaymentIF) => {
  state.stateModel.staffPayment = staffPayment
}

/** Mutations for Name Check */

export const mutateAnalyzeDesignationPending = (state: StateIF, pending: boolean) => {
  state.stateModel.nameCheckModel.analyzeDesignationPending = pending
}

export const mutateAnalyzeStructurePending = (state: StateIF, pending: boolean) => {
  state.stateModel.nameCheckModel.analyzeStructurePending = pending
}

export const mutateAnalyzeConflictsPending = (state: StateIF, pending: boolean) => {
  state.stateModel.nameCheckModel.analyzeConflictsPending = pending
}

export const mutateConflictsConditional = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.conflictsConditional = value
}

export const mutateConflictsConditionalInstructions = (state: StateIF, value: Array<ConditionalInstructionI>) => {
  state.stateModel.nameCheckModel.conflictsConditionalInstructions = value
}

export const mutateConflictsExact = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.conflictsExact = value
}

export const mutateConflictsRestricted = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.conflictsRestricted = value
}

export const mutateConflictsSimilar = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.conflictsSimilar = value
}

export const mutateDesignation = (state: StateIF, value: string) => {
  state.stateModel.nameCheckModel.designation = value
}

export const mutateDesignationsCheckUse = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.designationsCheckUse = value
}

export const mutateDesignationsMismatched = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.designationsMismatched = value
}

export const mutateDesignationsMisplaced = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.designationsMisplaced = value
}

export const mutateDoNameCheck = (state: StateIF, doNameCheck: boolean) => {
  state.stateModel.nameCheckModel.doNameCheck = doNameCheck
}

export const mutateFullName = (state: StateIF, value: string) => {
  state.stateModel.nameCheckModel.fullName = value
}

export const mutateMissingDescriptive = (state: StateIF, value: boolean) => {
  state.stateModel.nameCheckModel.missingDescriptive = value
}

export const mutateMissingDesignation = (state: StateIF, value: boolean) => {
  state.stateModel.nameCheckModel.missingDesignation = value
}

export const mutateMissingDistinctive = (state: StateIF, value: boolean) => {
  state.stateModel.nameCheckModel.missingDistinctive = value
}

export const mutateNameAnalysisTimedOut = (state: StateIF, nameAnalysisTimedOut: boolean) => {
  state.stateModel.newRequestModel.nameAnalysisTimedOut = nameAnalysisTimedOut
}

export const mutateNumbersCheckUse = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.numbersCheckUse = value
}

export const mutateQuickSearchNames = (state: StateIF, quickSearchNames: any[]) => {
  state.stateModel.newRequestModel.quickSearchNames = quickSearchNames
}

export const mutateSpecialCharacters = (state: StateIF, value: Array<string>) => {
  state.stateModel.nameCheckModel.specialCharacters = value
}

export const mutateNameCheckErrorAdd = (state: StateIF, key: string) => {
  state.stateModel.nameCheckModel.errors[key] = true
}

export const mutateNameCheckErrorClear = (state: StateIF, key: NameCheckErrorType) => {
  state.stateModel.nameCheckModel.errors[key] = false
}

export const mutateFolioNumber = (state: StateIF, folioNumber: string) => {
  state.stateModel.newRequestModel.folioNumber = folioNumber
}

export const mutateRefundParams = (state: StateIF, refundParams: RefundParamsIF) => {
  state.stateModel.refundParams = refundParams
}

export const mutateWindowWidth = (state: StateIF, width: number) => {
  state.stateModel.windowWidth = width
}

export const mutateHotjarUserId = (state: StateIF, hotjarUserId: string) => {
  state.stateModel.newRequestModel.hotjarUserId = hotjarUserId
}

export const mutateIncorporateNowErrorStatus = (state: StateIF, incorporateNowError: boolean) => {
  state.stateModel.newRequestModel.incorporateNowError = incorporateNowError
}

export const mutateAmalgamateNowErrorStatus = (state: StateIF, amalgamateNowError: boolean) => {
  state.stateModel.newRequestModel.amalgamateNowError = amalgamateNowError
}

export const mutateContinuationInErrorStatus = (state: StateIF, continuationInError: boolean) => {
  state.stateModel.newRequestModel.continuationInError = continuationInError
}

export const mutateSearchBusiness = (state: StateIF, val: BusinessSearchIF) => {
  state.stateModel.newRequestModel.search.business = val
}

export const mutateSearchCompanyType = (state: StateIF, val: CompanyTypes) => {
  state.stateModel.newRequestModel.search.companyType = val
}

export const mutateSearchJurisdiction = (state: StateIF, val: any) => {
  state.stateModel.newRequestModel.search.jurisdiction = val
}

export const mutateSearchRequest = (state: StateIF, val: RequestActionsI) => {
  state.stateModel.newRequestModel.search.request = val
}
