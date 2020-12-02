import { Component, Vue } from 'vue-property-decorator'

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
      case 'FR': return 'BC Sole Proprietorship'
      case 'DBA': return 'BC "Doing Business As" name (DBA)'
      case 'CR': return 'BC Limited Company'
      case 'UL': return 'BC Unlimited Liability Company'
      case 'GP': return 'BC General Partnership'
      case 'LP': return 'BC Limited Partnership'
      case 'LL': return 'BC Limited Liability Partnership'
      case 'CP': return 'BC Cooperative Association'
      case 'BC': return 'BC Benefit Company'
      case 'CC': return 'BC Community Contribution Company'
      case 'SO': return 'BC Social Enterprise'
      case 'PA': return 'BC Private Act'
      case 'FI': return 'BC Credit Union'
      case 'PAR': return 'BC Parish'

      // XPRO Entity Types:
      case 'XCR': return 'XPRO Limited Company'
      case 'XUL': return 'XPRO Unlimited Liability Company'
      case 'RLC': return 'XPRO Limited Liability Company'
      case 'XLP': return 'XPRO Limited Partnership'
      case 'XLL': return 'XPRO Limited Liability Partnership'
      case 'XCP': return 'XPRO Cooperative Association'
      case 'XSO': return 'XPRO Social Enterprise'

      default: return cd
    }
  }
}
