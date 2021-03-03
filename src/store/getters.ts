import { StateIF } from '@/interfaces'
import {
  ApplicantI, EntityI, ExistingRequestSearchI, NameRequestI, RequestActionMappingI, SelectOptionsI
} from '@/interfaces/models'
import {
  $colinRequestActions, $colinRequestTypes, $xproColinRequestTypes, bcMapping, xproMapping
} from '@/store/list-data/request-action-mapping'

// List Data
import { EntityTypesBCData, EntityTypesXPROData, RequestActions } from './list-data'
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
export const getLocation = (state: StateIF): string => {
  return state.stateModel.newRequestModel.location
}

/** Returns the location. */
export const getEntityTypeCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.entity_type_cd
}

/** Returns the current action code. */
export const getRequestActionCd = (state: StateIF): string => {
  return state.stateModel.newRequestModel.request_action_cd
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

// /** Return the cancelled analysis boolean. */
// export const getUserCancelledAnalysis = (state: StateIF): boolean => {
//   return state.stateModel.newRequestModel.userCancelledAnalysis
// }

/** Return the BC Entity Types. */
export const getEntityTypesBC = (state: StateIF): Array<EntityI> => {
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
      return generateEntities(mapping[this.request_action_cd])
    }

    return EntityTypesBCData
  } catch (err) {
    console.error('entityTypesBC() =', err) // eslint-disable-line no-console
    return this.entityTypesBCData
  }
}

/** Get Xpro entity types. */
export const getEntityTypesXPRO = (state: StateIF): Array<EntityI> => {
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
export const getEntityTypeOptions = (state: StateIF) => {
  let bcOptions: SelectOptionsI[] = getEntityTypesBC(state).filter(x => {
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
    } else if (this.request_action_cd === 'AML' && getLocation(state) === 'BC') {
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
    if (this.request_action_cd === 'NEW' && ['CA', 'IN'].includes(getLocation(state))) {
      // Shortlist order: Limited company, Limited partnership
      if (x.value === 'XLP') {
        x.shortlist = true
        x.rank = 2
      } else if (x.value === 'XCP') {
        x.shortlist = null
        x.rank = null
      }
    } else if (this.request_action_cd === 'MVE' && ['CA', 'IN'].includes(getLocation(state))) {
      // Shortlist order: Limited company, Cooperative association
      if (x.value === 'XLP') {
        x.shortlist = null
        x.rank = null
      } else if (x.value === 'XCP') {
        x.shortlist = true
        x.rank = 2
      }
    } else if (this.request_action_cd === 'CHG' && ['CA', 'IN'].includes(getLocation(state))) {
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

  if (this.entityTypeAddToSelect) {
    this.entityTypeAddToSelect.rank = 4
    options = options.concat(this.entityTypeAddToSelect)
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
