import { Component, Vue } from 'vue-property-decorator'
import { EntityCode } from '@/enums'

@Component
export default class CommonMixin extends Vue {
  /** Returns the specified string in Title Case. */
  toTitleCase (str: any): string {
    return str && str
      .toLowerCase()
      .split(' ')
      .map(word => word.replace(word[0], word[0].toUpperCase()))
      .join(' ')
  }

  /** Returns entity type text for the the specified code. */
  entityTypeCdToText (cd: string): string {
    switch (cd) {
      // BC Entity Types:
      case EntityCode.FR: return 'BC Sole Proprietorship'
      case EntityCode.DBA: return 'BC "Doing Business As" name (DBA)'
      case EntityCode.CR: return 'BC Limited Company'
      case EntityCode.UL: return 'BC Unlimited Liability Company'
      case EntityCode.GP: return 'BC General Partnership'
      case EntityCode.LP: return 'BC Limited Partnership'
      case EntityCode.LL: return 'BC Limited Liability Partnership'
      case EntityCode.CP: return 'BC Cooperative Association'
      case EntityCode.BC: return 'BC Benefit Company'
      case EntityCode.CC: return 'BC Community Contribution Company'
      case EntityCode.SO: return 'BC Social Enterprise'
      case EntityCode.PA: return 'BC Private Act'
      case EntityCode.FI: return 'BC Credit Union'
      case EntityCode.PAR: return 'BC Parish'

      // XPRO Entity Types:
      case EntityCode.XCR: return 'XPRO Limited Company'
      case EntityCode.XUL: return 'XPRO Unlimited Liability Company'
      case EntityCode.RLC: return 'XPRO Limited Liability Company'
      case EntityCode.XLP: return 'XPRO Limited Partnership'
      case EntityCode.XLL: return 'XPRO Limited Liability Partnership'
      case EntityCode.XCP: return 'XPRO Cooperative Association'
      case EntityCode.XSO: return 'XPRO Social Enterprise'

      default: return cd
    }
  }
}
