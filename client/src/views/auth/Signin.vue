<template>
<sbc-signin @sync-user-profile-ready="onReady()" />
</template>

<script lang="ts">
// Libraries
import { Component, Vue } from 'vue-property-decorator'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'
import Axios, { AxiosResponse } from 'axios'

// Components
import SbcSignin from 'sbc-common-components/src/components/SbcSignin.vue'

const axios = addAxiosInterceptors(Axios.create())

@Component({
  components: {
    SbcSignin
  }
})
export default class Signin extends Vue {
  private BusinessRequest = {
    filing: {
      header: {
        name: 'incorporationApplication',
        accountId: 1520
      },
      business: {
        legalType: 'BC'
      },
      incorporationApplication: {
        nameRequest: {
          legalType: 'BC',
          nrNumber: 'NR1234567'
        }
      }
    }
  }

  /** Called when Keycloak session is ready. */
  private async onReady () {
    // navigate to landing
    await this.$router.push('/')

    try {
      const nrResponse = await this.addNameRequest()

      // eslint-disable-next-line no-console
      console.log(nrResponse)

      if (nrResponse?.status === 201) {
        // update the legal api if the status is success
        const filingBody: any = {
          filing: {
            header: {
              name: 'incorporationApplication',
              accountId: 1520
            },
            business: {
              legalType: 'BC'
            },
            incorporationApplication: {
              nameRequest: {
                legalType: 'BC',
                nrNumber: 'NR 6597972'
              }
            }
          }
        }
        const filingResponse = await this.createNamedBusiness(filingBody)
        // eslint-disable-next-line no-console
        console.log(filingResponse)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  public async addNameRequest () {
    const requestBody = {
      businessIdentifier: 'NR 6597972',
      phone: '',
      email: 'testoutputs@gov.bc.ca'
    }
    const currentOrganizationId = 1520 // Get ID from Session storage Current Account

    // Create an affiliation between implicit org and requested business
    return this.createNRAffiliation(currentOrganizationId, requestBody)
    // return this.removeAffiliation(currentOrganizationId, 'NR 6597972')
  }

  private async createNRAffiliation (orgIdentifier: number, affiliation: any): Promise<any> {
    return axios.post(`${sessionStorage.getItem('AUTH_API_URL')}/orgs/${orgIdentifier}/affiliations?newBusiness=true`, affiliation)
  }

  private async removeAffiliation (orgIdentifier: number, incorporationNumber: string): Promise<any> {
    return axios.delete(`${sessionStorage.getItem('AUTH_API_URL')}/orgs/${orgIdentifier}/affiliations/${incorporationNumber}`)
  }

  public async createNamedBusiness (filingBody: any) {
    // Create an affiliation between implicit org and requested business
    const updateResponse = await axios.post(`${sessionStorage.getItem('LEGAL_API_URL')}/businesses?draft=true`, filingBody)
    if (updateResponse?.status >= 200 && updateResponse?.status < 300) {
      return updateResponse
    } else {
      // delete the created affiliation if the update failed for avoiding orphan records
      // unable to do these from backend, since it causes a circular dependency
      const orgId = filingBody?.filing?.header?.accountId
      const nrNumber = filingBody?.filing?.incorporationApplication?.nameRequest?.nrNumber
      await this.removeAffiliation(orgId, nrNumber)
      return {
        errorMsg: 'Cannot add business due to some technical reasons'
      }
    }
  }
}
</script>
