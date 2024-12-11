// External imports
import { Component, Mixins, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

// Interfaces / enums / etc.
import { ConversionTypesI, EntityI, RequestActionsI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { AccountType, CompanyTypes, CorpTypeCd, EntityTypes, Location, NrRequestActionCodes,
  NrRequestTypeCodes } from '@/enums'
import { BcMapping, ConversionTypes, RequestActions, XproMapping } from '@/list-data'
import { CommonMixin } from './common-mixin'

/**
 * Mixin to provide common/shared imports/methods to search components.
 */
@Component({})
export class SearchMixin extends Mixins(CommonMixin) {
  // Enums for template
  readonly CompanyTypes = CompanyTypes
  readonly EntityTypes = EntityTypes
  readonly NrRequestActionCodes = NrRequestActionCodes
  readonly RequestActions = RequestActions

  // Store getters
  @Getter getConversionType!: NrRequestTypeCodes
  @Getter getConversionTypeOptions!: ConversionTypesI[]
  @Getter getDesignation!: string
  @Getter getDisplayedComponent!: string
  @Getter getEntityBlurbs!: Array<EntityI | ConversionTypesI>
  @Getter getEntityTypeCd!: EntityTypes
  @Getter getEntityTypeOptions!: Array<EntityI>
  @Getter getErrors!: string[]
  @Getter getHasNoCorpNum!: boolean
  @Getter getLocation!: Location
  @Getter getOriginEntityTypeCd!: EntityTypes
  @Getter getRequestActionCd!: NrRequestActionCodes
  @Getter getSearchCompanyType!: CompanyTypes
  @Getter getSearchJurisdiction!: any
  @Getter getSearchRequest!: RequestActionsI
  @Getter isAmalgamation!: boolean
  @Getter isAssumed!: boolean
  @Getter isAuthenticated!: boolean
  @Getter isChangeName!: boolean
  @Getter isContinuationIn!: boolean
  @Getter isConversion!: boolean
  @Getter isFederal!: boolean
  @Getter isLocationCA!: boolean
  @Getter isLocationIN!: boolean
  @Getter isMobile!: boolean
  @Getter isMrasJurisdiction!: boolean
  @Getter isNewBusiness!: boolean
  @Getter isNumberedEntityType!: boolean
  @Getter isRestoration!: boolean
  @Getter isXproFlow!: boolean

  // Store actions
  @Action setClearErrors!: () => void
  @Action setConversionType!: ActionBindingIF
  @Action setCorpNum!: ActionBindingIF
  @Action setCorpSearch!: ActionBindingIF
  @Action setDesignation!: ActionBindingIF
  @Action setDoNameCheck!: ActionBindingIF
  @Action setEntityTypeCd!: ActionBindingIF
  @Action setExtendedRequestType!: ActionBindingIF
  @Action setJurisdictionCd!: ActionBindingIF
  @Action setLocation!: ActionBindingIF
  @Action setName!: ActionBindingIF
  @Action setNoCorpNum!: ActionBindingIF
  @Action setOriginEntityTypeCd!: ActionBindingIF
  @Action setPickEntityModalVisible!: ActionBindingIF
  @Action setRequestAction!: ActionBindingIF
  @Action setSearchBusiness!: ActionBindingIF
  @Action setSearchCompanyType!: ActionBindingIF
  @Action setSearchJurisdiction!: ActionBindingIF
  @Action setSearchRequest!: ActionBindingIF
  @Action startAnalyzeName!: ActionBindingIF

  get isScreenLg () {
    return this.$vuetify.breakpoint.lgAndUp
  }

  /** Whether current account type is Premium, SBC Staff or Staff. */
  get isPremiumOrStaff (): boolean {
    return [AccountType.PREMIUM, AccountType.SBC_STAFF, AccountType.STAFF]
      .includes(JSON.parse(sessionStorage.getItem(SessionStorageKeys.CurrentAccount))?.accountType)
  }

  get isBenBusiness (): boolean {
    const corpType = this.getSearchBusiness?.legalType as unknown as CorpTypeCd
    return (corpType === CorpTypeCd.BENEFIT_COMPANY)
  }

  get isNewBcBusiness (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.NEW_BUSINESS && this.getSearchRequest?.group === 0)
  }

  get isNewXproBusiness (): boolean {
    return (this.getRequestActionCd === NrRequestActionCodes.NEW_BUSINESS && this.getSearchRequest?.group === 1)
  }

  get isAlterable (): boolean {
    const corpType = this.getSearchBusiness.legalType as unknown as CorpTypeCd
    return (
      corpType === CorpTypeCd.BC_COMPANY ||
      corpType === CorpTypeCd.BENEFIT_COMPANY ||
      corpType === CorpTypeCd.BC_ULC_COMPANY ||
      corpType === CorpTypeCd.CONTINUE_IN ||
      corpType === CorpTypeCd.BEN_CONTINUE_IN ||
      corpType === CorpTypeCd.ULC_CONTINUE_IN
    )
  }

  get origin_entity_type_cd (): EntityTypes {
    return this.getOriginEntityTypeCd
  }

  get entity_type_cd (): EntityTypes {
    return this.getEntityTypeCd
  }

  set entity_type_cd (type: EntityTypes) {
    // special case for amalgamation -- in case of changing entity type after changing xpro location
    if (this.isAmalgamation) {
      this.setSearchJurisdiction(null)
      this.setLocation(Location.BC)
      this.setJurisdictionCd(null)
      this.setSearchCompanyType(null)
    }

    // special case for sub-menu
    if (type === EntityTypes.INFO) {
      // set empty values until user chooses a new one
      // (don't use null in case it's already null as we want reactivity)
      this.setEntityTypeCd('')
      this.setSearchCompanyType('')

      // show the "View all business types" modal
      this.setPickEntityModalVisible(true)
      return
    }

    // special case for conversion
    if (this.getEntityTypeCd && this.isConversion && type) {
      const nrRequestType = type as unknown as NrRequestTypeCodes
      const entityType = ConversionTypes.find(conv =>
        conv.value === nrRequestType && conv.origin_entity_type_cd === this.origin_entity_type_cd
      )?.entity_type_cd || null

      this.setEntityTypeCd(entityType)
      this.setConversionType(type)
      return
    }

    this.setEntityTypeCd(type)
  }

  /** Whether selected radio button is Named Company. */
  get isNamedCompany (): boolean {
    return (this.getSearchCompanyType === CompanyTypes.NAMED_COMPANY)
  }

  /** Whether selected radio button is Numbered Company. */
  get isNumberedCompany (): boolean {
    return (this.getSearchCompanyType === CompanyTypes.NUMBERED_COMPANY)
  }

  get isChangeNameXpro (): boolean {
    const corpType = this.getSearchBusiness?.legalType as unknown as CorpTypeCd
    return XproMapping.CHG.includes(this.corpTypeToEntityType(corpType))
  }

  /** Whether company can change name. */
  get isNameChangeable (): boolean {
    const corpType = this.getSearchBusiness?.legalType as unknown as CorpTypeCd
    return (
      BcMapping.CHG.includes(this.corpTypeToEntityType(corpType)) ||
      XproMapping.CHG.includes(this.corpTypeToEntityType(corpType))
    )
  }

  /** Whether the selected XPRO is restorable. */
  get isSelectedXproAndRestorable (): boolean {
    const corpType = this.getSearchBusiness?.legalType as unknown as CorpTypeCd
    return XproMapping.REH.includes(this.corpTypeToEntityType(corpType))
  }

  /** Whether the selected business' legal type is BC and restorable. */
  get isBcRestorable (): boolean {
    const corpType = this.getSearchBusiness?.legalType as unknown as CorpTypeCd
    return BcMapping.REH.includes(this.corpTypeToEntityType(corpType))
  }

  /** Whether company is restorable. */
  get isRestorable (): boolean {
    return (this.isSelectedXproAndRestorable || this.isBcRestorable)
  }

  get isSelectedCompanyXPro (): boolean {
    if (this.isRestoration) {
      return this.isSelectedXproAndRestorable
    }
    if (this.isChangeName) {
      return this.isChangeNameXpro
    }
    return false
  }

  /** Whether business is a BEN/BC/CC/ULC according to its legal type. */
  get isBcBenCccUlc (): boolean {
    return (
      this.getSearchBusiness?.legalType === EntityTypes.BC ||
      this.getSearchBusiness?.legalType === EntityTypes.BEN ||
      this.getSearchBusiness?.legalType === EntityTypes.CC ||
      this.getSearchBusiness?.legalType === EntityTypes.ULC
    )
  }

  /** Resets search values when location changes. */
  @Watch('getLocation')
  private watchLocation (newVal: Location) {
    // if they need to search by corp num first then reset the name
    if ([Location.CA, Location.FD, Location.IN, Location.US].includes(newVal)) {
      this.setName('')
    }
    this.setCorpSearch('')
    this.setNoCorpNum(false)
  }
}
