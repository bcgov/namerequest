import {
  AnalysisJSONI, ConditionalReqI, ConsentConflictI,
  ConversionTypesI, DraftReqI, IssueI,
  LocationT,
  NameChoicesIF, NameDesignationI, RequestActionsI, RequestNameI, RequestOrConsentIF, ReservedReqI,
  StateIF,
  StatsI,
  SubmissionTypeT
} from '@/interfaces'
import { NrState } from '@/enums'
import {
  ApplicantI, EntityI, ExistingRequestSearchI, NameRequestI, RequestActionMappingI, SelectOptionsI
} from '@/interfaces/models'

// List Data
// *** TODO: replace with `this.$xxx`
import {
  CanJurisdictions, IntlJurisdictions, ConversionTypes, MrasJurisdictions,
  ColinRequestActions, ColinRequestTypes, XproColinRequestTypes, BcMapping, XproMapping,
  Designations, EntityTypesBcData, EntityTypesXproData, Locations, RequestActions
} from '@/list-data'

export const getName = (state: StateIF): string => {
  return state.stateModel.newRequestModel.name
}

export const getOriginalName = (state: StateIF): string => {
  return state.stateModel.newRequestModel.nameOriginal
}

export const getAssumedName = (state: StateIF): string => {
  return state.stateModel.newRequestModel.assumedNameOriginal
}

export const getNr = (state: StateIF): Partial<NameRequestI> => {
  return state.stateModel.newRequestModel.nr
}

export const getNrNames = (state: StateIF): any => {
  return state.stateModel.newRequestModel.nr.names
}

export const getNrData = (state: StateIF): any => {
  return state.stateModel.newRequestModel.nrData
}

export const getNrId = (state: StateIF): string => {
  return state.stateModel.newRequestModel.nr.id
}

export const getNrNum = (state: StateIF): string => {
  return state.stateModel.newRequestModel.nr.nrNum
}

export const getNrState = (state: StateIF): string => {
  return state.stateModel.newRequestModel.nr.state
}

export const getLocation = (state: StateIF): LocationT => {
  return state.stateModel.newRequestModel.location
}

export const getLocationText = (state: StateIF): string => {
  return getLocationOptions(state).find(options => options.value === getLocation(state))?.text
}

export const getJurisdictionCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_jurisdiction_cd
}

export const getJurisdictionText = (state: StateIF): string => {
  return getLocation(state) === 'CA'
    ? CanJurisdictions.find(jur => jur.value === getRequestJurisdictionCd(state))?.text
    : IntlJurisdictions.find(jur => jur.value === getRequestJurisdictionCd(state))?.text
}

export const getMrasSearchResultCode = (state: StateIF): number => {
  return state.stateModel.newRequestModel.mrasSearchResultCode
}

export const getEntityTypeCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.entity_type_cd
}

export const getRequestActionCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_action_cd
}

/** The request text for the current request action code. */
export const getRequestText = (state: StateIF): string => {
  return RequestActions.find(options => options.value === getRequestActionCd(state))?.text
}

export const getRequestJurisdictionCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_jurisdiction_cd
}

export const getRequestActionOriginal = (state: StateIF): string => {
  return state.stateModel.newRequestModel.requestActionOriginal
}

export const getApplicant = (state: StateIF): ApplicantI => {
  return state.stateModel.newRequestModel.applicant
}

export const getCorpSearch = (state: StateIF): string => {
  return state.stateModel.newRequestModel.corpSearch
}

export const getAnalyzePending = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.analyzePending
}

/** True if current request action code is "conversion". */
export const getIsConversion = (state: StateIF): boolean => {
  return getRequestActionCd(state) === 'CNV'
}

export const getExistingRequestSearch = (state: StateIF): ExistingRequestSearchI => {
  return state.stateModel.newRequestModel.existingRequestSearch
}

export const getQuickSearch = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.quickSearch
}

export const getErrors = (state: StateIF): string[] => {
  return state.stateModel.newRequestModel.errors
}

/** True if XproMras. */
export const getIsXproMras = (state: StateIF): boolean => {
  return (['CA', 'IN'].includes(getLocation(state)) && getRequestActionCd(state) !== 'MVE')
}

export const getHasNoCorpNum = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.noCorpNum
}

export const getCorpNum = (state: StateIF): string => {
  return state.stateModel.newRequestModel.corpNum
}

export const getNameIsEnglish = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.nameIsEnglish
}

export const getExtendedRequestType = (state: StateIF): SelectOptionsI => {
  return state.stateModel.newRequestModel.extendedRequestType
}

export const getRequestTypeOptions = (state: StateIF): RequestActionsI[] => {
  let option = RequestActions.find(type => type.value === 'NEW')
  option.rank = 1
  let options = [option]
  let n = 2
  if (getExtendedRequestType(state)) {
    getExtendedRequestType(state).rank = 2
    options.push(getExtendedRequestType(state))
    n = 3
  }
  let { requestTypeCd } = getNr(state)
  if (getEditMode(state) && ['AS', 'AL', 'XASO', 'XCASO', 'UA'].includes(requestTypeCd)) {
    options.push({ text: 'Assume an', value: 'ASSUMED', rank: n })
    n++
  }
  options.push({ text: 'View All Request Actions', value: 'INFO', rank: n })

  return options.sort((a, b) => {
    if (a.rank < b.rank) {
      return -1
    }
    if (a.rank > b.rank) {
      return 1
    }
    return 0
  })
}

export const getNameChoices = (state: StateIF): NameChoicesIF => {
  return state.stateModel.newRequestModel.nameChoices

  // *** TODO: if useful then move this to unit tests, else delete
  // {
  // name1: 'ACME Construction',
  // name2: 'ACME Home Construction',
  // name3: 'ACME Commercial Construction',
  // designation1: 'Ltd.',
  // designation2: 'Ltd.',
  // designation3: 'Ltd.'
  // }

  // const parseNameChoices = (nameChoices: NameChoicesIF) => {
  //   return Object.keys(nameChoices)
  //     .reduce((names, key, idx) => {
  //       // Key will be either 'name' or 'designation'
  //       const nameIdx = key.match(/[\d]+$/)[0]
  //       const typeKey = key.substring(0, key.lastIndexOf(nameIdx))
  //       names[nameIdx] = names[nameIdx] || { name: undefined, designation: undefined }
  //       names[nameIdx][typeKey] = nameChoices[key]
  //       return names
  //     }, [])
  //     .map((choice) => {
  //       // Make sure to replace designation if it's part of the name
  //       return (choice.name && choice.designation)
  //         ? `${choice.name.replace(choice.designation, '')} ${choice.designation}`
  //         : (choice.name && !choice.designation)
  //           ? `${choice.name}`
  //           : undefined
  //     })
  //     .filter((name) => !!name)
  // }
  // console.log(parseNameChoices(nameRequestChoices))
  // return parseNameChoices(nameRequestChoices)
}

/** Return persons name flag. */
export const getIsPersonsName = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.isPersonsName
}

export const getDoNotAnalyzeEntities = (state: StateIF): string[] => {
  return state.stateModel.newRequestModel.doNotAnalyzeEntities
}

export const getUserCancelledAnalysis = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.userCancelledAnalysis
}

export const getDisplayedComponent = (state: StateIF): string => {
  return state.stateModel.newRequestModel.displayedComponent
}

export const getStats = (state: StateIF): StatsI => {
  return state.stateModel.newRequestModel.stats
}

export const getTabNumber = (state: StateIF): number => {
  return state.stateModel.newRequestModel.tabNumber
}

export const getConversionType = (state: StateIF): string => {
  return state.stateModel.newRequestModel.conversionType
}

export const getNoCorpDesignation = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.noCorpDesignation
}

export const getConversionTypeAddToSelect = (state: StateIF): ConversionTypesI => {
  return state.stateModel.newRequestModel.conversionTypeAddToSelect
}

export const getEntityTypeAddToSelect = (state: StateIF): SelectOptionsI => {
  return state.stateModel.newRequestModel.entityTypeAddToSelect
}

export const getEditMode = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.editMode
}

export const getActingOnOwnBehalf = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.actingOnOwnBehalf
}

export const getShowNoCorpDesignation = (state: StateIF): boolean => {
  return ['DBA', 'FR', 'GP'].includes(getEntityTypeCd(state))
}

export const getSubmissionTabNumber = (state: StateIF): number => {
  return state.stateModel.newRequestModel.submissionTabNumber
}

export const getSubmissionType = (state: StateIF): SubmissionTypeT => {
  return state.stateModel.newRequestModel.submissionType
}

export const getIsLoadingSubmission = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.isLoadingSubmission
}

export const getAddressSuggestions = (state: StateIF): any[] => {
  return state.stateModel.newRequestModel.addressSuggestions
}

export const getIsAssumedName = (state: StateIF): boolean => {
  return !!state.stateModel.newRequestModel.assumedNameOriginal
}

export const getShowActualInput = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.showActualInput
}

export const getAnalysisJSON = (state: StateIF): AnalysisJSONI => {
  return state.stateModel.newRequestModel.analysisJSON
}

export const getIsPriorityRequest = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.priorityRequest
}

export const getQuickSearchNames = (state: StateIF): object[] => {
  return state.stateModel.newRequestModel.quickSearchNames
}

export const getIssueIndex = (state: StateIF): number => {
  return state.stateModel.newRequestModel.issueIndex
}

export const getCurrentIssue = (state: StateIF): IssueI => {
  if (!getAnalysisJSON(state)) return null

  if (getAnalysisJSON(state) && getAnalysisJSON(state).issues && Array.isArray(getAnalysisJSON(state).issues)) {
    return getAnalysisJSON(state).issues[getIssueIndex(state)]
  }

  return null
}

export const getRequestExaminationOrProvideConsent = (state: StateIF): RequestOrConsentIF => {
  return state.stateModel.newRequestModel.requestExaminationOrProvideConsent
}

export const getEntityTextFromValue = (state: StateIF): string => {
  if (getEntityTypeCd(state)) {
    let list = [...getEntityTypesBC(state), ...getEntityTypesXPRO(state)]
    let type = list.find(t => t.value === getEntityTypeCd(state))
    return type?.text
  }
  return ''
}

export const getDesignationIssueTypes = (state: StateIF): string[] => {
  return state.stateModel.newRequestModel.designationIssueTypes
}

export const getConversionTypeOptions = (state: StateIF): ConversionTypesI[] => {
  let options = [...ConversionTypes].filter(type => type.shortlist)
  let n = 3

  if (getConversionTypeAddToSelect(state)) {
    getConversionTypeAddToSelect(state).rank = 4
    options = options.concat(getConversionTypeAddToSelect(state))
    n = 4
  }
  options = options.concat({ text: 'View all Alterations', value: 'INFO', rank: n })
  return options.sort((a, b) => {
    if (a.rank < b.rank) {
      return -1
    }
    if (a.rank > b.rank) {
      return 1
    }
    return 0
  })
}

/** Map the appropriate Blurb based on the request action and location */
export const getEntityBlurbs = (state: StateIF): Array<EntityI> => {
  switch (getRequestActionCd(state)) {
    case 'NEW': // NEW REQUEST
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBcData
      }
      if (['CA'].includes(getLocation(state))) {
        return EntityTypesXproData
      }
      if (['IN'].includes(getLocation(state))) {
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.intBlurbs }))
      }
      break
    case 'MVE': // MOVE REQUEST
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBcData.map(x => ({ ...x, blurbs: x.mveBlurbs }))
      }
      break
    case 'REH': // RESTORE OR REINSTATE REQUEST
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBcData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
      }
      if (['CA', 'IN'].includes(getLocation(state))) {
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
      }
      break
    case 'AML': // AMALGAMATE REQUEST
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBcData.map(x => ({ ...x, blurbs: x.amlBlurbs }))
      }
      if (['CA'].includes(getLocation(state))) {
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.amlBlurbs[0] }))
      }
      if (['IN'].includes(getLocation(state))) {
        // If international blurb is the same as national, map that blurb
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.amlBlurbs[1] || x.amlBlurbs[0] }))
      }
      break
    case 'CHG': // CHANGE NAME REQUEST
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBcData.map(x => ({ ...x, blurbs: x.chgBlurbs }))
      }
      if (['CA'].includes(getLocation(state))) {
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.chgBlurbs[0] }))
      }
      if (['IN'].includes(getLocation(state))) {
        // If international blurb is the same as national, map that blurb
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.chgBlurbs[1] || x.chgBlurbs[0] }))
      }
      break
    case 'CNV': // CONVERSION REQUEST
      if (['BC'].includes(getLocation(state))) {
        return ConversionTypes
      }
      break
  }
  return null
}

/** The BC Entity Types. */
export const getEntityTypesBC = (state: StateIF): EntityI[] => {
  try {
    let generateEntities = (entities) => {
      let output = []
      for (let entity of entities) {
        let obj = EntityTypesBcData.find(ent => ent.value === entity)
        // "CR" type is shortlisted. if CR exists in filtered entity_types, preserve its rank and shortlist keys
        if (entity === 'CR') {
          output.push(obj)
          continue
        }
        let objSansRankAndShortlist = {}
        for (let key in obj) {
          if (!['shortlist', 'rank'].includes(key)) {
            objSansRankAndShortlist[key] = obj[key]
          }
        }
        output.push(objSansRankAndShortlist)
      }

      // but we must have at least one shortlist item
      // this will kick in when CR is not one of the filtered entities
      if (!output.some(ent => ent.rank === 1)) {
        output[0]['rank'] = 1
        output[0]['shortlist'] = true
      }
      return output
    }

    // see 'src/list-data/request-action-mapping.ts'
    let mapping: RequestActionMappingI = BcMapping
    let cds = Object.keys(mapping)
    if (cds.includes(getRequestActionCd(state))) {
      return generateEntities(mapping[getRequestActionCd(state)])
    }

    return EntityTypesBcData
  } catch (err) {
    console.error('entityTypesBC() =', err) // eslint-disable-line no-console
    return EntityTypesBcData
  }
}

/** Get Xpro entity types. */
export const getEntityTypesXPRO = (state: StateIF): EntityI[] => {
  let _entityTypesXproData = EntityTypesXproData
  if (getLocation(state) === 'CA') {
    _entityTypesXproData = _entityTypesXproData.filter(ent => ent.value !== 'RLC')
  }

  try {
    let generateEntities = (entities) => {
      let output = []
      for (let entity of entities) {
      // using this.$entityTypesXproData instead of scoped _entityTypesXproData here so that RLC can be included
        let obj = EntityTypesXproData.find(ent => ent.value === entity)
        // "CR" type is shortlisted. if XCR exists in filtered entity_types, preserve its rank and shortlist keys
        if (entity === 'XCR') {
          output.push(obj)
          continue
        }
        if (getLocation(state) === 'CA' && entity === 'RLC') {
          continue
        }
        let objSansRankAndShortlist = {}
        for (let key in obj) {
          if (!['shortlist', 'rank'].includes(key)) {
            objSansRankAndShortlist[key] = obj[key]
          }
        }
        output.push(objSansRankAndShortlist)
      }

      // but we must have at least one shortlist item
      // this will kick in when XCR is not one of the filtered entities
      if (!output.some(ent => ent.rank === 1)) {
        output[0]['rank'] = 1
        output[0]['shortlist'] = true
      }
      return output
    }

    // see 'src/list-data/request-action-mapping.ts'
    let mapping: RequestActionMappingI = XproMapping
    let cds = Object.keys(mapping)

    if (cds.includes(getRequestActionCd(state))) {
      return generateEntities(mapping[getRequestActionCd(state)])
    }

    return _entityTypesXproData
  } catch (err) {
    console.error('entityTypesXPRO() =', err) // eslint-disable-line no-console
    return _entityTypesXproData
  }
}

export const getShowXproJurisdiction = (state: StateIF): boolean => {
  if (getLocation(state) !== 'BC') return true
  if (getRequestActionCd(state) === 'MVE') return true
  return false
}

export const getXproRequestTypeCd = (state: StateIF): string => {
  if (getIsAssumedName(state)) {
    switch (getEntityTypeCd(state)) {
      case 'RLC': return 'AL'
      case 'XCR': return 'AS'
    }
  }
  return ''
}

/** Get entity type options. */
export const getEntityTypeOptions = (state: StateIF): Array<EntityI> => {
  let bcOptions: SelectOptionsI[] = getEntityTypesBC(state)?.filter(x => {
    // Set shortlisted entity types for BC Move and Restoration requests.
    if ((['MVE', 'REH'].includes(getRequestActionCd(state)) && getLocation(state) === 'BC')) {
      // Shortlist order: Limited company, Cooperative association
      if (x.value === 'CP') {
        x.shortlist = true
        x.rank = 2
      } else if (['FR', 'GP', 'UL'].includes(x.value)) {
        x.shortlist = null
        x.rank = null
      }
    } else if (getRequestActionCd(state) === 'AML' && getLocation(state) === 'BC') {
      // Shortlist order: Limited company, Unlimited liability company
      if (x.value === 'UL') {
        x.shortlist = true
        x.rank = 2
      } else if (['FR', 'GP', 'CP'].includes(x.value)) {
        x.shortlist = null
        x.rank = null
      }
    } else {
      // Shortlist order: Limited Company, Sole proprietorship, General partnership
      if (['UL', 'CP'].includes(x.value)) {
        x.shortlist = null
        x.rank = null
      } else if (x.value === 'FR') {
        x.shortlist = true
        x.rank = 2
      } else if (x.value === 'GP') {
        x.shortlist = true
        x.rank = 3
      }
    }
    if (x.shortlist) {
      return x
    }
  })
  let xproOptions: SelectOptionsI[] = getEntityTypesXPRO(state).filter(x => {
    if (getRequestActionCd(state) === 'NEW' && ['CA', 'IN'].includes(getLocation(state))) {
      // Shortlist order: Limited company, Limited partnership
      if (x.value === 'XLP') {
        x.shortlist = true
        x.rank = 2
      } else if (x.value === 'XCP') {
        x.shortlist = null
        x.rank = null
      }
    } else if (getRequestActionCd(state) === 'MVE' && ['CA', 'IN'].includes(getLocation(state))) {
      // Shortlist order: Limited company, Cooperative association
      if (x.value === 'XLP') {
        x.shortlist = null
        x.rank = null
      } else if (x.value === 'XCP') {
        x.shortlist = true
        x.rank = 2
      }
    } else if (getRequestActionCd(state) === 'CHG' && ['CA', 'IN'].includes(getLocation(state))) {
      // Shortlist order: Limited company, Limited partnership, Limited liability partnership
      if (x.value === 'XLP') {
        x.shortlist = true
        x.rank = 2
      } else if (x.value === 'XLL') {
        x.shortlist = true
        x.rank = 3
      } else if (x.value === 'XCP') {
        x.shortlist = null
        x.rank = null
      }
    }
    if (x.shortlist) {
      return x
    }
  })
  let options: SelectOptionsI[] = getLocation(state) === 'BC' ? [...bcOptions] : [...xproOptions]
  let n = 4

  if (getEntityTypeAddToSelect(state)) {
    getEntityTypeAddToSelect(state).rank = 4
    options = options.concat(getEntityTypeAddToSelect(state))
    n = 5
  }
  options = options.concat({ text: 'View all business types', value: 'INFO', rank: n })
  return options.sort((a, b) => {
    if (a.rank < b.rank) {
      return -1
    }
    if (a.rank > b.rank) {
      return 1
    }
    return 0
  })
}

/** Returned the filtered location options. */
export const getLocationOptions = (state: StateIF): Array<any> => {
  if (['CNV'].includes(getRequestActionCd(state))) {
    return Locations.filter(location => location.value === 'BC')
  }
  if (['ASSUMED'].includes(getRequestActionCd(state))) {
    return Locations.filter(location => location.value !== 'BC')
  }
  if (['MVE'].includes(getRequestActionCd(state))) {
    return Locations.filter(location => location.value === 'BC')
  }
  return Locations // return all locations
}

/** Return true if the name is Slashed */
export const getNameIsSlashed = (state: StateIF): boolean => {
  if (getName(state)) {
    let name = getName(state)
    if (name.includes('/') && name.split('/').length === 2) {
      name = name.replace(/(\s+|(?=.))\/(\s+|(?=.))/g, '/')
      let leftSideWords = name.split('/')[0].split(' ')
      let rightSideWords = name.split('/')[1].split(' ')
      if (leftSideWords.length >= 2 && rightSideWords.length >= 2) {
        return true
      }
    }
  }
  return false
}

export const getShowCorpNum = (state: StateIF): 'colin' | 'mras' | false => {
  if ((ColinRequestActions.includes(getRequestActionCd(state)) &&
    ColinRequestTypes.includes(getEntityTypeCd(state))) || getEntityTypeCd(state) === 'DBA') {
    return 'colin'
  }
  if (ColinRequestActions.includes(getRequestActionCd(state)) &&
    XproColinRequestTypes.includes(getEntityTypeCd(state))) {
    return 'colin'
  }
  let mrasEntities = ['XCR', 'XLP', 'UL', 'CR', 'CP', 'BC', 'CC']
  let { xproJurisdiction } = getNrData(state)

  if (
    MrasJurisdictions.includes(xproJurisdiction?.toLowerCase()) &&
    mrasEntities.includes(getEntityTypeCd(state))
  ) {
    if (getLocation(state) === 'CA' && ['NEW', 'ASSUMED'].includes(getRequestActionCd(state))) {
      return 'mras'
    }
    if (getLocation(state) === 'BC' && ['MVE'].includes(getRequestActionCd(state))) {
      return 'mras'
    }
  }
  return false
}

export const getCorpNumForReservation = (state: StateIF): any => {
  // this differs from getCorpNumForEdit by not supplying the empty keys for corpNum and homeJurisNum
  // which are necessary to denote deletion during the PATCH operation that is for editing but which
  // are not supported in the POST/PUT operation
  if (!getShowCorpNum(state)) {
    return {
      corpNum: '',
      homeJurisNum: getNrData(state).homeJurisNum
    }
  }
  if (getShowCorpNum(state) === 'colin') {
    return {
      corpNum: getCorpNum(state),
      homeJurisNum: ''
    }
  }
  return {
    corpNum: getCorpNum(state),
    homeJurisNum: getNrData(state).homeJurisNum
  }
}

export const getShowPriorityRequest = (state: StateIF): boolean => {
  return (!getEditMode(state) && getNrState(state) === 'DRAFT') ||
    (!getEditMode(state) && getSubmissionType(state) === 'examination')
}

// MODAL GETTERS
export const getIncorporateLoginModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.incorporateLoginModalVisible
}

export const getPickEntityModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.pickEntityModalVisible
}

export const getPickRequestTypeModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.pickRequestTypeModalVisible
}

export const getExitModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.exitModalVisible
}

export const getAffiliationErrorModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.affiliationErrorModalVisible
}

export const getConditionsModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.conditionsModalVisible
}

export const getHelpMeChooseModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.helpMeChooseModalVisible
}

export const getLocationInfoModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.locationInfoModalVisible
}

export const getMrasSearchInfoModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.mrasSearchInfoModalVisible
}

export const getNrRequiredModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.nrRequiredModalVisible
}

export const getNameAnalysisTimeout = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.nameAnalysisTimedOut
}

export const getPriorityRequest = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.priorityRequest
}

export const getDesignationObject = (state: StateIF): any => {
  if (getEntityTypeCd(state) && this.$designations[getEntityTypeCd(state)]) {
    return this.$designations[getEntityTypeCd(state)]
  }
  return ''
}

export const getSplitNameDesignation = (state: StateIF): NameDesignationI => {
  if (getName(state) && getDesignationObject(state)?.end) {
    let { words } = getDesignationObject(state)
    for (let word of words) {
      if (getName(state).endsWith(word)) {
        let designation = word
        let name = getName(state).replace(word, '')
        name = name.trim()
        return ({ name, designation })
      }
    }
  }
  return ({
    name: '',
    designation: ''
  })
}
export const getConsentWords = (state: StateIF): any => {
  let consentWords = []

  if (!getAnalysisJSON(state)) return consentWords

  for (let step in getRequestExaminationOrProvideConsent(state)) {
    if (getRequestExaminationOrProvideConsent(state)[step].obtain_consent) {
      let words = getAnalysisJSON(state).issues[step].name_actions.map(action => action.word)
      consentWords = consentWords.concat(words)
    }
  }
  return consentWords
}

export const getConsentConflicts = (state: StateIF): ConsentConflictI => {
  let output: ConsentConflictI = {
    name: ''
  }

  if (!getAnalysisJSON(state)) return output

  for (let key in getRequestExaminationOrProvideConsent(state)) {
    if (getRequestExaminationOrProvideConsent(state)[key].conflict_self_consent) {
      output.name = getAnalysisJSON(state).issues[key].conflicts[0].name
      if (getAnalysisJSON(state).issues[key].conflicts[0].id) {
        output.corpNum = getAnalysisJSON(state).issues[key].conflicts[0].id
      }
    }
  }
  return output
}

// JSON Request constructors
export const getNrRequestNames = (state: StateIF): RequestNameI[] => {
  const nameChoices = getNameChoices(state)
  const nrNames = getNrNames(state)

  const defaultValues = {
    name_type_cd: getAssumedName(state) ? 'AS' : 'CO',
    consent_words: '',
    conflict1: '',
    conflict1_num: ''
  }

  // Check to make sure there are nameChoices that have been set
  // const nameChoicesAreSet = (parseNameChoices(nameChoices).length > 0)

  let requestNames = []
  if (nameChoices) {
    // We only allow three choices
    let choiceIdx = 1
    while (choiceIdx <= 3) {
      if (nameChoices[`name${choiceIdx}`] as boolean) {
        let combinedName = nameChoices[`name${choiceIdx}`]
        if (getEntityTypeCd(state) && Designations[getEntityTypeCd(state)]?.end) {
          let des = nameChoices[`designation${choiceIdx}`]
          if (des && !combinedName.endsWith(des)) {
            combinedName = combinedName + ' ' + des
          }
          requestNames.push({
            name: combinedName,
            designation: nameChoices[`designation${choiceIdx}`],
            choice: choiceIdx,
            ...defaultValues
          })
        } else {
          requestNames.push({
            name: combinedName,
            designation: '',
            choice: choiceIdx,
            ...defaultValues
          })
        }
      }
      choiceIdx++
    }
  } else {
    // Just use the 'name' property to fill in the requestName
    if (getEntityTypeCd(state) && getLocation(state) === 'BC' && Designations[getEntityTypeCd(state)]?.end) {
      requestNames.push({
        name: getName(state),
        designation: getSplitNameDesignation(state).designation,
        choice: 1,
        ...defaultValues
      })
    } else {
      requestNames.push({
        name: getName(state),
        designation: '',
        choice: 1,
        ...defaultValues
      })
    }
  }
  requestNames = requestNames.map((requestName, idx) => {
    if (nrNames) {
      const existingName = nrNames.find(nrName => nrName.choice === requestName.choice)
      if (existingName) {
        return {
          ...existingName,
          // Merge in requestName form values
          ...requestName,
          // Merge conflicts and consent words
          consent_words: !existingName.consent_words
            ? getConsentWords(state).length > 0 ? getConsentWords(state) : ''
            : existingName.consent_words,
          conflict1: !existingName.conflict1
            ? getConsentConflicts(state).name
            : existingName.conflict1,
          conflict1_num: existingName.conflict1_num ? existingName.conflict1_num : ''
        } as RequestNameI
      }
    }

    return { ...requestName } as RequestNameI
  })

  return requestNames
}

export const getDraftNameReservation = (state: StateIF): DraftReqI => {
  const nrRequestNames = getNrRequestNames(state)
  const applicant = getApplicant(state)

  let nrData = {}
  for (let key in getNrData(state)) {
    if (getNrData(state)[key]) {
      nrData[key] = getNrData(state)[key]
    }
  }

  const data: DraftReqI = {
    applicants: [applicant],
    names: nrRequestNames,
    ...nrData,
    priorityCd: getIsPriorityRequest(state) ? 'Y' : 'N',
    entity_type_cd: getEntityTypeCd(state),
    request_action_cd: getRequestActionCd(state),
    stateCd: NrState.DRAFT,
    english: getNameIsEnglish(state),
    nameFlag: getIsPersonsName(state),
    submit_count: 0,
    ...getCorpNumForReservation(state)
  }
  if (getXproRequestTypeCd(state)) {
    data['request_type_cd'] = getXproRequestTypeCd(state)
  }
  if (getIsAssumedName(state)) {
    if (!data['additionalInfo']) {
      data['additionalInfo'] = ''
    } else {
      data['additionalInfo'] += '\n\n'
    }
    if (!data['additionalInfo'].includes('*** Registered Name:')) {
      let notice = `*** Registered Name: ${getAssumedName(state)} ***`
      data['additionalInfo'] += ' ' + notice
    }
  }
  for (let step in getRequestExaminationOrProvideConsent(state)) {
    if (getRequestExaminationOrProvideConsent(state)[step].obtain_consent ||
      getRequestExaminationOrProvideConsent(state)[step].conflict_self_consent) {
      if (!data['additionalInfo']) {
        data['additionalInfo'] = ''
      }
      if (!data['additionalInfo'].includes('*** Consent will be supplied')) {
        data['additionalInfo'] += '\n\n'
        let notice = `*** Consent will be supplied ***`
        data['additionalInfo'] += ' ' + notice
      }
    }
    if (getLocation(state) !== 'BC') {
      if (getRequestExaminationOrProvideConsent(state)[step].obtain_consent ||
        getRequestExaminationOrProvideConsent(state)[step].send_to_examiner) {
        if (!data['additionalInfo']) {
          data['additionalInfo'] = ''
        }
        if (!data['additionalInfo'].includes('*** Legal Name:')) {
          data['additionalInfo'] += '\n\n'
          let notice = `*** Legal Name: ${this.nameChoices.name1} ***`
          data['additionalInfo'] += ' ' + notice
        }
      }
    }
  }
  return data
}

export const getReservedNameReservation = (state: StateIF): ReservedReqI => {
  const data: ReservedReqI = {
    applicants: [getApplicant(state)],
    names: getNrNames(state),
    ...getNrData(state),
    priorityCd: 'N',
    // @ts-ignore TODO: This is not typed correctly!
    entity_type_cd: getEntityTypeCd(state),
    request_action_cd: getRequestActionCd(state),
    stateCd: NrState.RESERVED,
    english: getNameIsEnglish(state),
    nameFlag: getIsPersonsName(state),
    submit_count: 0,
    ...getCorpNumForReservation(state)
  }
  return data
}

/**
 * This getter combines the NR response data objects names against nameChoices,
 * which contains the actual form values, building the request object required for a Name.
 * nameChoices are identified by the 'choice' index, which is what we use to map values.
 */
export const getConditionalNameReservation = (state: StateIF): ConditionalReqI => {
  // const { applicant, nrData, nrNames } = this
  let names
  if (getNrNames(state) && getNrNames(state).length > 0) {
    // If we're updating use these mapped names -> nrRequestNames
    names = getNrRequestNames(state)
  } else {
    // Otherwise we're creating a new conditional, there won't be a multiple name inputs, build as follows...
    const name: RequestNameI = {
      name: getName(state),
      choice: 1,
      designation: getSplitNameDesignation(state).designation,
      name_type_cd: getIsAssumedName(state) ? 'AS' : 'CO',
      consent_words: getConsentWords(state).length > 0 ? getConsentWords(state) : '',
      conflict1: getConsentConflicts(state).name,
      conflict1_num: getConsentConflicts(state).corpNum ? getConsentConflicts(state).corpNum : ''
    }

    names = [name]
  }

  const data: ConditionalReqI = {
    applicants: [getApplicant(state)],
    names: names,
    ...getNrData(state),
    priorityCd: 'N',
    // @ts-ignore TODO: This is not typed correctly!
    entity_type_cd: getEntityTypeCd(state),
    request_action_cd: getRequestActionCd(state),
    request_type_cd: getXproRequestTypeCd(state) ? getXproRequestTypeCd(state) : '',
    stateCd: NrState.COND_RESERVED,
    english: getNameIsEnglish(state),
    nameFlag: getIsPersonsName(state),
    submit_count: 0,
    ...getCorpNumForReservation(state)
  }
  return data
}
