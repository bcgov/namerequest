import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import AuthServices from '@/services/auth-services'
import BusinessServices from '@/services/business-services'
import { BusinessRequest, NameRequestI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { Navigate } from '@/plugins'
import { CommonMixin } from '@/mixins'
import { NrAffiliationErrors } from '@/enums'
import { CREATED, BAD_REQUEST } from 'http-status-codes'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'
import { AmalgamationTypes, CorrectNameOptions, FilingTypes, NrRequestActionCodes }
  from '@bcrs-shared-components/enums'

@Component({})
export class NrAffiliationMixin extends Mixins(CommonMixin) {
  @Getter isAmalgamation!: boolean
  @Getter isContinuationIn!: boolean
  @Getter isNewBusiness!: boolean

  // Global action
  @Action setAffiliationErrorModalValue!: ActionBindingIF
  @Action setAmalgamateNowErrorStatus!: ActionBindingIF
  @Action setContinuationInErrorStatus!: ActionBindingIF
  @Action setIncorporateNowErrorStatus!: ActionBindingIF

  /**
   * Affiliates a NR to the current account, creates a temporary business, and then navigates
   * to the entity dashboard page.
   * @param nr the NR to affiliate
   */
  async createAffiliation (nr: NameRequestI): Promise<any> {
    try {
      // show spinner since the network calls below can take a few seconds
      this.$root.$emit('showSpinner', true)

      // NB: fall back is user's default account
      const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id || 0

      // try to affiliate the NR
      const createAffiliationResponse = await AuthServices.createNrAffiliation(accountId, nr)
      if (!createAffiliationResponse || !createAffiliationResponse.status) {
        this.setAffiliationErrorModalValue(NrAffiliationErrors.UNABLE_TO_START_REGISTRATION)
        throw Error('Unable to find existing affiliation')
      }

      // check if affiliation succeeded
      if (createAffiliationResponse.status === CREATED) {
        // create the business
        const businessId = await this.createBusiness(accountId, nr, true)
          .catch(error => {
            this.setAffiliationErrorModalValue(NrAffiliationErrors.UNABLE_TO_START_REGISTRATION)
            throw error
          })

        // go to entity dashboard
        this.goToEntityDashboard(businessId)
        return
      }

      // check if NR is already affiliated
      if (
        createAffiliationResponse.status === BAD_REQUEST &&
        createAffiliationResponse.data?.code === 'NR_CONSUMED'
      ) {
        // fetch existing affiliations
        const fetchAffiliationsResponse = await AuthServices.fetchAffiliations(accountId)
          .catch(error => {
            this.setAffiliationErrorModalValue(NrAffiliationErrors.UNABLE_TO_START_REGISTRATION)
            throw error
          })

        const entities = fetchAffiliationsResponse?.entities || []

        // is this a name request affiliation?
        const nameRequestEntity = entities.find(entity => entity.businessIdentifier === nr.nrNum)
        if (nameRequestEntity) {
          // create the business
          const businessId = await this.createBusiness(accountId, nr, false)
            .catch(error => {
              this.setAffiliationErrorModalValue(NrAffiliationErrors.UNABLE_TO_START_REGISTRATION)
              throw error
            })

          // go to entity dashboard
          this.goToEntityDashboard(businessId)
          return
        }

        // is this a temporary business affiliation?
        const temporaryBusinessEntity = entities.find(entity => entity.nrNumber === nr.nrNum)
        if (temporaryBusinessEntity) {
          // use existing business id
          const businessId = temporaryBusinessEntity.businessIdentifier

          if (!businessId) {
            this.setAffiliationErrorModalValue(NrAffiliationErrors.UNABLE_TO_START_REGISTRATION)
            throw Error('Invalid existing affiliation business identifier')
          }

          // go to entity dashboard
          this.goToEntityDashboard(businessId)
          return
        }

        this.setAffiliationErrorModalValue(NrAffiliationErrors.ASSOCIATED_OTHER_ACCOUNT)
        throw Error('Unable to find existing affiliation')
      }

      this.setAffiliationErrorModalValue(NrAffiliationErrors.UNABLE_TO_START_REGISTRATION)
      throw Error('Unable to create new affiliation')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('createAffiliation() =', err)

      // hide spinner
      this.$root.$emit('showSpinner', false)
    }
  }

  /**
   * Creates temporary business record and returns business identifier.
   * Throws on error.
   */
  private async createBusiness (
    accountId: number, nr: NameRequestI, isNewAffiliation: boolean
  ): Promise<string> {
    const createBusinessResponse =
      await BusinessServices.createBusiness(this.getBusinessRequest(accountId, nr)).catch(() => null)

    if (createBusinessResponse?.status !== CREATED) {
      // create failed -- delete new affiliation to avoid orphan records
      if (isNewAffiliation) {
        await AuthServices.removeNrAffiliation(accountId, nr.nrNum).catch(() => null)
      }

      throw Error('Unable to create new business')
    }

    return createBusinessResponse.data?.filing?.business?.identifier as string
  }

  /** Returns business request object. */
  private getBusinessRequest (accountId: number, nr: NameRequestI): BusinessRequest {
    let name = ''
    let legalType = ''
    let businessRequest = {} as BusinessRequest
    const nrNumber = nr.nrNum
    if (!this.isFirm(nr)) {
      if (nr.request_action_cd === NrRequestActionCodes.AMALGAMATE) {
        name = FilingTypes.AMALGAMATION_APPLICATION
        legalType = nr.legalType
        businessRequest = {
          filing: {
            business: { legalType },
            header: { accountId, name },
            amalgamationApplication: {
              type: AmalgamationTypes.REGULAR,
              nameRequest: { legalType, nrNumber }
            }
          }
        }
      } else if (nr.request_action_cd === NrRequestActionCodes.MOVE) {
        name = FilingTypes.CONTINUATION_IN
        legalType = nr.legalType
        businessRequest = {
          filing: {
            business: { legalType },
            header: { accountId, name },
            continuationIn: {
              nameRequest: { legalType, nrNumber }
            }
          }
        }
      } else {
        name = FilingTypes.INCORPORATION_APPLICATION
        legalType = this.entityTypeToCorpType(nr.entity_type_cd)
        businessRequest = {
          filing: {
            business: { legalType },
            header: { accountId, name },
            incorporationApplication: {
              nameRequest: { legalType, nrNumber }
            }
          }
        }
      }
    }

    if (this.isFirm(nr)) {
      name = FilingTypes.REGISTRATION
      legalType = nr.legalType
      businessRequest = {
        filing: {
          business: { legalType },
          header: { accountId, name },
          registration: {
            business: { natureOfBusiness: nr.natureOfBusiness },
            nameRequest: { legalType, nrNumber }
          }
        }
      }
    }

    return businessRequest
  }

  /** Navigates to entity dashboard (Filings UI). */
  goToEntityDashboard (businessId: string): void {
    if (businessId) {
      const dashboardUrl = sessionStorage.getItem('DASHBOARD_URL')
      Navigate(`${dashboardUrl}${businessId}`)
    }
  }

  /**
   * Handle the action buttons (numbered selection).
   * Create draft business depending on business type.
   * Redirect to Dashboard.
   * @param legalType The legal type of the business
   */
  async actionNumberedEntity (legalType: CorpTypeCd): Promise<any> {
    // show spinner since this is a network call
    this.$root.$emit('showSpinner', true)
    const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id || 0
    try {
      const businessId = await this.createNumberedBusiness(accountId, legalType)
      this.goToEntityDashboard(businessId)
      return
    } catch (error) {
      this.$root.$emit('showSpinner', false)
      if (this.isAmalgamation) {
        this.setAmalgamateNowErrorStatus(true)
        throw new Error('Unable to Amalgamate Now = ' + error)
      } else if (this.isContinuationIn) {
        this.setContinuationInErrorStatus(true)
        throw new Error('Unable to Continue In Now = ' + error)
      } else if (this.isNewBusiness) {
        this.setIncorporateNowErrorStatus(true)
        throw new Error('Unable to Incorporate Now = ' + error)
      }
      throw new Error('Error in actionNumberedEntity() = ' + error)
    }
  }

  /**
   * Create a draft numbered business based on selected business type (If applicable).
   * @param accountId Account ID of logged in user.
   * @param legalType The legal type of the business that's being created.
   */
  async createNumberedBusiness (accountId: number, legalType: CorpTypeCd): Promise<string> {
    const businessRequest = {
      filing: {
        header: {
          accountId: accountId
        },
        business: {
          legalType: legalType
        }
      }
    } as BusinessRequest

    if (this.isAmalgamation) {
      businessRequest.filing.header.name = FilingTypes.AMALGAMATION_APPLICATION
      businessRequest.filing.amalgamationApplication = {
        nameRequest: { legalType, correctNameOption: CorrectNameOptions.CORRECT_AML_NUMBERED },
        type: AmalgamationTypes.REGULAR
      }
    } else if (this.isContinuationIn) {
      businessRequest.filing.header.name = FilingTypes.CONTINUATION_IN
      businessRequest.filing.continuationIn = { nameRequest: { legalType } }
    } else if (this.isNewBusiness) {
      businessRequest.filing.header.name = FilingTypes.INCORPORATION_APPLICATION
      businessRequest.filing.incorporationApplication = { nameRequest: { legalType } }
    } else {
      throw new Error('Invalid Request Type')
    }

    const createBusinessResponse = await BusinessServices.createBusiness(businessRequest)

    return createBusinessResponse.data?.filing?.business?.identifier as string
  }
}
