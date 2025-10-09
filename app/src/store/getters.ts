import Vue, { computed } from 'vue'
import Vuetify from 'vuetify'
import { defineStore } from 'pinia'
import { useState } from './state'
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
  // RootStateIF,
  SelectOptionsI,
  StaffPaymentIF,
  StatsI,
  SubmissionTypeT
} from '@/interfaces'
import {
  AuthorizedActions,
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

export const useGetters = defineStore('store.getters', () => {
  const state = useState()

  /** True if current screen width is mobile. */
  const isMobile = computed((): boolean => {
    // fall back to base window width if no window size changes have occurred
    const width = (state.windowWidth || window.innerWidth)
    const vuetifySm = new Vuetify().framework.breakpoint.thresholds.sm
    return (width < vuetifySm)
  })

  /** True if user is authenticated, else False. */
  const isAuthenticated = computed((): boolean => {
    // *** TODO: check root store `token` instead?
    //            (what is root store called?)
    //            delete RootStateIF if unused
    // get state from common auth store
    return Vue.prototype.$store.getters['auth/isAuthenticated'] || false
  })

  const getCurrentJsDate = computed((): Date => {
    console.log('*** getCurrentJsDate =', state.common.currentJsDate)
    return state.common.currentJsDate
  })

  const getName = computed((): string => {
    return state.newRequestModel.name
  })

  const getOriginalName = computed((): string => {
    return state.newRequestModel.nameOriginal
  })

  const getAssumedName = computed((): string => {
    return state.newRequestModel.assumedNameOriginal
  })

  const getNr = computed((): Partial<NameRequestI> => {
    return state.newRequestModel.nr
  })

  const getNrNames = computed((): any => {
    return state.newRequestModel.nr.names
  })

  const getNrData = computed((): any => {
    return state.newRequestModel.nrData
  })

  const getNrId = computed((): string => {
    return state.newRequestModel.nr.id
  })

  const getNrNum = computed((): string => {
    return state.newRequestModel.nr.nrNum
  })

  const getNrState = computed((): NrState => {
    return state.newRequestModel.nr.state
  })

  const getLocation = computed((): Location => {
    return state.newRequestModel.location
  })

  /** True if current request location is Canadian. */
  const isCanadian = computed((): boolean => {
    return (isLocationCA.value && getJurisdictionCd.value !== Location.FD)
  })

  /** True if current request location is Federal. */
  const isFederal = computed((): boolean => {
    return (isLocationCA.value && getJurisdictionCd.value === Location.FD)
  })

  /** True if current request location is International. */
  const isInternational = computed((): boolean => {
    return (isLocationIN.value)
  })

  const getLocationText = computed((): string => {
    return getLocationOptions.value.find(options => options.value === getLocation.value)?.text
  })

  const getJurisdictionCd = computed((): string => {
    return state.newRequestModel.request_jurisdiction_cd
  })

  const getJurisdictionText = computed((): string => {
    return (isLocationCA.value)
      ? CanJurisdictions.find(jur => jur.value === getJurisdictionCd.value)?.text
      : IntlJurisdictions.find(jur => jur.value === getJurisdictionCd.value)?.text
  })

  const getMrasSearchResultCode = computed((): number => {
    return state.newRequestModel.mrasSearchResultCode
  })

  const getEntityTypeCd = computed((): EntityTypes => {
    return state.newRequestModel.entity_type_cd
  })

  const getOriginEntityTypeCd = computed((): EntityTypes => {
    return state.newRequestModel.origin_entity_type_cd
  })

  /** The Request Code. */
  const getRequestActionCd = computed((): NrRequestActionCodes => {
    return state.newRequestModel.request_action_cd
  })

  const getApplicant = computed((): ApplicantI => {
    return state.newRequestModel.applicant
  })

  const getCorpSearch = computed((): string => {
    return state.newRequestModel.corpSearch
  })

  /**
   * True if current request action is a new business.
   * NB: may be a BC or Xpro business.
   */
  const isNewBusiness = computed((): boolean => {
    return (getRequestActionCd.value === NrRequestActionCodes.NEW_BUSINESS)
  })

  /** True if current request action is Amalgamation. */
  const isAmalgamation = computed((): boolean => {
    return (getRequestActionCd.value === NrRequestActionCodes.AMALGAMATE)
  })

  /** True if current request action is Assumed. */
  const isAssumed = computed((): boolean => {
    return (getRequestActionCd.value === NrRequestActionCodes.ASSUMED)
  })

  /** True if current request action is Change Name. */
  const isChangeName = computed((): boolean => {
    return (getRequestActionCd.value === NrRequestActionCodes.CHANGE_NAME)
  })

  /** True if current request action is Continuation In (aka Move). */
  const isContinuationIn = computed((): boolean => {
    return (getRequestActionCd.value === NrRequestActionCodes.MOVE)
  })

  /** True if current request action is Conversion (aka Alteration). */
  const isConversion = computed((): boolean => {
    return (getRequestActionCd.value === NrRequestActionCodes.CONVERSION)
  })

  /** True if current request action is Restoration. */
  const isRestoration = computed((): boolean => {
    return (getRequestActionCd.value === NrRequestActionCodes.RESTORE)
  })

  /**
   * True if current flow supports XPRO (includes AMALGAMATION, NEW_BUSINESS, RESTORATION and CHANGE_NAME).
   * FUTURE: Might need to add others.
   */
  const isXproFlow = computed((): boolean => {
    return (
      (
        (getRequestActionCd.value === NrRequestActionCodes.AMALGAMATE) ||
        (getRequestActionCd.value === NrRequestActionCodes.NEW_BUSINESS) ||
        (getRequestActionCd.value === NrRequestActionCodes.RESTORE) ||
        (getRequestActionCd.value === NrRequestActionCodes.CHANGE_NAME)
      ) &&
      [Location.CA, Location.IN].includes(getLocation.value)
    )
  })

  const getExistingRequestSearch = computed((): ExistingRequestSearchI => {
    return state.newRequestModel.existingRequestSearch
  })

  const getDoNameCheck = computed((): boolean => {
    return state.nameCheckModel.doNameCheck
  })

  // NOTE - there is a different getErrors in the error store
  const getErrors = computed((): string[] => {
    return state.newRequestModel.errors
  })

  const getHasNoCorpNum = computed((): boolean => {
    return state.newRequestModel.noCorpNum
  })

  const getCorpNum = computed((): string => {
    return state.newRequestModel.corpNum
  })

  const isNameEnglish = computed((): boolean => {
    return state.newRequestModel.nameIsEnglish
  })

  const getExtendedRequestType = computed((): SelectOptionsI => {
    return state.newRequestModel.extendedRequestType
  })

  const getRequestTypeOptions = computed((): RequestActionsI[] => {
    const option = RequestActions.find(type => type.value === NrRequestActionCodes.NEW_BUSINESS)
    option.rank = 1
    const options = [option]
    let n = 2
    if (getExtendedRequestType.value) {
      getExtendedRequestType.value.rank = 2
      options.push(getExtendedRequestType.value)
      n = 3
    }
    const { requestTypeCd } = getNr.value
    if (
      getEditMode.value &&
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
  })

  const getNameChoices = computed((): NameChoicesIF => {
    return state.newRequestModel.nameChoices
  })

  /** Return persons name flag. */
  const getIsPersonsName = computed((): boolean => {
    return state.newRequestModel.isPersonsName
  })

  const getIsLearBusiness = computed((): boolean => {
    return state.newRequestModel.isLearBusiness
  })

  const getDoNotAnalyzeEntities = computed((): EntityTypes[] => {
    return state.newRequestModel.doNotAnalyzeEntities
  })

  const getUserCancelledAnalysis = computed((): boolean => {
    return state.newRequestModel.userCancelledAnalysis
  })

  const getDisplayedComponent = computed((): string => {
    return state.newRequestModel.displayedComponent
  })

  const getStats = computed((): StatsI => {
    return state.newRequestModel.stats
  })

  const getTabNumber = computed((): number => {
    return state.newRequestModel.tabNumber
  })

  const getConversionType = computed((): NrRequestTypeCodes => {
    return state.newRequestModel.conversionType
  })

  const getConversionTypeAddToSelect = computed((): ConversionTypesI => {
    return state.newRequestModel.conversionTypeAddToSelect
  })

  const getEntityTypeAddToSelect = computed((): SelectOptionsI => {
    return state.newRequestModel.entityTypeAddToSelect
  })

  const getEditMode = computed((): boolean => {
    return state.newRequestModel.editMode
  })

  const getActingOnOwnBehalf = computed((): boolean => {
    return state.newRequestModel.actingOnOwnBehalf
  })

  const getSubmissionTabNumber = computed((): number => {
    return state.newRequestModel.submissionTabNumber
  })

  const getSubmissionType = computed((): SubmissionTypeT => {
    return state.newRequestModel.submissionType
  })

  const getIsLoadingSubmission = computed((): boolean => {
    return state.newRequestModel.isLoadingSubmission
  })

  const getAddressSuggestions = computed((): any[] => {
    return state.newRequestModel.addressSuggestions
  })

  const isAssumedName = computed((): boolean => {
    return !!state.newRequestModel.assumedNameOriginal
  })

  const getShowActualInput = computed((): boolean => {
    return state.newRequestModel.showActualInput
  })

  const getAnalysisJSON = computed((): AnalysisJSONI => {
    return state.newRequestModel.analysisJSON
  })

  const getQuickSearchNames = computed((): any[] => {
    return state.newRequestModel.quickSearchNames
  })

  const getIssueIndex = computed((): number => {
    return state.newRequestModel.issueIndex
  })

  const getHotjarUserId = computed((): string => {
    return state.newRequestModel.hotjarUserId
  })

  const getCurrentIssue = computed((): IssueI => {
    if (!getAnalysisJSON.value) return null

    if (getAnalysisJSON.value && getAnalysisJSON.value.issues && Array.isArray(getAnalysisJSON.value.issues)) {
      return getAnalysisJSON.value.issues[getIssueIndex.value]
    }

    return null
  })

  const getRequestExaminationOrProvideConsent = computed((): RequestOrConsentIF => {
    return state.newRequestModel.requestExaminationOrProvideConsent
  })

  const getEntityTextFromValue = computed((): string => {
    if (getEntityTypeCd.value) {
      const list = [...getEntityTypesBC.value, ...getEntityTypesXPRO.value]
      const type = list.find(t => t.value === getEntityTypeCd.value)
      return type?.text
    }
    return ''
  })

  const getDesignationIssueTypes = computed((): string[] => {
    return state.newRequestModel.designationIssueTypes
  })

  const getConversionTypeOptions = computed((): ConversionTypesI[] => {
    const selected = state.newRequestModel.origin_entity_type_cd
    let options = [...ConversionTypes].filter(type => type.origin_entity_type_cd === selected)
    let n = 3

    if (getConversionTypeAddToSelect.value) {
      getConversionTypeAddToSelect.value.rank = 4
      options = options.concat(getConversionTypeAddToSelect.value)
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
  })

  /** True if location is British Columbia. */
  const isLocationBC = computed((): boolean => {
    return (getLocation.value === Location.BC)
  })

  /** True if location is Canada. */
  const isLocationCA = computed((): boolean => {
    return (getLocation.value === Location.CA)
  })

  /** True if location is International. */
  const isLocationIN = computed((): boolean => {
    return (getLocation.value === Location.IN)
  })

  /** Map the appropriate Blurb based on the request action and location */
  const getEntityBlurbs = computed((): Array<EntityI | ConversionTypesI> => {
    if (isNewBusiness.value) {
      if (isLocationBC.value) {
        return EntityTypesBcData
      }
      if (isLocationCA.value) {
        return EntityTypesXproData
      }
      if (isLocationIN.value) {
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.intBlurbs }))
      }
    }

    if (isContinuationIn.value) {
      if (isLocationBC.value) {
        return EntityTypesBcData.map(x => ({ ...x, blurbs: x.mveBlurbs }))
      }
    }

    if (isRestoration.value) {
      if (isLocationBC.value) {
        return EntityTypesBcData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
      }
      if ([Location.CA, Location.IN].includes(getLocation.value)) {
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
      }
    }

    if (isAmalgamation.value) {
      const bc = EntityTypesBcData.map(x => ({ ...x, blurbs: x.amlBlurbs }))
      const xpro = EntityTypesXproData.map(x => ({ ...x, blurbs: x.amlBlurbs }))
      return bc.concat(xpro)
    }

    if (isChangeName.value) {
      if (isLocationBC.value) {
        return EntityTypesBcData.map(x => ({ ...x, blurbs: x.chgBlurbs }))
      }
      if (isLocationCA.value) {
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.chgBlurbs[0] }))
      }
      if (isLocationIN.value) {
        // If international blurb is the same as national, map that blurb
        return EntityTypesXproData.map(x => ({ ...x, blurbs: x.chgBlurbs[1] || x.chgBlurbs[0] }))
      }
    }

    if (isConversion.value) {
      if (isLocationBC.value) {
        return ConversionTypes
      }
    }

    return []
  })

  /** The BC Entity Types. */
  const getEntityTypesBC = computed((): EntityI[] => {
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
      if (cds.includes(getRequestActionCd.value)) {
        return generateEntities(mapping[getRequestActionCd.value])
      }

      return EntityTypesBcData
    } catch (err) {
      console.error('entityTypesBC() =', err) // eslint-disable-line no-console
      return []
    }
  })

  /** Get Xpro entity types. */
  const getEntityTypesXPRO = computed((): EntityI[] => {
    let _entityTypesXproData = EntityTypesXproData
    if (isLocationCA.value) {
      _entityTypesXproData = _entityTypesXproData.filter(ent => ent.value !== EntityTypes.RLC)
    }
    _entityTypesXproData = _entityTypesXproData.filter(ent => ent.value !== EntityTypes.XUL)

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
          if (isLocationCA.value && entity === EntityTypes.RLC) {
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

      if (cds.includes(getRequestActionCd.value)) {
        return generateEntities(mapping[getRequestActionCd.value])
      }

      return _entityTypesXproData
    } catch (err) {
      console.error('entityTypesXPRO() =', err) // eslint-disable-line no-console
      return _entityTypesXproData
    }
  })

  // For reference, see request_type_mapping in Namex constants file.
  const getXproRequestTypeCd = computed((): XproNameType => {
    if (isAssumedName.value) {
      switch (getEntityTypeCd.value) {
        // Xpro Limited Liability Company REST/REN/REH/RESUBMIT -> Xpro Limited Liability Company AS/RESUBMIT
        case EntityTypes.RLC: return XproNameType.AL
        // Xpro Corporation NEW_AML/NEW/AML/RESUBMIT -> Xpro Corporation AS/RESUBMIT
        case EntityTypes.XCR: return XproNameType.AS
      }
    }
    return null
  })

  /** Get entity type options (short list only). */
  const getEntityTypeOptions = computed((): Array<EntityI> => {
    const bcOptions: SelectOptionsI[] = getEntityTypesBC.value?.filter(x => {
      if (isContinuationIn.value && isLocationBC.value) {
        // Shortlist order: Limited Company, Unlimited Liability Company
        if (x.value === EntityTypes.UL) {
          x.shortlist = true
          x.rank = 2
        } else if ([EntityTypes.FR, EntityTypes.GP, EntityTypes.UL].includes(x.value)) {
          x.shortlist = null
          x.rank = null
        }
      } else if (isRestoration.value && isLocationBC.value) {
        // Shortlist order: Limited Company, Cooperative Association
        if (x.value === EntityTypes.CP) {
          x.shortlist = true
          x.rank = 2
        } else if ([EntityTypes.FR, EntityTypes.GP, EntityTypes.UL].includes(x.value)) {
          x.shortlist = null
          x.rank = null
        }
      } else if (isAmalgamation.value) {
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

    const xproOptions: SelectOptionsI[] = getEntityTypesXPRO.value.filter(x => {
      if (
        isNewBusiness.value &&
        (isLocationCA.value || isLocationIN.value)
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
        isContinuationIn.value &&
        (isLocationCA.value || isLocationIN.value)
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
        isChangeName.value &&
        (isLocationCA.value || isLocationIN.value)
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
    if (isAmalgamation.value) options = [...bcOptions]
    else if (isLocationBC.value) options = [...bcOptions]
    else options = [...xproOptions]
    let n = 4

    // add recently-used entry to list
    const entityTypeAddToSelect = getEntityTypeAddToSelect.value
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
  })

  /** Returned the filtered location options. */
  const getLocationOptions = computed((): Array<any> => {
    if (isConversion.value) {
      return Locations.filter(location => location.value === Location.BC)
    }
    if (isAssumed.value) {
      return Locations.filter(location => location.value !== Location.BC)
    }
    if (isContinuationIn.value) {
      return Locations.filter(location => location.value === Location.BC)
    }
    if (isAmalgamation.value) {
      return Locations.filter(location => location.value === Location.BC)
    }
    return Locations.filter(() => true) // copy of Locations
  })

  /** Return true if the name is slashed. */
  const isNameSlashed = computed((): boolean => {
    if (getName.value) {
      let name = getName.value
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
  })

  const getShowCorpNum = computed((): boolean => {
    return (isBusinessLookupRequestAction.value && isBusinessLookupEntityType.value)
  })

  const getCorpNumForReservation = computed((): any => {
    // this function may supply empty keys for various properties
    // which is necessary to effect their deletion during the PATCH operation
    const ret = {
      corpNum: '',
      homeJurisNum: getNrData.value.homeJurisNum,
      tradeMark: getNrData.value.tradeMark, // may be empty
      xproJurisdiction: getNrData.value.xproJurisdiction // may be empty
    }
    if (getShowCorpNum.value) {
      ret.corpNum = getCorpNum.value
      ret.homeJurisNum = ''
    }
    return ret
  })

  const getEditNameReservation = computed((): NameRequestI => {
    const nrData = {}
    for (const key in getNrData.value) {
      // only set truthy keys
      if (getNrData.value[key]) {
        nrData[key] = getNrData.value[key]
      }
    }

    const data: NameRequestI = {
      applicants: [getApplicant.value],
      request_action_cd: getRequestActionCd.value,
      entity_type_cd: getEntityTypeCd.value,
      ...nrData,
      ...getCorpNumForReservation.value // must be last
    }
    if (getXproRequestTypeCd.value) {
      data['request_type_cd'] = getXproRequestTypeCd.value
    }
    if (getNrState.value === NrState.DRAFT) {
      data['names'] = getNrRequestNames.value
    }
    return data
  })

  const getShowPriorityRequest = computed((): boolean => {
    return (!getEditMode.value && getNrState.value === NrState.DRAFT) ||
      (!getEditMode.value && getSubmissionType.value === 'examination')
  })

  //
  // Modal Getters
  //
  const getPickEntityModalVisible = computed((): boolean => {
    return state.newRequestModel.pickEntityModalVisible
  })

  const getExitModalVisible = computed((): boolean => {
    return state.newRequestModel.exitModalVisible
  })

  const getExitIncompletePaymentVisible = computed((): boolean => {
    return state.newRequestModel.exitIncompletePaymentVisible
  })

  const getAffiliationErrorModalValue = computed((): NrAffiliationErrors => {
    return state.newRequestModel.affiliationErrorModalValue
  })

  const getConditionsModalVisible = computed((): boolean => {
    return state.newRequestModel.conditionsModalVisible
  })

  const getSocietiesModalVisible = computed((): boolean => {
    return state.newRequestModel.societiesModalVisible
  })

  const getHelpMeChooseModalVisible = computed((): boolean => {
    return state.newRequestModel.helpMeChooseModalVisible
  })

  const getMrasSearchInfoModalVisible = computed((): boolean => {
    return state.newRequestModel.mrasSearchInfoModalVisible
  })

  const getNrRequiredModalVisible = computed((): boolean => {
    return state.newRequestModel.nrRequiredModalVisible
  })

  const getNameAnalysisTimeout = computed((): boolean => {
    return state.newRequestModel.nameAnalysisTimedOut
  })

  const getPriorityRequest = computed((): boolean => {
    return state.newRequestModel.priorityRequest || false
  })

  const getDesignationObject = computed((): any => {
    if (getEntityTypeCd.value && Designations[getEntityTypeCd.value]) {
      return Designations[getEntityTypeCd.value]
    }
    return ''
  })

  const getSplitNameDesignation = computed((): NameDesignationI => {
    if (getName.value && getDesignationObject.value?.end) {
      const { words } = getDesignationObject.value
      for (const word of words) {
        if (getName.value.endsWith(word)) {
          const designation = word
          let name = getName.value.replace(word, '')
          name = name.trim()
          return ({ name, designation })
        }
      }
    }
    return ({
      name: '',
      designation: ''
    })
  })

  const getConsentWords = computed((): any => {
    let consentWords = []

    if (!getAnalysisJSON.value) return consentWords

    for (const step in getRequestExaminationOrProvideConsent.value) {
      if (getRequestExaminationOrProvideConsent.value[step].obtain_consent) {
        const words = getAnalysisJSON.value.issues[step].name_actions.map(action => action.word)
        consentWords = consentWords.concat(words)
      }
    }
    return consentWords
  })

  const getConsentConflicts = computed((): ConsentConflictI => {
    const output: ConsentConflictI = {
      name: ''
    }

    if (!getAnalysisJSON.value) return output

    for (const key in getRequestExaminationOrProvideConsent.value) {
      if (getRequestExaminationOrProvideConsent.value[key].conflict_self_consent) {
        output.name = getAnalysisJSON.value.issues[key].conflicts[0].name
        if (getAnalysisJSON.value.issues[key].conflicts[0].id) {
          output.corpNum = getAnalysisJSON.value.issues[key].conflicts[0].id
        }
      }
    }
    return output
  })

  //
  // JSON Request Constructors
  //
  const getNrRequestNames = computed((): RequestNameI[] => {
    const nameChoices = getNameChoices.value
    const nrNames = getNrNames.value

    const defaultValues = {
      name_type_cd: getAssumedName.value ? XproNameType.AS : XproNameType.CO,
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
          if (getEntityTypeCd.value && Designations[getEntityTypeCd.value]?.end) {
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
      if (getEntityTypeCd.value && isLocationBC.value && Designations[getEntityTypeCd.value]?.end) {
        requestNames.push({
          name: getName.value,
          designation: getSplitNameDesignation.value.designation,
          choice: 1,
          ...defaultValues
        })
      } else {
        requestNames.push({
          name: getName.value,
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
              ? getConsentWords.value.length > 0 ? getConsentWords.value : ''
              : existingName.consent_words,
            conflict1: !existingName.conflict1
              ? getConsentConflicts.value.name
              : existingName.conflict1,
            conflict1_num: existingName.conflict1_num ? existingName.conflict1_num : ''
          } as RequestNameI
        }
      }

      return { ...requestName } as RequestNameI
    })

    return requestNames
  })

  const getDraftNameReservation = computed((): DraftReqI => {
    const nrRequestNames = getNrRequestNames.value
    const applicant = getApplicant.value

    const nrData = {}
    for (const key in getNrData.value) {
      if (getNrData.value[key]) {
        nrData[key] = getNrData.value[key]
      }
    }

    const data: DraftReqI = {
      applicants: [applicant],
      names: nrRequestNames,
      ...nrData,
      priorityCd: getPriorityRequest.value ? PriorityCode.YES : PriorityCode.NO,
      entity_type_cd: getEntityTypeCd.value,
      request_action_cd: getRequestActionCd.value,
      conversion_type_cd: getConversionType.value,
      stateCd: NrState.DRAFT,
      english: isNameEnglish.value,
      nameFlag: getIsPersonsName.value,
      hotjarUserId: getHotjarUserId.value,
      submit_count: 0,
      businessAccountId: getBusinessAccountId.value,
      ...getCorpNumForReservation.value // must be last
    }
    if (getXproRequestTypeCd.value) {
      data['request_type_cd'] = getXproRequestTypeCd.value
    }
    if (isAssumedName.value) {
      if (!data['additionalInfo']) {
        data['additionalInfo'] = ''
      } else {
        data['additionalInfo'] += '\n\n'
      }
      if (!data['additionalInfo'].includes('*** Registered Name:')) {
        const notice = `*** Registered Name: ${getAssumedName.value} ***`
        data['additionalInfo'] += ' ' + notice
      }
    }
    for (const step in getRequestExaminationOrProvideConsent.value) {
      if (getRequestExaminationOrProvideConsent.value[step].obtain_consent ||
        getRequestExaminationOrProvideConsent.value[step].conflict_self_consent) {
        if (!data['additionalInfo']) {
          data['additionalInfo'] = ''
        }
        if (!data['additionalInfo'].includes('*** Consent will be supplied')) {
          data['additionalInfo'] += '\n\n'
          const notice = `*** Consent will be supplied ***`
          data['additionalInfo'] += ' ' + notice
        }
      }
      if (getLocation.value !== Location.BC) {
        if (getRequestExaminationOrProvideConsent.value[step].obtain_consent ||
          getRequestExaminationOrProvideConsent.value[step].send_to_examiner) {
          if (!data['additionalInfo']) {
            data['additionalInfo'] = ''
          }
          if (!data['additionalInfo'].includes('*** Legal Name:')) {
            data['additionalInfo'] += '\n\n'
            const notice = `*** Legal Name: ${getNameChoices.value?.name1} ***`
            data['additionalInfo'] += ' ' + notice
          }
        }
      }
    }

    return data
  })

  const getReservedNameReservation = computed((): ReservedReqI => {
    const data: ReservedReqI = {
      applicants: [getApplicant.value],
      names: getNrNames.value,
      ...getNrData.value,
      priorityCd: PriorityCode.NO,
      entity_type_cd: getEntityTypeCd.value, // FUTURE: fix entity_type_cd type
      request_action_cd: getRequestActionCd.value,
      stateCd: NrState.RESERVED,
      english: isNameEnglish.value,
      nameFlag: getIsPersonsName.value,
      hotjarUserId: getHotjarUserId.value,
      submit_count: 0,
      ...getCorpNumForReservation.value // must be last
    }
    return data
  })

  /**
   * This getter combines the NR response data objects names against nameChoices,
   * which contains the actual form values, building the request object required for a Name.
   * nameChoices are identified by the 'choice' index, which is what we use to map values.
   */
  const getConditionalNameReservation = computed((): ConditionalReqI => {
    // const { applicant, nrData, nrNames } = this
    let names
    if (getNrNames.value && getNrNames.value.length > 0) {
      // If we're updating use these mapped names -> nrRequestNames
      names = getNrRequestNames.value
    } else {
      // Otherwise we're creating a new conditional, there won't be a multiple name inputs, build as follows...
      const name: RequestNameI = {
        name: getName.value,
        choice: 1,
        designation: getSplitNameDesignation.value.designation,
        name_type_cd: isAssumedName.value ? XproNameType.AS : XproNameType.CO,
        consent_words: getConsentWords.value.length > 0 ? getConsentWords.value : '',
        conflict1: getConsentConflicts.value.name,
        conflict1_num: getConsentConflicts.value.corpNum ? getConsentConflicts.value.corpNum : ''
      }

      names = [name]
    }

    const data: ConditionalReqI = {
      applicants: [getApplicant.value],
      names: names,
      ...getNrData.value,
      priorityCd: PriorityCode.NO,
      entity_type_cd: getEntityTypeCd.value, // FUTURE: fix entity_type_cd type
      request_action_cd: getRequestActionCd.value,
      request_type_cd: getXproRequestTypeCd.value || '',
      stateCd: NrState.COND_RESERVED,
      english: isNameEnglish.value,
      nameFlag: getIsPersonsName.value,
      hotjarUserId: getHotjarUserId.value,
      submit_count: 0,
      ...getCorpNumForReservation.value // must be last
    }
    return data
  })

  /** The user's keycloak roles. */
  const getKeycloakRoles = computed((): Array<string> => {
    return state.common.keycloakRoles
  })

  /** The user's authorized actions. */
  const getAuthorizedActions = computed((): Array<AuthorizedActions> => {
    return state.common.authorizedActions
  })

  /** Whether the user has "staff" keycloak role. */
  const isRoleStaff = computed((): boolean => {
    return state.common.keycloakRoles.includes('staff')
  })

  /** Whether the user has "staff" keycloak role. */
  const isRoleBasic = computed((): boolean => {
    return (
      state.common.keycloakRoles.includes('basic') ||
      state.common.keycloakRoles.includes('premium')
    )
  })

  /** The staff payment. */
  const getStaffPayment = computed((): StaffPaymentIF => {
    return state.staffPayment
  })

  /** The folio number. */
  const getFolioNumber = computed((): string => {
    return state.newRequestModel.folioNumber
  })

  //
  // Name Check Getters
  // FUTURE: move existing getters used only for name check above to here
  // FUTURE: eventually move this all out of vuex (if we refactor to composition api)
  //
  const getConflictsConditional = computed((): Array<string> => {
    return state.nameCheckModel.conflictsConditional
  })

  const getConflictsConditionalInstructions = computed((): Array<ConditionalInstructionI> => {
    return state.nameCheckModel.conflictsConditionalInstructions
  })

  const getConflictsExact = computed((): Array<string> => {
    return state.nameCheckModel.conflictsExact
  })

  const getConflictsRestricted = computed((): Array<string> => {
    return state.nameCheckModel.conflictsRestricted
  })

  const getConflictsSimilar = computed((): Array<string> => {
    return state.nameCheckModel.conflictsSimilar
  })

  const getDesignation = computed((): string => {
    return state.nameCheckModel.designation
  })

  const getDesignationsCheckUse = computed((): Array<string> => {
    return state.nameCheckModel.designationsCheckUse
  })

  const getDesignationsMismatched = computed((): Array<string> => {
    return state.nameCheckModel.designationsMismatched
  })

  const getDesignationsMisplaced = computed((): Array<string> => {
    return state.nameCheckModel.designationsMisplaced
  })

  const getFullName = computed((): string => {
    return state.nameCheckModel.fullName
  })

  const getNameCheckErrors = computed((): NameCheckErrorI => {
    return state.nameCheckModel.errors
  })

  const getNumbersCheckUse = computed((): Array<string> => {
    return state.nameCheckModel.numbersCheckUse
  })

  const getSpecialCharacters = computed((): Array<string> => {
    return state.nameCheckModel.specialCharacters
  })

  const isAnalyzeConflictsPending = computed((): boolean => {
    return state.nameCheckModel.analyzeConflictsPending
  })

  const isAnalyzeDesignationPending = computed((): boolean => {
    return state.nameCheckModel.analyzeDesignationPending
  })

  const isAnalyzeStructurePending = computed((): boolean => {
    return state.nameCheckModel.analyzeStructurePending
  })

  const isMissingDescriptive = computed((): boolean => {
    return state.nameCheckModel.missingDescriptive
  })

  const isMissingDesignation = computed((): boolean => {
    return state.nameCheckModel.missingDesignation
  })

  const isMissingDistinctive = computed((): boolean => {
    return state.nameCheckModel.missingDistinctive
  })

  const getRefundParams = computed((): RefundParamsIF => {
    return state.refundParams
  })

  const getIncorporateNowErrorStatus = computed((): boolean => {
    return state.newRequestModel.errorIncorporateNow
  })

  const getAmalgamateNowErrorStatus = computed((): boolean => {
    return state.newRequestModel.errorAmalgamateNow
  })

  const getContinuationInErrorStatus = computed((): boolean => {
    return state.newRequestModel.errorContinuationIn
  })

  /** True if current request action requires business lookup. */
  const isBusinessLookupRequestAction = computed((): boolean => {
    return BusinessLookupRequestActions.includes(getRequestActionCd.value)
  })

  /** True if current entity type supports the numbered company option. */
  const isNumberedEntityType = computed((): boolean => {
    return NumberedEntityTypes.includes(getEntityTypeCd.value)
  })

  /** True if current entity type requires business lookup. */
  const isBusinessLookupEntityType = computed((): boolean => {
    return BusinessLookupEntityTypes.includes(getEntityTypeCd.value)
  })

  /** True if current jurisdiction is a MRAS jurisdiction. */
  const isMrasJurisdiction = computed((): boolean => {
    const xproJurisdiction = getJurisdictionText.value
    return MrasJurisdictions.includes(xproJurisdiction?.toLowerCase())
  })

  //
  // Search Page Getters
  //
  const getSearchBusiness = computed((): BusinessSearchIF => {
    return state.newRequestModel.search.business
  })

  const getSearchCompanyType = computed((): CompanyTypes => {
    return state.newRequestModel.search.companyType
  })

  const getSearchJurisdiction = computed((): any => {
    return state.newRequestModel.search.jurisdiction
  })

  const getSearchRequest = computed((): RequestActionsI => {
    return state.newRequestModel.search.request
  })

  const getBusinessAccountId = computed((): string => {
    return state.newRequestModel.businessAccountId
  })

  return {
    isMobile,
    isAuthenticated,
    getCurrentJsDate,
    getName,
    getOriginalName,
    getAssumedName,
    getNr,
    getNrNames,
    getNrData,
    getNrId,
    getNrNum,
    getNrState,
    getLocation,
    isCanadian,
    isFederal,
    isInternational,
    getLocationText,
    getJurisdictionCd,
    getJurisdictionText,
    getMrasSearchResultCode,
    getEntityTypeCd,
    getOriginEntityTypeCd,
    getRequestActionCd,
    getApplicant,
    getCorpSearch,
    isNewBusiness,
    isAmalgamation,
    isAssumed,
    isChangeName,
    isContinuationIn,
    isConversion,
    isRestoration,
    isXproFlow,
    getExistingRequestSearch,
    getDoNameCheck,
    getErrors,
    getHasNoCorpNum,
    getCorpNum,
    isNameEnglish,
    getExtendedRequestType,
    getRequestTypeOptions,
    getNameChoices,
    getIsPersonsName,
    getIsLearBusiness,
    getDoNotAnalyzeEntities,
    getUserCancelledAnalysis,
    getDisplayedComponent,
    getStats,
    getTabNumber,
    getConversionType,
    getConversionTypeAddToSelect,
    getEntityTypeAddToSelect,
    getEditMode,
    getActingOnOwnBehalf,
    getSubmissionTabNumber,
    getSubmissionType,
    getIsLoadingSubmission,
    getAddressSuggestions,
    isAssumedName,
    getShowActualInput,
    getAnalysisJSON,
    getQuickSearchNames,
    getIssueIndex,
    getHotjarUserId,
    getCurrentIssue,
    getRequestExaminationOrProvideConsent,
    getEntityTextFromValue,
    getDesignationIssueTypes,
    getConversionTypeOptions,
    isLocationBC,
    isLocationCA,
    isLocationIN,
    getEntityBlurbs,
    getEntityTypesBC,
    getEntityTypesXPRO,
    getXproRequestTypeCd,
    getEntityTypeOptions,
    getLocationOptions,
    isNameSlashed,
    getShowCorpNum,
    getCorpNumForReservation,
    getEditNameReservation,
    getShowPriorityRequest,
    getPickEntityModalVisible,
    getExitModalVisible,
    getExitIncompletePaymentVisible,
    getAffiliationErrorModalValue,
    getConditionsModalVisible,
    getSocietiesModalVisible,
    getHelpMeChooseModalVisible,
    getMrasSearchInfoModalVisible,
    getNrRequiredModalVisible,
    getNameAnalysisTimeout,
    getPriorityRequest,
    getDesignationObject,
    getSplitNameDesignation,
    getConsentWords,
    getConsentConflicts,
    getNrRequestNames,
    getDraftNameReservation,
    getReservedNameReservation,
    getConditionalNameReservation,
    getKeycloakRoles,
    getAuthorizedActions,
    isRoleStaff,
    isRoleBasic,
    getStaffPayment,
    getFolioNumber,
    getConflictsConditional,
    getConflictsConditionalInstructions,
    getConflictsExact,
    getConflictsRestricted,
    getConflictsSimilar,
    getDesignation,
    getDesignationsCheckUse,
    getDesignationsMismatched,
    getDesignationsMisplaced,
    getFullName,
    getNameCheckErrors,
    getNumbersCheckUse,
    getSpecialCharacters,
    isAnalyzeConflictsPending,
    isAnalyzeDesignationPending,
    isAnalyzeStructurePending,
    isMissingDescriptive,
    isMissingDesignation,
    isMissingDistinctive,
    getRefundParams,
    getIncorporateNowErrorStatus,
    getAmalgamateNowErrorStatus,
    getContinuationInErrorStatus,
    isBusinessLookupRequestAction,
    isNumberedEntityType,
    isBusinessLookupEntityType,
    isMrasJurisdiction,
    getSearchBusiness,
    getSearchCompanyType,
    getSearchJurisdiction,
    getSearchRequest,
    getBusinessAccountId
  }
})
