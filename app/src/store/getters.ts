import { getVuetify } from '@/plugins'
import {
  AnalysisJSONI,
  ApplicantI,
  BusinessSearchIF,
  ConditionalInstructionI,
  ConditionalReqI,
  ConsentConflictI,
  ConversionTypesI,
  DraftReqI,
  EntityI,
  ExistingRequestSearchI,
  IssueI,
  NameCheckErrorI,
  NameChoicesIF,
  NameDesignationI,
  NameRequestI,
  RefundParamsIF,
  RequestActionsI,
  RequestNameI,
  RequestOrConsentIF,
  ReservedReqI,
  RootStateIF,
  SelectOptionsI,
  StaffPaymentIF,
  StateIF,
  StatsI,
  SubmissionTypeT
} from '@/interfaces'
import {
  CompanyTypes,
  EntityTypes,
  Location,
  NrAffiliationErrors,
  NrRequestActionCodes,
  NrRequestTypeCodes,
  NrState,
  PriorityCode,
  XproNameType
} from '@/enums'

// List Data
// NB: can't use `this.$xxx` because we don't have `this` (ie, Vue)
import {
  BcMapping,
  BusinessLookupEntityTypes,
  BusinessLookupRequestActions,
  CanJurisdictions,
  ConversionTypes,
  Designations,
  EntityTypesBcData,
  EntityTypesXproData,
  IntlJurisdictions,
  Locations,
  MrasJurisdictions,
  NumberedEntityTypes,
  RequestActions,
  XproMapping
} from '@/list-data'

export const isMobile = (state: StateIF): boolean => {
  // fallback to base window width if no window size changes have occurred
  const width = (state.stateModel.windowWidth || window.innerWidth)
  const vuetifySm = getVuetify().framework.breakpoint.thresholds.sm
  return (width < vuetifySm)
}

/** True if user is authenticated, else False. */
export const isAuthenticated = (rootState: RootStateIF): boolean => {
  return Boolean(rootState.auth?.token)
}

export const getCurrentJsDate = (state: StateIF): Date => {
  return state.stateModel.common.currentJsDate
}

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

export const getLocation = (state: StateIF): Location => {
  return state.stateModel.newRequestModel.location
}

/** True if current request location is Canadian. */
export const isCanadian = (state: StateIF): boolean => {
  return (isLocationCA(state) && getJurisdictionCd(state) !== Location.FD)
}

/** True if current request location is Federal. */
export const isFederal = (state: StateIF): boolean => {
  return (isLocationCA(state) && getJurisdictionCd(state) === Location.FD)
}

/** True if current request location is International. */
export const isInternational = (state: StateIF): boolean => {
  return (isLocationIN(state))
}

export const getLocationText = (state: StateIF): string => {
  return getLocationOptions(state).find(options => options.value === getLocation(state))?.text
}

export const getJurisdictionCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_jurisdiction_cd
}

export const getJurisdictionText = (state: StateIF): string => {
  return (isLocationCA(state))
    ? CanJurisdictions.find(jur => jur.value === getJurisdictionCd(state))?.text
    : IntlJurisdictions.find(jur => jur.value === getJurisdictionCd(state))?.text
}

export const getMrasSearchResultCode = (state: StateIF): number => {
  return state.stateModel.newRequestModel.mrasSearchResultCode
}

export const getEntityTypeCd = (state: StateIF): EntityTypes => {
  return state.stateModel.newRequestModel.entity_type_cd
}

export const getOriginEntityTypeCd = (state: StateIF): EntityTypes => {
  return state.stateModel.newRequestModel.origin_entity_type_cd
}

/** The Request Code. */
export const getRequestActionCd = (state: StateIF): NrRequestActionCodes => {
  return state.stateModel.newRequestModel.request_action_cd
}

export const getApplicant = (state: StateIF): ApplicantI => {
  return state.stateModel.newRequestModel.applicant
}

export const getCorpSearch = (state: StateIF): string => {
  return state.stateModel.newRequestModel.corpSearch
}

/**
 * True if current request action is a new business.
 * NB: may be a BC or Xpro business.
 */
export const isNewBusiness = (state: StateIF): boolean => {
  return (getRequestActionCd(state) === NrRequestActionCodes.NEW_BUSINESS)
}

/** True if current request action is Amalgamation. */
export const isAmalgamation = (state: StateIF): boolean => {
  return (getRequestActionCd(state) === NrRequestActionCodes.AMALGAMATE)
}

/** True if current request action is Assumed. */
export const isAssumed = (state: StateIF): boolean => {
  return (getRequestActionCd(state) === NrRequestActionCodes.ASSUMED)
}

/** True if current request action is Change Name. */
export const isChangeName = (state: StateIF): boolean => {
  return (getRequestActionCd(state) === NrRequestActionCodes.CHANGE_NAME)
}

/** True if current request action is Continuation In (aka Move). */
export const isContinuationIn = (state: StateIF): boolean => {
  return (getRequestActionCd(state) === NrRequestActionCodes.MOVE)
}

/** True if current request action is Conversion (aka Alteration). */
export const isConversion = (state: StateIF): boolean => {
  return (getRequestActionCd(state) === NrRequestActionCodes.CONVERSION)
}

/** True if current request action is Restoration. */
export const isRestoration = (state: StateIF): boolean => {
  return (getRequestActionCd(state) === NrRequestActionCodes.RESTORE)
}

/**
 * True if current flow supports XPRO (includes AMALGAMATION, NEW_BUSINESS, RESTORATION and CHANGE_NAME).
 * FUTURE: Might need to add others.
 */
export const isXproFlow = (state: StateIF): boolean => {
  return (
    (
      (getRequestActionCd(state) === NrRequestActionCodes.AMALGAMATE) ||
      (getRequestActionCd(state) === NrRequestActionCodes.NEW_BUSINESS) ||
      (getRequestActionCd(state) === NrRequestActionCodes.RESTORE) ||
      (getRequestActionCd(state) === NrRequestActionCodes.CHANGE_NAME)
    ) &&
    [Location.CA, Location.IN].includes(getLocation(state))
  )
}

export const getExistingRequestSearch = (state: StateIF): ExistingRequestSearchI => {
  return state.stateModel.newRequestModel.existingRequestSearch
}

export const getDoNameCheck = (state: StateIF): boolean => {
  return state.stateModel.nameCheckModel.doNameCheck
}

export const getErrors = (state: StateIF): string[] => {
  return state.stateModel.newRequestModel.errors
}

export const getHasNoCorpNum = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.noCorpNum
}

export const getCorpNum = (state: StateIF): string => {
  return state.stateModel.newRequestModel.corpNum
}

export const isNameEnglish = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.nameIsEnglish
}

export const getExtendedRequestType = (state: StateIF): SelectOptionsI => {
  return state.stateModel.newRequestModel.extendedRequestType
}

export const getRequestTypeOptions = (state: StateIF): RequestActionsI[] => {
  const option = RequestActions.find(type => type.value === NrRequestActionCodes.NEW_BUSINESS)
  option.rank = 1
  const options = [option]
  let n = 2
  if (getExtendedRequestType(state)) {
    getExtendedRequestType(state).rank = 2
    options.push(getExtendedRequestType(state))
    n = 3
  }
  const { requestTypeCd } = getNr(state)
  if (
    getEditMode(state) &&
    [XproNameType.AS, XproNameType.AL, XproNameType.XASO, XproNameType.XCASO, XproNameType.UA].includes(requestTypeCd)
  ) {
    options.push({ text: 'Assume an', value: NrRequestActionCodes.ASSUMED, rank: n })
    n++
  }
  options.push({ text: 'View All Request Actions', value: NrRequestActionCodes.INFO, rank: n })

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
}

/** Return persons name flag. */
export const getIsPersonsName = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.isPersonsName
}

export const getDoNotAnalyzeEntities = (state: StateIF): EntityTypes[] => {
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

export const getConversionType = (state: StateIF): NrRequestTypeCodes => {
  return state.stateModel.newRequestModel.conversionType
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

export const isAssumedName = (state: StateIF): boolean => {
  return !!state.stateModel.newRequestModel.assumedNameOriginal
}

export const getShowActualInput = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.showActualInput
}

export const getAnalysisJSON = (state: StateIF): AnalysisJSONI => {
  return state.stateModel.newRequestModel.analysisJSON
}

export const getQuickSearchNames = (state: StateIF): any[] => {
  return state.stateModel.newRequestModel.quickSearchNames
}

export const getIssueIndex = (state: StateIF): number => {
  return state.stateModel.newRequestModel.issueIndex
}

export const getHotjarUserId = (state: StateIF): string => {
  return state.stateModel.newRequestModel.hotjarUserId
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
    const list = [...getEntityTypesBC(state), ...getEntityTypesXPRO(state)]
    const type = list.find(t => t.value === getEntityTypeCd(state))
    return type?.text
  }
  return ''
}

export const getDesignationIssueTypes = (state: StateIF): string[] => {
  return state.stateModel.newRequestModel.designationIssueTypes
}

export const getConversionTypeOptions = (state: StateIF): ConversionTypesI[] => {
  const selected = state.stateModel.newRequestModel.origin_entity_type_cd
  let options = [...ConversionTypes].filter(type => type.origin_entity_type_cd === selected)
  let n = 3

  if (getConversionTypeAddToSelect(state)) {
    getConversionTypeAddToSelect(state).rank = 4
    options = options.concat(getConversionTypeAddToSelect(state))
    n = 4 // eslint-disable-line @typescript-eslint/no-unused-vars
  }
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

/** True if location is British Columbia. */
export const isLocationBC = (state: StateIF): boolean => {
  return (getLocation(state) === Location.BC)
}

/** True if location is Canada. */
export const isLocationCA = (state: StateIF): boolean => {
  return (getLocation(state) === Location.CA)
}

/** True if location is International. */
export const isLocationIN = (state: StateIF): boolean => {
  return (getLocation(state) === Location.IN)
}

/** Map the appropriate Blurb based on the request action and location */
export const getEntityBlurbs = (state: StateIF): Array<EntityI | ConversionTypesI> => {
  if (isNewBusiness(state)) {
    if (isLocationBC(state)) {
      return EntityTypesBcData
    }
    if (isLocationCA(state)) {
      return EntityTypesXproData
    }
    if (isLocationIN(state)) {
      return EntityTypesXproData.map(x => ({ ...x, blurbs: x.intBlurbs }))
    }
  }

  if (isContinuationIn(state)) {
    if (isLocationBC(state)) {
      return EntityTypesBcData.map(x => ({ ...x, blurbs: x.mveBlurbs }))
    }
  }

  if (isRestoration(state)) {
    if (isLocationBC(state)) {
      return EntityTypesBcData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
    }
    if ([Location.CA, Location.IN].includes(getLocation(state))) {
      return EntityTypesXproData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
    }
  }

  if (isAmalgamation(state)) {
    const bc = EntityTypesBcData.map(x => ({ ...x, blurbs: x.amlBlurbs }))
    const xpro = EntityTypesXproData.map(x => ({ ...x, blurbs: x.amlBlurbs }))
    return bc.concat(xpro)
  }

  if (isChangeName(state)) {
    if (isLocationBC(state)) {
      return EntityTypesBcData.map(x => ({ ...x, blurbs: x.chgBlurbs }))
    }
    if (isLocationCA(state)) {
      return EntityTypesXproData.map(x => ({ ...x, blurbs: x.chgBlurbs[0] }))
    }
    if (isLocationIN(state)) {
      // If international blurb is the same as national, map that blurb
      return EntityTypesXproData.map(x => ({ ...x, blurbs: x.chgBlurbs[1] || x.chgBlurbs[0] }))
    }
  }

  if (isConversion(state)) {
    if (isLocationBC(state)) {
      return ConversionTypes
    }
  }

  return []
}

/** The BC Entity Types. */
export const getEntityTypesBC = (state: StateIF): EntityI[] => {
  try {
    const generateEntities = (entities) => {
      const output = []
      for (const entity of entities) {
        const obj = EntityTypesBcData.find(ent => ent.value === entity)
        // "CR" type is shortlisted
        // if CR exists in filtered entity_types, preserve its rank and shortlist keys
        if (entity === EntityTypes.CR) {
          output.push(obj)
          continue
        }
        const objSansRankAndShortlist = {}
        for (const key in obj) {
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
    const mapping = BcMapping
    const cds = Object.keys(mapping)
    if (cds.includes(getRequestActionCd(state))) {
      return generateEntities(mapping[getRequestActionCd(state)])
    }

    return EntityTypesBcData
  } catch (err) {
    console.error('entityTypesBC() =', err) // eslint-disable-line no-console
    return []
  }
}

/** Get Xpro entity types. */
export const getEntityTypesXPRO = (state: StateIF): EntityI[] => {
  let _entityTypesXproData = EntityTypesXproData
  if (isLocationCA(state)) {
    _entityTypesXproData = _entityTypesXproData.filter(ent => ent.value !== EntityTypes.RLC)
  }

  try {
    const generateEntities = (entities) => {
      const output = []
      for (const entity of entities) {
        // use EntityTypesXproData instead of scoped _entityTypesXproData here so that RLC can be included
        const obj = EntityTypesXproData.find(ent => ent.value === entity)
        // "CR" type is shortlisted
        // if XCR exists in filtered entity_types, preserve its rank and shortlist keys
        if (entity === EntityTypes.XCR) {
          output.push(obj)
          continue
        }
        if (isLocationCA(state) && entity === EntityTypes.RLC) {
          continue
        }
        const objSansRankAndShortlist = {}
        for (const key in obj) {
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
    const mapping = XproMapping
    const cds = Object.keys(mapping)

    if (cds.includes(getRequestActionCd(state))) {
      return generateEntities(mapping[getRequestActionCd(state)])
    }

    return _entityTypesXproData
  } catch (err) {
    console.error('entityTypesXPRO() =', err) // eslint-disable-line no-console
    return _entityTypesXproData
  }
}

// For reference, see request_type_mapping in Namex constants file.
export const getXproRequestTypeCd = (state: StateIF): XproNameType => {
  if (isAssumedName(state)) {
    switch (getEntityTypeCd(state)) {
      // Xpro Limited Liability Company REST/REN/REH/RESUBMIT -> Xpro Limited Liability Company AS/RESUBMIT
      case EntityTypes.RLC: return XproNameType.AL
      // Xpro Corporation NEW_AML/NEW/AML/RESUBMIT -> Xpro Corporation AS/RESUBMIT
      case EntityTypes.XCR: return XproNameType.AS
    }
  }
  return null
}

/** Get entity type options (short list only). */
export const getEntityTypeOptions = (state: StateIF): Array<EntityI> => {
  const bcOptions: SelectOptionsI[] = getEntityTypesBC(state)?.filter(x => {
    if (isContinuationIn(state) && isLocationBC(state)) {
      // Shortlist order: Limited Company, Unlimited Liability Company
      if (x.value === EntityTypes.UL) {
        x.shortlist = true
        x.rank = 2
      } else if ([EntityTypes.FR, EntityTypes.GP, EntityTypes.UL].includes(x.value)) {
        x.shortlist = null
        x.rank = null
      }
    } else if (isRestoration(state) && isLocationBC(state)) {
      // Shortlist order: Limited Company, Cooperative Association
      if (x.value === EntityTypes.CP) {
        x.shortlist = true
        x.rank = 2
      } else if ([EntityTypes.FR, EntityTypes.GP, EntityTypes.UL].includes(x.value)) {
        x.shortlist = null
        x.rank = null
      }
    } else if (isAmalgamation(state)) {
      // Shortlist order: Limited Company, Unlimited Liability Company
      if (x.value === EntityTypes.UL) {
        x.shortlist = true
        x.rank = 2
      } else if ([EntityTypes.FR, EntityTypes.GP, EntityTypes.CP].includes(x.value)) {
        x.shortlist = null
        x.rank = null
      }
    } else {
      // Shortlist order: Limited Company, Sole Proprietorship, DBA, General Partnership
      if ([EntityTypes.UL, EntityTypes.CP].includes(x.value)) {
        x.shortlist = null
        x.rank = null
      } else if (x.value === EntityTypes.FR) {
        x.shortlist = true
        x.rank = 2
      } else if (x.value === EntityTypes.DBA) {
        x.shortlist = true
        x.rank = 3
      } else if (x.value === EntityTypes.GP) {
        x.shortlist = true
        x.rank = 4
      }
    }
    if (x.shortlist) {
      return x
    }
  })

  const xproOptions: SelectOptionsI[] = getEntityTypesXPRO(state).filter(x => {
    if (
      isNewBusiness(state) &&
      (isLocationCA(state) || isLocationIN(state))
    ) {
      // Shortlist order: Limited Company, Limited Partnership
      if (x.value === EntityTypes.XLP) {
        x.shortlist = true
        x.rank = 2
      } else if (x.value === EntityTypes.XCP) {
        x.shortlist = null
        x.rank = null
      }
    } else if (
      isContinuationIn(state) &&
      (isLocationCA(state) || isLocationIN(state))
    ) {
      // Shortlist order: Limited Company, Cooperative Association
      if (x.value === EntityTypes.XLP) {
        x.shortlist = null
        x.rank = null
      } else if (x.value === EntityTypes.XCP) {
        x.shortlist = true
        x.rank = 2
      }
    } else if (
      isChangeName(state) &&
      (isLocationCA(state) || isLocationIN(state))
    ) {
      // Shortlist order: Limited Company, Limited Partnership, Limited Liability Partnership
      if (x.value === EntityTypes.XLP) {
        x.shortlist = true
        x.rank = 2
      } else if (x.value === EntityTypes.XLL) {
        x.shortlist = true
        x.rank = 3
      } else if (x.value === EntityTypes.XCP) {
        x.shortlist = null
        x.rank = null
      }
    }
    if (x.shortlist) {
      return x
    }
  })

  let options: SelectOptionsI[]
  // special case for amalgamation - ignore location
  if (isAmalgamation(state)) options = [...bcOptions]
  else if (isLocationBC(state)) options = [...bcOptions]
  else options = [...xproOptions]
  let n = 4

  // add recently-used entry to list
  const entityTypeAddToSelect = getEntityTypeAddToSelect(state)
  if (entityTypeAddToSelect) {
    options.push({ ...entityTypeAddToSelect, rank: 4 })
    n = 5
  }

  options.push({ text: 'View all business types', value: 'INFO', rank: n })

  return options.sort((a, b) => {
    if (a.rank < b.rank) return -1
    if (a.rank > b.rank) return 1
    return 0
  })
}

/** Returned the filtered location options. */
export const getLocationOptions = (state: StateIF): Array<any> => {
  if (isConversion(state)) {
    return Locations.filter(location => location.value === Location.BC)
  }
  if (isAssumed(state)) {
    return Locations.filter(location => location.value !== Location.BC)
  }
  if (isContinuationIn(state)) {
    return Locations.filter(location => location.value === Location.BC)
  }
  if (isAmalgamation(state)) {
    return Locations.filter(location => location.value === Location.BC)
  }
  return Locations.filter(() => true) // copy of Locations
}

/** Return true if the name is slashed. */
export const isNameSlashed = (state: StateIF): boolean => {
  if (getName(state)) {
    let name = getName(state)
    if (name.includes('/') && name.split('/').length === 2) {
      name = name.replace(/(\s+|(?=.))\/(\s+|(?=.))/g, '/')
      const leftSideWords = name.split('/')[0].split(' ')
      const rightSideWords = name.split('/')[1].split(' ')
      if (leftSideWords.length >= 2 && rightSideWords.length >= 2) {
        return true
      }
    }
  }
  return false
}

export const getShowCorpNum = (state: StateIF): boolean => {
  return (isBusinessLookupRequestAction(state) && isBusinessLookupEntityType(state))
}

export const getCorpNumForReservation = (state: StateIF): any => {
  // this function may supply empty keys for various properties
  // which is necessary to effect their deletion during the PATCH operation
  const ret = {
    corpNum: '',
    homeJurisNum: getNrData(state).homeJurisNum,
    tradeMark: getNrData(state).tradeMark, // may be empty
    xproJurisdiction: getNrData(state).xproJurisdiction // may be empty
  }
  if (getShowCorpNum(state)) {
    ret.corpNum = getCorpNum(state)
    ret.homeJurisNum = ''
  }
  return ret
}

export const getEditNameReservation = (state: StateIF): NameRequestI => {
  const nrData = {}
  for (const key in getNrData(state)) {
    // only set truthy keys
    if (getNrData(state)[key]) {
      nrData[key] = getNrData(state)[key]
    }
  }

  const data: NameRequestI = {
    applicants: [getApplicant(state)],
    request_action_cd: getRequestActionCd(state),
    entity_type_cd: getEntityTypeCd(state),
    ...nrData,
    ...getCorpNumForReservation(state) // must be last
  }
  if (getXproRequestTypeCd(state)) {
    data['request_type_cd'] = getXproRequestTypeCd(state)
  }
  if (getNrState(state) === NrState.DRAFT) {
    data['names'] = getNrRequestNames(state)
  }
  return data
}

export const getShowPriorityRequest = (state: StateIF): boolean => {
  return (!getEditMode(state) && getNrState(state) === NrState.DRAFT) ||
    (!getEditMode(state) && getSubmissionType(state) === 'examination')
}

//
// Modal Getters
//
export const getPickEntityModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.pickEntityModalVisible
}

export const getExitModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.exitModalVisible
}

export const getExitIncompletePaymentVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.exitIncompletePaymentVisible
}

export const getAffiliationErrorModalValue = (state: StateIF): NrAffiliationErrors => {
  return state.stateModel.newRequestModel.affiliationErrorModalValue
}

export const getConditionsModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.conditionsModalVisible
}

export const getSocietiesModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.societiesModalVisible
}

export const getHelpMeChooseModalVisible = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.helpMeChooseModalVisible
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
  return state.stateModel.newRequestModel.priorityRequest || false
}

export const getDesignationObject = (state: StateIF): any => {
  if (getEntityTypeCd(state) && Designations[getEntityTypeCd(state)]) {
    return Designations[getEntityTypeCd(state)]
  }
  return ''
}

export const getSplitNameDesignation = (state: StateIF): NameDesignationI => {
  if (getName(state) && getDesignationObject(state)?.end) {
    const { words } = getDesignationObject(state)
    for (const word of words) {
      if (getName(state).endsWith(word)) {
        const designation = word
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

  for (const step in getRequestExaminationOrProvideConsent(state)) {
    if (getRequestExaminationOrProvideConsent(state)[step].obtain_consent) {
      const words = getAnalysisJSON(state).issues[step].name_actions.map(action => action.word)
      consentWords = consentWords.concat(words)
    }
  }
  return consentWords
}

export const getConsentConflicts = (state: StateIF): ConsentConflictI => {
  const output: ConsentConflictI = {
    name: ''
  }

  if (!getAnalysisJSON(state)) return output

  for (const key in getRequestExaminationOrProvideConsent(state)) {
    if (getRequestExaminationOrProvideConsent(state)[key].conflict_self_consent) {
      output.name = getAnalysisJSON(state).issues[key].conflicts[0].name
      if (getAnalysisJSON(state).issues[key].conflicts[0].id) {
        output.corpNum = getAnalysisJSON(state).issues[key].conflicts[0].id
      }
    }
  }
  return output
}

//
// JSON Request Constructors
//
export const getNrRequestNames = (state: StateIF): RequestNameI[] => {
  const nameChoices = getNameChoices(state)
  const nrNames = getNrNames(state)

  const defaultValues = {
    name_type_cd: getAssumedName(state) ? XproNameType.AS : XproNameType.CO,
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
          const des = nameChoices[`designation${choiceIdx}`]
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
    if (getEntityTypeCd(state) && isLocationBC(state) && Designations[getEntityTypeCd(state)]?.end) {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const nrData = {}
  for (const key in getNrData(state)) {
    if (getNrData(state)[key]) {
      nrData[key] = getNrData(state)[key]
    }
  }

  const data: DraftReqI = {
    applicants: [applicant],
    names: nrRequestNames,
    ...nrData,
    priorityCd: getPriorityRequest(state) ? PriorityCode.YES : PriorityCode.NO,
    entity_type_cd: getEntityTypeCd(state),
    request_action_cd: getRequestActionCd(state),
    conversion_type_cd: getConversionType(state),
    stateCd: NrState.DRAFT,
    english: isNameEnglish(state),
    nameFlag: getIsPersonsName(state),
    hotjarUserId: getHotjarUserId(state),
    submit_count: 0,
    ...getCorpNumForReservation(state) // must be last
  }
  if (getXproRequestTypeCd(state)) {
    data['request_type_cd'] = getXproRequestTypeCd(state)
  }
  if (isAssumedName(state)) {
    if (!data['additionalInfo']) {
      data['additionalInfo'] = ''
    } else {
      data['additionalInfo'] += '\n\n'
    }
    if (!data['additionalInfo'].includes('*** Registered Name:')) {
      const notice = `*** Registered Name: ${getAssumedName(state)} ***`
      data['additionalInfo'] += ' ' + notice
    }
  }
  for (const step in getRequestExaminationOrProvideConsent(state)) {
    if (getRequestExaminationOrProvideConsent(state)[step].obtain_consent ||
      getRequestExaminationOrProvideConsent(state)[step].conflict_self_consent) {
      if (!data['additionalInfo']) {
        data['additionalInfo'] = ''
      }
      if (!data['additionalInfo'].includes('*** Consent will be supplied')) {
        data['additionalInfo'] += '\n\n'
        const notice = `*** Consent will be supplied ***`
        data['additionalInfo'] += ' ' + notice
      }
    }
    if (getLocation(state) !== Location.BC) {
      if (getRequestExaminationOrProvideConsent(state)[step].obtain_consent ||
        getRequestExaminationOrProvideConsent(state)[step].send_to_examiner) {
        if (!data['additionalInfo']) {
          data['additionalInfo'] = ''
        }
        if (!data['additionalInfo'].includes('*** Legal Name:')) {
          data['additionalInfo'] += '\n\n'
          const notice = `*** Legal Name: ${getNameChoices(state)?.name1} ***`
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
    priorityCd: PriorityCode.NO,
    entity_type_cd: getEntityTypeCd(state), // FUTURE: fix entity_type_cd type
    request_action_cd: getRequestActionCd(state),
    stateCd: NrState.RESERVED,
    english: isNameEnglish(state),
    nameFlag: getIsPersonsName(state),
    hotjarUserId: getHotjarUserId(state),
    submit_count: 0,
    ...getCorpNumForReservation(state) // must be last
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
      name_type_cd: isAssumedName(state) ? XproNameType.AS : XproNameType.CO,
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
    priorityCd: PriorityCode.NO,
    entity_type_cd: getEntityTypeCd(state), // FUTURE: fix entity_type_cd type
    request_action_cd: getRequestActionCd(state),
    request_type_cd: getXproRequestTypeCd(state) || '',
    stateCd: NrState.COND_RESERVED,
    english: isNameEnglish(state),
    nameFlag: getIsPersonsName(state),
    hotjarUserId: getHotjarUserId(state),
    submit_count: 0,
    ...getCorpNumForReservation(state) // must be last
  }
  return data
}

/** The user's keycloak roles. */
export const getKeycloakRoles = (state: StateIF): Array<string> => {
  return state.stateModel.common.keycloakRoles
}

/** Whether the user has "staff" keycloak role. */
export const isRoleStaff = (state: StateIF): boolean => {
  return state.stateModel.common.keycloakRoles.includes('staff')
}

/** Whether the user has "staff" keycloak role. */
export const isRoleBasic = (state: StateIF): boolean => {
  return (
    state.stateModel.common.keycloakRoles.includes('basic') ||
    state.stateModel.common.keycloakRoles.includes('premium')
  )
}

/** The staff payment. */
export const getStaffPayment = (state: StateIF): StaffPaymentIF => {
  return state.stateModel.staffPayment
}

/** The folio number. */
export const getFolioNumber = (state: StateIF): string => {
  return state.stateModel.newRequestModel.folioNumber
}

//
// Name Check Getters
// FUTURE: move existing getters used only for name check above to here
// FUTURE: eventually move this all out of vuex (if we refactor to composition api)
//
export const getConflictsConditional = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.conflictsConditional
}

export const getConflictsConditionalInstructions = (state: StateIF): Array<ConditionalInstructionI> => {
  return state.stateModel.nameCheckModel.conflictsConditionalInstructions
}

export const getConflictsExact = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.conflictsExact
}

export const getConflictsRestricted = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.conflictsRestricted
}

export const getConflictsSimilar = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.conflictsSimilar
}

export const getDesignation = (state: StateIF): string => {
  return state.stateModel.nameCheckModel.designation
}

export const getDesignationsCheckUse = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.designationsCheckUse
}

export const getDesignationsMismatched = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.designationsMismatched
}

export const getDesignationsMisplaced = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.designationsMisplaced
}

export const getFullName = (state: StateIF): string => {
  return state.stateModel.nameCheckModel.fullName
}

export const getNameCheckErrors = (state: StateIF): NameCheckErrorI => {
  return state.stateModel.nameCheckModel.errors
}

export const getNumbersCheckUse = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.numbersCheckUse
}

export const getSpecialCharacters = (state: StateIF): Array<string> => {
  return state.stateModel.nameCheckModel.specialCharacters
}

export const isAnalyzeConflictsPending = (state: StateIF): boolean => {
  return state.stateModel.nameCheckModel.analyzeConflictsPending
}

export const isAnalyzeDesignationPending = (state: StateIF): boolean => {
  return state.stateModel.nameCheckModel.analyzeDesignationPending
}

export const isAnalyzeStructurePending = (state: StateIF): boolean => {
  return state.stateModel.nameCheckModel.analyzeStructurePending
}

export const isMissingDescriptive = (state: StateIF): boolean => {
  return state.stateModel.nameCheckModel.missingDescriptive
}

export const isMissingDesignation = (state: StateIF): boolean => {
  return state.stateModel.nameCheckModel.missingDesignation
}

export const isMissingDistinctive = (state: StateIF): boolean => {
  return state.stateModel.nameCheckModel.missingDistinctive
}

export const getRefundParams = (state: StateIF): RefundParamsIF => {
  return state.stateModel.refundParams
}

export const getIncorporateNowErrorStatus = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.errorIncorporateNow
}

export const getAmalgamateNowErrorStatus = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.errorAmalgamateNow
}

export const getContinuationInErrorStatus = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.errorContinuationIn
}

/** True if current request action requires business lookup. */
export const isBusinessLookupRequestAction = (state: StateIF): boolean => {
  return BusinessLookupRequestActions.includes(getRequestActionCd(state))
}

/** True if current entity type supports the numbered company option. */
export const isNumberedEntityType = (state: StateIF): boolean => {
  return NumberedEntityTypes.includes(getEntityTypeCd(state))
}

/** True if current entity type requires business lookup. */
export const isBusinessLookupEntityType = (state: StateIF): boolean => {
  return BusinessLookupEntityTypes.includes(getEntityTypeCd(state))
}

/** True if current jurisdiction is a MRAS jurisdiction. */
export const isMrasJurisdiction = (state: StateIF): boolean => {
  const xproJurisdiction = getJurisdictionText(state)
  return MrasJurisdictions.includes(xproJurisdiction?.toLowerCase())
}

//
// Search Page Getters
//
export const getSearchBusiness = (state: StateIF): BusinessSearchIF => {
  return state.stateModel.newRequestModel.search.business
}

export const getSearchCompanyType = (state: StateIF): CompanyTypes => {
  return state.stateModel.newRequestModel.search.companyType
}

export const getSearchJurisdiction = (state: StateIF): any => {
  return state.stateModel.newRequestModel.search.jurisdiction
}

export const getSearchRequest = (state: StateIF): RequestActionsI => {
  return state.stateModel.newRequestModel.search.request
}
