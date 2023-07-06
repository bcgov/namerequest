import { Component, Mixins } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import AuthServices from '@/services/auth-services'
import BusinessServices from '@/services/business-services'
import { BusinessRequest, NameRequestI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { Navigate } from '@/plugins'
import { CommonMixin } from '@/mixins'
import { NrAffiliationErrors } from '@/enums'
import { CREATED, BAD_REQUEST } from 'http-status-codes'

@Component({})
export class NrAffiliationMixin extends Mixins(CommonMixin) {
  // Global action
  @Action setAffiliationErrorModalValue!: ActionBindingIF

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
    const name = this.isBenefitCompany(nr) ? 'incorporationApplication' : 'registration'
    const legalType = this.isBenefitCompany(nr) ? 'BEN' : nr.legalType
    const nrNumber = nr.nrNum

    const businessRequest = {
      filing: {
        business: { legalType },
        header: { accountId, name }
      }
    } as BusinessRequest

    if (!this.isFirm(nr)) {
      businessRequest.filing.incorporationApplication = {
        nameRequest: { legalType, nrNumber }
      }
    }

    if (this.isFirm(nr)) {
      businessRequest.filing.registration = {
        business: { natureOfBusiness: nr.natureOfBusiness },
        nameRequest: { legalType, nrNumber }
      }
    }

    return businessRequest
  }

  /** Navigates to entity dashboard (Filings UI). */
  private goToEntityDashboard (businessId: string): void {
    if (businessId) {
      const dashboardUrl = sessionStorage.getItem('DASHBOARD_URL')
      Navigate(`${dashboardUrl}${businessId}`)
    }
  }

  /**
   * Handle "Incorporate Now" button.
   * Create draft business depending on business type.
   * Redirect to Dashboard.
   * @param legalType The legal type of the IA that's being incorporated.
   */
  async incorporateNow (legalType: string): Promise<any> {
    try {
      // show spinner since this is a network call
      this.$root.$emit('showSpinner', true)
      const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT'))?.id || 0
      const businessId = await this.createBusinessIA(accountId, legalType)
      this.goToEntityDashboard(businessId)
      return
    } catch (error) {
      this.$root.$emit('showSpinner', false)
      throw new Error('Unable to Incorporate Now ' + error)
    }
  }

  /**
   * Create a draft business based on selected business type (If applicable).
   * @param accountId Account ID of logged in user.
   * @param legalType The legal type of the IA that's being incorporated.
   */
  async createBusinessIA (accountId: number, legalType: string): Promise<string> {
    const businessRequest = {
      filing: {
        header: {
          name: 'incorporationApplication',
          accountId: accountId
        },
        business: {
          legalType: legalType
        },
        incorporationApplication: {
          nameRequest: {
            legalType: legalType
          }
        }
      }
    } as BusinessRequest

    const createBusinessResponse =
      await BusinessServices.createBusiness(businessRequest).catch(error => {
        throw new Error('Unable to create new Business ' + error)
      })

    return createBusinessResponse.data?.filing?.business?.identifier as string
  }
}
