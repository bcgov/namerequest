import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import AuthServices from '@/services/auth.services'
import BusinessServices from '@/services/business.services'
import newReqModule from '@/store/new-request-module'
import { BusinessRequest, CreateNRAffiliationRequestBody } from '@/interfaces'
import { NameRequestI } from '@/models'

@Component
export default class NrAffiliationMixin extends Vue {
  /**
   * Create an affiliation between current authenticated Account and current Nr
   * @param nr The Nr to affiliate
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
        // navigate to manage business dashboard
        if (filingResponse?.status === 200 || filingResponse?.status === 201) {
          window.location.assign(
            `${sessionStorage.getItem('BUSINESSES_URL')}account/${currentOrganizationId}/business`
          )
        } else throw new Error('Business creation error: invalid api response ')
      } else throw new Error('Affiliation error: invalid api response ')
    } catch (error) {
      console.error('createAffiliation() =', error) // eslint-disable-line no-console
      // clear spinner on error
      this.$root.$emit('showSpinner', false)

      // show error dialog, clear NR Data and navigate to landing
      sessionStorage.removeItem('NR_DATA')
      newReqModule.mutateAffiliationErrorModalVisible(true)
    }
  }
}
