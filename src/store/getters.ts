import { ConversionTypesI, LocationT, StateIF, StatsI } from '@/interfaces'
import {
  ApplicantI, EntityI, ExistingRequestSearchI, NameRequestI, RequestActionMappingI, SelectOptionsI
} from '@/interfaces/models'
import {
  $colinRequestActions, $colinRequestTypes, $xproColinRequestTypes, bcMapping, xproMapping
} from '@/store/list-data/request-action-mapping'

// List Data
import { ConversionTypes, EntityTypesBCData, EntityTypesXPROData, Locations, RequestActions } from './list-data'
import { $mrasJurisdictions } from '@/store/list-data/canada-jurisdictions'

// TODO: Apply StateIF to state types after store transition

/** Returns the name. */
export const getName = (state: StateIF): string => {
  return state.stateModel.newRequestModel.name
}

/** Returns the original name. */
export const getOriginalName = (state: StateIF): string => {
  return state.stateModel.newRequestModel.nameOriginal
}

/** Returns the assumed name. */
export const getAssumedName = (state: StateIF): string => {
  return state.stateModel.newRequestModel.assumedNameOriginal
}

/** Returns the nr. */
export const getNr = (state: StateIF): Partial<NameRequestI> => {
  return state.stateModel.newRequestModel.nr
}

/** Returns the nr id. */
export const getNrId = (state: StateIF): string => {
  return state.stateModel.newRequestModel.nr.id
}

/** Returns the nr state. */
export const getNrState = (state: StateIF): string => {
  return state.stateModel.newRequestModel.nr.state
}

/** Returns the location. */
export const getLocation = (state: StateIF): LocationT => {
  return state.stateModel.newRequestModel.location
}

export const getLocationText = (state: StateIF): string => {
  return getLocationOptions(state).find(options => options.value === getLocation(state))?.text
}

/** Return the current jurisdiction code. */
export const getJurisdiction = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_jurisdiction_cd
}

/** Returns the entity type code. */
export const getEntityTypeCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.entity_type_cd
}

/** Returns the current action code. */
export const getRequestActionCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_action_cd
}

/** Return the request text. */
export const getRequestText = (state: StateIF): string => {
  return RequestActions.find(options => options.value === getRequestActionCd(state))?.text
}

/** Returns the current request jurisdiction code. */
export const getRequestJurisdictionCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_jurisdiction_cd
}

/** Returns the original request action code. */
export const getRequestActionOriginal = (state: StateIF): string => {
  return state.stateModel.newRequestModel.requestActionOriginal
}

/** Returns the applicant info. */
export const getApplicant = (state: StateIF): ApplicantI => {
  return state.stateModel.newRequestModel.applicant
}

/** Returns the corp seracho. */
export const getCorpSearch = (state: StateIF): string => {
  return state.stateModel.newRequestModel.corpSearch
}

/** Returns the analyze pending boolean. */
export const getAnalyzePending = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.analyzePending
}

export const getIsConversion = (state: StateIF): boolean => {
  return getRequestActionCd(state) === 'CNV'
}

/** Return the existing request data. */
export const getExistingRequestSearch = (state: StateIF): ExistingRequestSearchI => {
  return state.stateModel.newRequestModel.existingRequestSearch
}

/** Return the current quick search flag. */
export const getQuickSearch = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.quickSearch
}

/** Return the current errors. */
export const getErrors = (state: StateIF): string[] => {
  return state.stateModel.newRequestModel.errors
}

/** Return true if XproMras. */
export const getIsXproMras = (state: StateIF): boolean => {
  return (['CA', 'IN'].includes(getLocation(state)) && getRequestActionCd(state) !== 'MVE')
}

/** Return noCorpNum flag. */
export const getHasNoCorpNum = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.noCorpNum
}

/** Return english name flag. */
export const getNameIsEnglish = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.nameIsEnglish
}

/** Return persons name flag. */
export const getIsPersonsName = (state: StateIF): boolean => {
  return state.stateModel.newRequestModel.isPersonsName
}

/** Return the array of entities to NOT analyze. */
export const getDoNotAnalyzeEntities = (state: StateIF): string[] => {
  return state.stateModel.newRequestModel.doNotAnalyzeEntities
}

/** Return the cancelled analysis boolean. */
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

export const getShowNoCorpDesignation = (state: StateIF): boolean => {
  return ['DBA', 'FR', 'GP'].includes(getEntityTypeCd(state))
}

export const getSubmissionTabNumber = (state: StateIF): number => {
  return state.stateModel.newRequestModel.submissionTabNumber
}

export const getEntityTextFromValue = (state: StateIF): string => {
  if (getEntityTypeCd(state)) {
    let list = [...getEntityTypesBC(state), ...getEntityTypesXPRO(state)]
    let type = list.find(t => t.value === getEntityTypeCd(state))
    return type?.text
  }
  return ''
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
  // NEW REQUEST
    case 'NEW':
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBCData
      }
      if (['CA'].includes(getLocation(state))) {
        return EntityTypesXPROData
      }
      if (['IN'].includes(getLocation(state))) {
        return EntityTypesXPROData.map(x => ({ ...x, blurbs: x.intBlurbs }))
      }
      break
      // MOVE REQUEST
    case 'MVE':
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBCData.map(x => ({ ...x, blurbs: x.mveBlurbs }))
      }
      break
      // RESTORE OR REINSTATE REQUEST
    case 'REH':
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBCData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
      }
      if (['CA', 'IN'].includes(getLocation(state))) {
        return EntityTypesXPROData.map(x => ({ ...x, blurbs: x.rehBlurbs }))
      }
      break
      // AMALGAMATE REQUEST
    case 'AML':
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBCData.map(x => ({ ...x, blurbs: x.amlBlurbs }))
      }
      if (['CA'].includes(getLocation(state))) {
        return EntityTypesXPROData.map(x => ({ ...x, blurbs: x.amlBlurbs[0] }))
      }
      if (['IN'].includes(getLocation(state))) {
        // If international blurb is the same as national, map that blurb
        return EntityTypesXPROData.map(x => ({ ...x, blurbs: x.amlBlurbs[1] || x.amlBlurbs[0] }))
      }
      break
      // CHANGE NAME REQUEST
    case 'CHG':
      if (['BC'].includes(getLocation(state))) {
        return EntityTypesBCData.map(x => ({ ...x, blurbs: x.chgBlurbs }))
      }
      if (['CA'].includes(getLocation(state))) {
        return EntityTypesXPROData.map(x => ({ ...x, blurbs: x.chgBlurbs[0] }))
      }
      if (['IN'].includes(getLocation(state))) {
        // If international blurb is the same as national, map that blurb
        return EntityTypesXPROData.map(x => ({ ...x, blurbs: x.chgBlurbs[1] || x.chgBlurbs[0] }))
      }
      break
      // CONVERSION REQUEST
    case 'CNV':
      if (['BC'].includes(getLocation(state))) {
        return ConversionTypes
      }
      break
  }
  return null
}

/** Return the BC Entity Types. */
export const getEntityTypesBC = (state: StateIF): EntityI[] => {
  try {
    let generateEntities = (entities) => {
      let output = []
      for (let entity of entities) {
        let obj = EntityTypesBCData.find(ent => ent.value === entity)
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

    // see 'src/store/list-data/request-action-mapping.ts'
    let mapping: RequestActionMappingI = bcMapping
    let cds = Object.keys(mapping)
    if (cds.includes(getRequestActionCd(state))) {
      return generateEntities(mapping[getRequestActionCd(state)])
    }

    return EntityTypesBCData
  } catch (err) {
    console.error('entityTypesBC() =', err) // eslint-disable-line no-console
    return this.entityTypesBCData
  }
}

/** Get Xpro entity types. */
export const getEntityTypesXPRO = (state: StateIF): EntityI[] => {
  let entityTypesXPROData = EntityTypesXPROData
  if (getLocation(state) === 'CA') {
    entityTypesXPROData = entityTypesXPROData.filter(ent => ent.value !== 'RLC')
  }

  try {
    let generateEntities = (entities) => {
      let output = []
      for (let entity of entities) {
      // using this.entityTypesXPROData instead of scoped entityTypesXPROData here so that RLC can be included
        let obj = entityTypesXPROData.find(ent => ent.value === entity)
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

    // see 'src/store/list-data/request-action-mapping.ts'
    let mapping: RequestActionMappingI = xproMapping
    let cds = Object.keys(mapping)

    if (cds.includes(getRequestActionCd(state))) {
      return generateEntities(mapping[getRequestActionCd(state)])
    }

    return entityTypesXPROData
  } catch (err) {
    console.error('entityTypesXPRO() =', err) // eslint-disable-line no-console
    return entityTypesXPROData
  }
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
  return Locations
}

/** Return true if the name is Slashed */
export const getNameIsSlashed = (state: StateIF) => {
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
  if (($colinRequestActions.includes(this.request_action_cd) && $colinRequestTypes.includes(getEntityTypeCd(state))) ||
    this.entity_type_cd === 'DBA') {
    return 'colin'
  }
  if ($colinRequestActions.includes(this.request_action_cd) &&
    $xproColinRequestTypes.includes(getEntityTypeCd(state))) {
    return 'colin'
  }
  let mrasEntities = ['XCR', 'XLP', 'UL', 'CR', 'CP', 'BC', 'CC']
  let { xproJurisdiction } = this.nrData

  if ($mrasJurisdictions.includes(xproJurisdiction?.toLowerCase()) && mrasEntities.includes(getEntityTypeCd(state))) {
    if (getLocation(state) === 'CA' && ['NEW', 'ASSUMED'].includes(getRequestActionCd(state))) {
      return 'mras'
    }
    if (getLocation(state) === 'BC' && ['MVE'].includes(getRequestActionCd(state))) {
      return 'mras'
    }
  }
  return false
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
