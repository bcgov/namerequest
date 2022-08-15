import { Component, Mixins } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import AuthServices from '@/services/auth.services'
import BusinessServices from '@/services/business.services'
import { BusinessRequest, NameRequestI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { navigate } from '@/plugins'
import { CommonMixin } from '@/mixins'
import { CREATED, BAD_REQUEST, OK } from 'http-status-codes'

@Component({})
export class NrAffiliationMixin extends Mixins(CommonMixin) {
  // Global action
  @Action setAffiliationErrorModalVisible!: ActionBindingIF

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
      const accountId = +JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT')).id || 0

      // try to affiliate the NR
      const createAffiliationResponse = await AuthServices.createNrAffiliation(accountId, nr)

      // check if affiliation succeeded
      if (createAffiliationResponse.status === CREATED) {
        // create the business
        const businessId = await this.createBusiness(accountId, nr, true)

        // go to entity dashboard
        this.goToEntityDashboard(businessId)
        return
      }

      // check if NR is already affiliated
      if (
        createAffiliationResponse.status === BAD_REQUEST &&
        createAffiliationResponse.data.code === 'NR_CONSUMED'
      ) {
        // fetch existing affiliations
        const fetchAffiliationsResponse = await AuthServices.fetchAffiliations(accountId)

        if (fetchAffiliationsResponse?.status !== OK) {
          throw new Error('Unable to fetch existing affiliation')
        }

        // is this a name request affiliation?
        const entities = fetchAffiliationsResponse.data?.entities || []
        const nameRequestEntity = entities.find(entity => entity.businessIdentifier === nr.nrNum)
        if (nameRequestEntity) {
          // create the business
          const businessId = await this.createBusiness(accountId, nr, false)

          // go to entity dashboard
          this.goToEntityDashboard(businessId)
          return
        }

        // is this a temporary business affiliation?
        const temporaryBusinessEntity = entities.find(entity => entity.nrNumber === nr.nrNum)
        if (temporaryBusinessEntity) {
          // use existing business id
          const businessId = temporaryBusinessEntity.businessIdentifier

          // go to entity dashboard
          this.goToEntityDashboard(businessId)
          return
        }

        throw new Error('Unable to find existing affiliation')
      }

      throw new Error('Unable to create new affiliation')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('createAffiliation() =', err)

      // hide spinner
      this.$root.$emit('showSpinner', false)

      // show error dialog
      this.setAffiliationErrorModalVisible(true)
    }
  }

  /** Creates temporary business record and returns business identifier. */
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

      throw new Error('Unable to create new business')
    }

    return createBusinessResponse.data?.filing?.business?.identifier as string
  }

  /** Returns business request object. */
  private getBusinessRequest (accountId: number, nr: NameRequestI): BusinessRequest {
    const name = this.isBenefitCompany(nr) ? 'incorporationApplication' : 'registration'
    const legalType = this.isBenefitCompany(nr) ? 'BEN' : nr.legalType
    const nrNumber = nr.nrNum

    return {
      filing: {
        business: { legalType },
        header: { accountId, name },
        incorporationApplication: !this.isFirm(nr) ? { nameRequest: { legalType, nrNumber } } : undefined,
        registration: this.isFirm(nr) ? { nameRequest: { legalType, nrNumber } } : undefined
      }
    } as BusinessRequest
  }

  /** Navigates to entity dashboard (Filings UI). */
  private goToEntityDashboard (businessId: string): void {
    if (!businessId) throw new Error('Invalid business id')

    const dashboardUrl = sessionStorage.getItem('DASHBOARD_URL')

    navigate(`${dashboardUrl}${businessId}`)
  }
}
