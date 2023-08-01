import { Component, Vue } from 'vue-property-decorator'
import { EntityType, PriorityCode, NrRequestActionCodes } from '@/enums'
import { EmptyBusinessLookup } from '@/interfaces'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { GetFeatureFlag } from '@/plugins'

@Component({})
export class CommonMixin extends Vue {
  // Local properties
  inProgressBusinessLookup = EmptyBusinessLookup

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
  entityTypeCdToText (cd: EntityType): string {
    switch (cd) {
      // BC Entity Types:
      case EntityType.BC: return 'BC Benefit Company'
      case EntityType.CC: return 'BC Community Contribution Company'
      case EntityType.CP: return 'BC Cooperative Association'
      case EntityType.CR: return 'BC Limited Company'
      case EntityType.DBA: return 'BC "Doing Business As" name (DBA)'
      case EntityType.FI: return 'BC Credit Union'
      case EntityType.FR: return 'BC Sole Proprietorship'
      case EntityType.GP: return 'BC General Partnership'
      case EntityType.LL: return 'BC Limited Liability Partnership'
      case EntityType.LP: return 'BC Limited Partnership'
      case EntityType.PA: return 'BC Private Act'
      case EntityType.PAR: return 'BC Parish'
      case EntityType.SO: return 'BC Social Enterprise'
      case EntityType.SP: return 'BC Sole Proprietorship'
      case EntityType.UL: return 'BC Unlimited Liability Company'

      // XPRO Entity Types:
      case EntityType.XCR: return 'Extraprovincial Limited Company'
      case EntityType.XUL: return 'Extraprovincial Unlimited Liability Company'
      case EntityType.RLC: return 'Extraprovincial Limited Liability Company'
      case EntityType.XLP: return 'Extraprovincial Limited Partnership'
      case EntityType.XLL: return 'Extraprovincial Limited Liability Partnership'
      case EntityType.XCP: return 'Extraprovincial Cooperative Association'
      case EntityType.XSO: return 'Extraprovincial Social Enterprise'

      default: return (cd as unknown as string)
    }
  }

  /**
   * The alternate codes for entity types.
   * Alternate codes are used in Entities UIs.
   */
  entityTypeAlternateCode (entityType: EntityType): CorpTypeCd {
    switch (entityType) {
      case EntityType.BC: return CorpTypeCd.BENEFIT_COMPANY
      case EntityType.CC: return CorpTypeCd.BC_CCC
      case EntityType.CR: return CorpTypeCd.BC_COMPANY
      case EntityType.UL: return CorpTypeCd.BC_ULC_COMPANY
      default: return null
    }
  }

  /**
   * Returns request action text for the the specified code.
   * See namex -> api/namex/resources/name_requests/report_resource.py::_get_request_action_cd_description()
   */
  requestActionCdToText (cd: NrRequestActionCodes): string {
    switch (cd) {
      case NrRequestActionCodes.NEW_BUSINESS: return 'New Business'
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

  /** Returns true if the specified NR is a priority request. */
  isPriorityReq (nr: any): boolean {
    return (nr?.priorityCd === PriorityCode.YES)
  }

  /** Returns true if the specified NR is for a supported Incorporation Entity Type (FF). */
  isSupportedEntity (nr: any): boolean {
    const supportedEntites = GetFeatureFlag('supported-incorporation-registration-entities')
    return supportedEntites.includes(nr?.entity_type_cd)
  }

  /** Returns true if the specified NR is for a firm (SP/GP). */
  isFirm (nr: any): boolean {
    return (
      nr?.legalType === EntityType.SP ||
      nr?.legalType === EntityType.DBA ||
      nr?.legalType === EntityType.GP)
  }

  /** Returns true if the specified NR is for an Extraprovincial Company. */
  isXProCompany (nr: any): boolean {
    return [EntityType.XCR, EntityType.XUL, EntityType.RLC, EntityType.XLP, EntityType.XLL,
      EntityType.XCP, EntityType.XSO].includes(nr?.entity_type_cd)
  }

  /** Scroll to given element Id */
  scrollTo (id: string): void {
    return document.getElementById(id)?.scrollIntoView()
  }
}
