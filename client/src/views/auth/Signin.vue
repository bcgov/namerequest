<template>
  <sbc-signin @sync-user-profile-ready="onReady()" />
</template>

<script lang="ts">
// Libraries
import Axios from 'axios'
import { Component, Vue } from 'vue-property-decorator'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import newReqModule from '@/store/new-request-module'

// Services
import AuthServices from '@/services/auth.services'
import BusinessServices from '@/services/business.services'

// Components
// @ts-ignore
import SbcSignin from 'sbc-common-components/src/components/SbcSignin'

// Models
import { BusinessRequest, CreateNRAffiliationRequestBody } from '@/models/business'

const axios = addAxiosInterceptors(Axios.create())

@Component({
  components: {
    SbcSignin
  }
})
export default class Signin extends Vue {
  /** get nr data from Session */
  get nr () {
    return JSON.parse(sessionStorage.getItem('NR_DATA'))
  }

  /** called when keycloak session is ready. */
  private async onReady () {
    const currentOrganizationId = JSON.parse(sessionStorage.getItem('CURRENT_ACCOUNT')).id
    const requestBody: CreateNRAffiliationRequestBody = {
      businessIdentifier: this.nr?.nrNum,
      phone: this.nr?.applicants?.phoneNumber || '',
      email: this.nr?.applicants?.emailAddress || ''
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
              legalType: this.nr?.entity_type_cd
            },
            incorporationApplication: {
              nameRequest: {
                legalType: this.nr?.entity_type_cd,
                nrNumber: this.nr?.nrNum
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
</script>
