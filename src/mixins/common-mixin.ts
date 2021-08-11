import { Component, Vue } from 'vue-property-decorator'
import { EntityType, PriorityCode, RequestCode } from '@/enums'

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
  entityTypeCdToText (cd: EntityType): string {
    switch (cd) {
      // BC Entity Types:
      case EntityType.FR: return 'BC Sole Proprietorship'
      case EntityType.DBA: return 'BC "Doing Business As" name (DBA)'
      case EntityType.CR: return 'BC Limited Company'
      case EntityType.UL: return 'BC Unlimited Liability Company'
      case EntityType.GP: return 'BC General Partnership'
      case EntityType.LP: return 'BC Limited Partnership'
      case EntityType.LL: return 'BC Limited Liability Partnership'
      case EntityType.CP: return 'BC Cooperative Association'
      case EntityType.BC: return 'BC Benefit Company'
      case EntityType.CC: return 'BC Community Contribution Company'
      case EntityType.SO: return 'BC Social Enterprise'
      case EntityType.PA: return 'BC Private Act'
      case EntityType.FI: return 'BC Credit Union'
      case EntityType.PAR: return 'BC Parish'

      // XPRO Entity Types:
      case EntityType.XCR: return 'Extraprovincial Limited Company'
      case EntityType.XUL: return 'Extraprovincial Unlimited Liability Company'
      case EntityType.RLC: return 'Extraprovincial Limited Liability Company'
      case EntityType.XLP: return 'Extraprovincial Limited Partnership'
      case EntityType.XLL: return 'Extraprovincial Limited Liability Partnership'
      case EntityType.XCP: return 'Extraprovincial Cooperative Association'
      case EntityType.XSO: return 'Extraprovincial Social Enterprise'

      default: return cd
    }
  }

  /**
   * Returns request action text for the the specified code.
   * See namex -> api/namex/resources/name_requests/report_resource.py::_get_request_action_cd_description()
   */
  requestActionCdToText (cd: RequestCode): string {
    switch (cd) {
      case RequestCode.NEW: return 'New Business'
      case RequestCode.MVE: return 'Continuation In'
      case RequestCode.REH: return 'Restoration or Reinstatement'
      case RequestCode.AML: return 'Amalgamation'
      case RequestCode.CHG: return 'Name Change'
      case RequestCode.CNV: return 'Alteration'
      case RequestCode.DBA: return 'Doing Business As'
      case RequestCode.ASSUMED: return 'Assumed Named'
      case RequestCode.REN: return 'Restoration or Reinstatement'
      case RequestCode.REST: return 'Restoration or Reinstatement'
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

  /** Returns true if the specified NR is for a Benefit Company. */
  isBenefitCompany (nr: any): boolean {
    return (nr?.entity_type_cd === EntityType.BC)
  }

  /** Returns true if the specified NR is for an Extraprovincial Company. */
  isXProCompany (nr: any): boolean {
    return [EntityType.XCR, EntityType.XUL, EntityType.RLC, EntityType.XLP, EntityType.XLL,
      EntityType.XCP, EntityType.XSO].includes(nr?.entity_type_cd)
  }

  /** Scroll to given element Id */
  scrollTo (id): void {
    return document.getElementById(id)?.scrollIntoView()
  }
}
