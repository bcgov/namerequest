import { Component, Vue } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import AuthServices from '@/services/auth.services'
import BusinessServices from '@/services/business.services'
import { BusinessRequest, CreateNRAffiliationRequestBody, NameRequestI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { navigate } from '@/plugins'

@Component({})
export class NrAffiliationMixin extends Vue {
  // Global action
  @Action setAffiliationErrorModalVisible!: ActionBindingIF

  /**
   * Creates an affiliation between the current authenticated account and the current NR.
   * @param nr the NR to affiliate
   */
  async createAffiliation (nr: NameRequestI): Promise<any> {
    try {
      // show spinner since the network calls below can take a few seconds
      this.$root.$emit('showSpinner', true)

      const currentOrganizationId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT')).id
      const requestBody: CreateNRAffiliationRequestBody = {
        businessIdentifier: nr.nrNum,
        phone: nr.applicants?.phoneNumber || '',
        email: nr.applicants?.emailAddress || ''
      }

      // Request to affiliate NR to current account
      const nrResponse = await AuthServices.createNRAffiliation(currentOrganizationId, requestBody)
      if (nrResponse?.status === 200 || nrResponse?.status === 201) {
        // update the legal api if the status is success
        const filingBody: BusinessRequest = {
          filing: {
            header: {
              name: 'incorporationApplication',
              accountId: currentOrganizationId
            },
            business: {
              legalType: (nr.entity_type_cd === 'BC') ? 'BEN' : nr.entity_type_cd
            },
            incorporationApplication: {
              nameRequest: {
                legalType: (nr.entity_type_cd === 'BC') ? 'BEN' : nr.entity_type_cd,
                nrNumber: nr.nrNum
              }
            }
          }
        }
        const filingResponse = await BusinessServices.createBusiness(filingBody)
        // navigate to My Business Registry dashboard
        if (filingResponse?.status === 200 || filingResponse?.status === 201) {
          navigate(
            `${sessionStorage.getItem('BUSINESSES_URL')}account/${currentOrganizationId}/business`
          )
        } else throw new Error('Business creation error: invalid api response ')
      } else throw new Error('Affiliation error: invalid api response ')
    } catch (err) {
      console.error('createAffiliation() =', err) // eslint-disable-line no-console

      // hide spinner
      this.$root.$emit('showSpinner', false)

      // clear NR Data and show error dialog
      sessionStorage.removeItem('NR_DATA')
      this.setAffiliationErrorModalVisible(true)
    }
  }
}
