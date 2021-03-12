import { Component, Mixins } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'
import querystring from 'qs'
import axios from 'axios'
import { Debounce } from 'vue-debounce-decorator'
import canadaPostAPIKey from '@/store/config'
import { ActionBindingIF } from '@/interfaces/store-interfaces'
import { ApplicantI } from '@/interfaces'
import { ApiErrorMixin } from '@/mixins'

@Component
export class ActionMixin extends Mixins(ApiErrorMixin) {
  qs: any = querystring

  // Global getter
  @Getter getApplicant!: ApplicantI

  // Global action
  @Action setApplicantDetails!: ActionBindingIF

  // async fetchAddressDetails (id): Promise<void> {
  //   try {
  //     const url = 'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Retrieve/v2.11/json3.ws'
  //     const params = {
  //       Key: canadaPostAPIKey,
  //       Id: id
  //     }

  //     const resp = await axios.post(url, this.qs.stringify(params), {
  //       headers: { 'Content-type': 'application/x-www-form-urlencoded' }
  //     })

  //     if (resp.data.Items && Array.isArray(resp.data.Items)) {
  //       const addressData = resp.data.Items.find(item => item.Language === 'ENG')
  //       const canadaPostFieldsMapping = {
  //         CountryIso2: 'countryTypeCd',
  //         PostalCode: 'postalCd',
  //         ProvinceCode: 'stateProvinceCd',
  //         City: 'city',
  //         Line1: 'addrLine1',
  //         Line2: 'addrLine2'
  //       }

  //       for (let ln of ['2', '3']) {
  //         if (!addressData[`Line${ln}`]) {
  //           this.setApplicantDetails({ key: `addrLine${ln}`, value: '' })
  //         }
  //       }

  //       if (addressData['ProvinceCode']) {
  //         if (addressData['ProvinceCode'].length > 2) {
  //           this.setApplicantDetails({ key: 'stateProvinceCd', value: '' })
  //           if (!addressData['ProvinceName']) {
  //             canadaPostFieldsMapping['ProvinceCode'] = 'addrLine3'
  //           } else {
  //             delete canadaPostFieldsMapping.ProvinceCode
  //             canadaPostFieldsMapping['ProvinceName'] = 'addrLine3'
  //           }
  //         }
  //       } else {
  //         delete canadaPostFieldsMapping.ProvinceCode
  //         this.setApplicantDetails({ key: 'stateProvinceCd', value: '' })
  //         if (addressData['ProvinceName']) {
  //           canadaPostFieldsMapping['ProvinceName'] = 'addrLine3'
  //         }
  //       }

  //       const fields = Object.keys(canadaPostFieldsMapping)
  //       for (let field of fields) {
  //         if (addressData[field]) {
  //           const value = addressData[field]
  //           const mappedField = canadaPostFieldsMapping[field]
  //           this.setApplicantDetails({ key: mappedField, value })
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     const msg = await this.handleApiError(err, 'Could not get address details')
  //     // AddressComplete problem - use console.log not console.error
  //     console.log('fetchAddressDetails() =', msg) // eslint-disable-line no-console
  //   }
  // }

  @Debounce(250)
  async fetchAddressSuggestions (appKV: { key, value }): Promise<void> {
    try {
      if (!appKV.value) return

      const url = 'https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3.ws'
      const params = {
        Key: canadaPostAPIKey,
        SearchTerm: appKV.value,
        MaxSuggestions: 3,
        Country: this.getApplicant.countryTypeCd
      }

      const resp = await axios.post(url, this.qs.stringify(params), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      if (Array.isArray(resp.data.Items)) {
        let filteredItems = resp.data.Items.filter(item => item.Next === 'Retrieve')
        if (this.getApplicant.addrLine1) {
          this.setApplicantDetails(filteredItems)
        }
        return
      }

      this.setApplicantDetails(null)
    } catch (err) {
      const msg = await this.handleApiError(err, 'Could not get address suggestions')
      // AddressComplete problem - use console.log not console.error
      console.log('fetchAddressSuggestions() =', msg) // eslint-disable-line no-console
    }
  }
}
