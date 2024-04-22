import { Component, Vue } from 'vue-property-decorator'
import { EntityTypes, PriorityCode, NrRequestActionCodes, NrRequestTypeCodes } from '@/enums'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { GetFeatureFlag } from '@/plugins'

@Component({})
export class CommonMixin extends Vue {
  /** True if Jest is running the code. */
  get isJestRunning (): boolean {
    return (process.env.JEST_WORKER_ID !== undefined)
  }

  /** Returns the specified string in Title Case. */
  toTitleCase (str: string): string {
    return str && str
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /** Returns entity type text for the the specified code. */
  // FUTURE: use GetCorpFullDescription() instead
  entityTypeCdToText (cd: EntityTypes): string {
    switch (cd) {
      // BC Entity Types:
      case EntityTypes.BC: return 'BC Benefit Company'
      case EntityTypes.CC: return 'BC Community Contribution Company'
      case EntityTypes.CP: return 'BC Cooperative Association'
      case EntityTypes.CR: return 'BC Limited Company'
      case EntityTypes.DBA: return 'BC "Doing Business As" name (DBA)'
      case EntityTypes.FI: return 'BC Credit Union'
      case EntityTypes.FR: return 'BC Sole Proprietorship'
      case EntityTypes.GP: return 'BC General Partnership'
      case EntityTypes.LL: return 'BC Limited Liability Partnership'
      case EntityTypes.LP: return 'BC Limited Partnership'
      case EntityTypes.PA: return 'BC Private Act'
      case EntityTypes.PAR: return 'BC Parish'
      case EntityTypes.SO: return 'BC Social Enterprise'
      case EntityTypes.SP: return 'BC Sole Proprietorship'
      case EntityTypes.UL: return 'BC Unlimited Liability Company'

      // Continuation In Entity Types:
      case EntityTypes.C: return 'Continuation In (BC Limited Company)'
      case EntityTypes.CBEN: return 'Continuation In (Benefit Company)'
      case EntityTypes.CCC: return 'Continuation In (BC Community Contribution Company)'
      case EntityTypes.CUL: return 'Continuation In (BC Unlimited Liability Company)'

      // XPRO Entity Types:
      case EntityTypes.XCR: return 'Extraprovincial Limited Company'
      case EntityTypes.XUL: return 'Extraprovincial Unlimited Liability Company'
      case EntityTypes.RLC: return 'Extraprovincial Limited Liability Company'
      case EntityTypes.XLP: return 'Extraprovincial Limited Partnership'
      case EntityTypes.XLL: return 'Extraprovincial Limited Liability Partnership'
      case EntityTypes.XCP: return 'Extraprovincial Cooperative Association'
      case EntityTypes.XSO: return 'Extraprovincial Social Enterprise'

      default: return (cd as unknown as string)
    }
  }

  /**
   * The alternate codes for entity types.
   * Alternate codes are used in Entities UIs.
   */
  entityTypeToCorpType (entityType: EntityTypes): CorpTypeCd {
    switch (entityType) {
      case EntityTypes.BC: return CorpTypeCd.BENEFIT_COMPANY
      case EntityTypes.C: return CorpTypeCd.CONTINUE_IN
      case EntityTypes.CBEN: return CorpTypeCd.BEN_CONTINUE_IN
      case EntityTypes.CC: return CorpTypeCd.BC_CCC
      case EntityTypes.CCC: return CorpTypeCd.CCC_CONTINUE_IN
      case EntityTypes.CP: return CorpTypeCd.COOP
      case EntityTypes.CR: return CorpTypeCd.BC_COMPANY
      case EntityTypes.CUL: return CorpTypeCd.ULC_CONTINUE_IN
      case EntityTypes.DBA: return CorpTypeCd.SOLE_PROP // same as FR
      case EntityTypes.FI: return CorpTypeCd.FINANCIAL
      case EntityTypes.FR: return CorpTypeCd.SOLE_PROP
      case EntityTypes.GP: return CorpTypeCd.PARTNERSHIP
      case EntityTypes.LL: return CorpTypeCd.LL_PARTNERSHIP
      case EntityTypes.LLC: return CorpTypeCd.LIMITED_CO // same as RLC
      case EntityTypes.LP: return CorpTypeCd.LIM_PARTNERSHIP
      case EntityTypes.PA: return CorpTypeCd.PRIVATE_ACT
      case EntityTypes.PAR: return CorpTypeCd.PARISHES
      case EntityTypes.RLC: return CorpTypeCd.LIMITED_CO
      case EntityTypes.SO: return CorpTypeCd.SOCIETY
      case EntityTypes.UL: return CorpTypeCd.BC_ULC_COMPANY
      case EntityTypes.XCP: return CorpTypeCd.XPRO_COOP
      case EntityTypes.XCR: return CorpTypeCd.EXTRA_PRO_A
      case EntityTypes.XL: return CorpTypeCd.XPRO_LL_PARTNR // same as XLL
      case EntityTypes.XLL: return CorpTypeCd.XPRO_LL_PARTNR
      case EntityTypes.XLP: return CorpTypeCd.XPRO_LIM_PARTNR
      case EntityTypes.XP: return CorpTypeCd.XPRO_LIM_PARTNR // same as XLP
      case EntityTypes.XSO: return CorpTypeCd.XPRO_SOCIETY
      case EntityTypes.XUL: return CorpTypeCd.XPRO_UNLIMITED_LIABILITY_COMPANY
      default: return null
    }
  }

  /**
   * Entities UI codes to Name Request Code.
   * @example ULC --> UL
   */
  corpTypeToEntityType (entityType: CorpTypeCd): EntityTypes {
    switch (entityType) {
      case CorpTypeCd.BEN_CONTINUE_IN: return EntityTypes.CBEN
      case CorpTypeCd.BENEFIT_COMPANY: return EntityTypes.BC
      case CorpTypeCd.BC_CCC: return EntityTypes.CC
      case CorpTypeCd.BC_COMPANY: return EntityTypes.CR
      case CorpTypeCd.BC_ULC_COMPANY: return EntityTypes.UL
      case CorpTypeCd.CCC_CONTINUE_IN: return EntityTypes.CCC
      case CorpTypeCd.COOP: return EntityTypes.CP
      case CorpTypeCd.CONTINUE_IN: return EntityTypes.C
      case CorpTypeCd.EXTRA_PRO_A: return EntityTypes.XCR
      case CorpTypeCd.FINANCIAL: return EntityTypes.FI
      case CorpTypeCd.PARTNERSHIP: return EntityTypes.GP
      case CorpTypeCd.LIMITED_CO: return EntityTypes.RLC
      case CorpTypeCd.LIM_PARTNERSHIP: return EntityTypes.LP
      case CorpTypeCd.LL_PARTNERSHIP: return EntityTypes.LL
      case CorpTypeCd.PRIVATE_ACT: return EntityTypes.PA
      case CorpTypeCd.PARISHES: return EntityTypes.PAR
      case CorpTypeCd.SOCIETY: return EntityTypes.SO
      case CorpTypeCd.SOLE_PROP: return EntityTypes.FR
      case CorpTypeCd.ULC_CONTINUE_IN: return EntityTypes.CUL
      case CorpTypeCd.XPRO_COOP: return EntityTypes.XCP
      case CorpTypeCd.XPRO_CORPORATION: return EntityTypes.XCR
      case CorpTypeCd.XPRO_LIM_PARTNR: return EntityTypes.XLP
      case CorpTypeCd.XPRO_LL_PARTNR: return EntityTypes.XLL
      case CorpTypeCd.XPRO_SOCIETY: return EntityTypes.XSO
      case CorpTypeCd.XPRO_UNLIMITED_LIABILITY_COMPANY: return EntityTypes.XUL
      default: return null
    }
  }

  /**
   * Returns request action text for the the specified code.
   * See namex -> api/namex/resources/name_requests/report_resource.py::_get_request_action_cd_description()
   */
  requestActionCdToText (cd: NrRequestActionCodes, isXpro = false): string {
    switch (cd) {
      case NrRequestActionCodes.NEW_BUSINESS: return isXpro ? 'Extraprovincial Registration' : 'New Business'
      case NrRequestActionCodes.MOVE: return 'Continuation In'
      case NrRequestActionCodes.RESTORE: return 'Restoration or Reinstatement'
      case NrRequestActionCodes.AMALGAMATE: return 'Amalgamation'
      case NrRequestActionCodes.CHANGE_NAME: return 'Name Change'
      case NrRequestActionCodes.CONVERSION: return 'Alteration'
      case NrRequestActionCodes.DBA: return 'Doing Business As'
      case NrRequestActionCodes.ASSUMED: return 'Assumed Named'
      case NrRequestActionCodes.RENEW: return 'Restoration or Reinstatement'
      case NrRequestActionCodes.RESTORATION: return 'Restoration or Reinstatement'
      // the following may be returned by the namex API:
      case 'NRO-NEWAML' as any: return 'Amalgamation'
      case 'NRO-REST' as any: return 'Restoration or Reinstatement'

      default: return cd
    }
  }

  /** Returns true if the specified alteration NR is allowed to be done online. */
  isAlterOnline (type: NrRequestTypeCodes): boolean {
    return !(
      type === NrRequestTypeCodes.CONVERT_BEN ||
      type === NrRequestTypeCodes.CONVERT_CORP ||
      type === NrRequestTypeCodes.CONVERT_ULBE
    )
  }

  /** Returns true if the specified NR is a priority request. */
  isPriorityReq (nr: any): boolean {
    return (nr?.priorityCd === PriorityCode.YES)
  }

  /**
   * Returns true if society NRs are enabled -- in case societies NRs need to be released
   * separately from the Way of Navigating feature changes.
   */
  isSocietyEnabled (): boolean {
    return GetFeatureFlag('enable-society')
  }

  /** Returns true if the specified NR is for a firm (SP/GP). */
  isFirm (nr: any): boolean {
    return [
      EntityTypes.SP,
      EntityTypes.DBA,
      EntityTypes.GP
    ].includes(nr?.legalType)
  }

  /** Returns true if the specified entity type is allowed for incorporation / registration. */
  isSupportedIncorporationRegistration (type: EntityTypes): boolean {
    const supportedEntites = GetFeatureFlag('supported-incorporation-registration-entities')
    return supportedEntites.includes(type)
  }

  /** Returns true if the specified request type is allowed for alteration (conversion). */
  isSupportedAlteration (type: NrRequestTypeCodes): boolean {
    const supportedAlterationTypes = GetFeatureFlag('supported-alteration-types')
    return supportedAlterationTypes.includes(type)
  }

  /** Returns true if the specified entity type is allowed for amalgamation. */
  isSupportedAmalgamation (type: EntityTypes): boolean {
    const supportedAmalgamationEntities = GetFeatureFlag('supported-amalgamation-entities')
    return supportedAmalgamationEntities.includes(type)
  }

  /** Returns true if the specified entity type is allowed for name change. */
  isSupportedChangeName (type: EntityTypes): boolean {
    const supportedChangeNameEntities = GetFeatureFlag('supported-name-change-entities')
    return supportedChangeNameEntities.includes(type)
  }

  /** Returns true if the specified entity type is allowed for continuation in. */
  isSupportedContinuationIn (type: EntityTypes): boolean {
    const supportedContInEntites = GetFeatureFlag('supported-continuation-in-entities')
    return supportedContInEntites.includes(type)
  }

  /** Returns true if the specified entity type is allowed for restoration/reinstatement. */
  isSupportedRestoration (type: EntityTypes): boolean {
    const supportedRestorationEntites = GetFeatureFlag('supported-restoration-entities')
    return supportedRestorationEntites.includes(type)
  }

  /** Returns true if the specified entity type is for an Extraprovincial Company. */
  isXproEntityType (type: EntityTypes): boolean {
    return [
      EntityTypes.RLC,
      EntityTypes.XCP,
      EntityTypes.XCR,
      EntityTypes.XLL,
      EntityTypes.XLP,
      EntityTypes.XSO,
      EntityTypes.XUL
    ].includes(type)
  }

  /** Scroll to given element Id */
  scrollTo (id: string): void {
    return document.getElementById(id)?.scrollIntoView()
  }
}
