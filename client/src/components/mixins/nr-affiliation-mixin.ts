import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import AuthServices from '@/services/auth.services'
import BusinessServices from '@/services/business.services'
import newReqModule from '@/store/new-request-module'
import { BusinessRequest, CreateNRAffiliationRequestBody } from '@/models/business'
import { NameRequestI } from '@/models'

@Component
export default class NrAffiliationMixin extends Vue {
  /**
   * Create an affiliation between current authenticated Account and current Nr
   * @param nr The Nr to affiliate
   */
  async createAffiliation (nr: NameRequestI): Promise<any> {
    const currentOrganizationId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT')).id
    const requestBody: CreateNRAffiliationRequestBody = {
      businessIdentifier: nr.nrNum,
      phone: nr.applicants.phoneNumber || '',
      email: nr.applicants.emailAddress || ''
    }

    try {
    // Request to affiliate NR to current account
      const nrResponse = await AuthServices.createNRAffiliation(currentOrganizationId, requestBody)
      if (nrResponse?.status === 201) {
      // update the legal api if the status is success
        const filingBody: BusinessRequest = {
          filing: {
            header: {
              name: 'incorporationApplication',
              accountId: currentOrganizationId
            },
            business: {
              legalType: nr.entity_type_cd
            },
            incorporationApplication: {
              nameRequest: {
                legalType: nr.entity_type_cd,
                nrNumber: nr.nrNum
              }
            }
          }
        }
        const filingResponse = await BusinessServices.createBusiness(filingBody)
        // navigate to manage business dashboard
        if (filingResponse?.status === 201) {
          window.location.assign(
            `${sessionStorage.getItem('BUSINESSES_URL')}account/${currentOrganizationId}/business`
          )
        }
      }
    } catch (e) {
    // navigate to landing, show error dialog and clear NR Data
      await this.$router.push('/')
      sessionStorage.removeItem('NR_DATA')
      newReqModule.mutateAffiliationErrorModalVisible(true)
    }
  }
}