<template>
  <v-dialog max-width="40%" :value="isVisible" persistent>
    <v-card class="pa-9">
      <v-card-text class="h3">Confirm Name Request</v-card-text>
      <v-card-text class="normal-copy">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
          <div>
            <ul style="list-style: none; padding-left: 0">
              <li>
                <h4>Requested Name Choices</h4>
                <ul style="list-style: none; padding-left: 0">
                  <li><span class="choice-indicator" v-if="nameChoices && nameChoices.length > 0">1</span>{{name}}</li>
                  <li v-if="nameChoices[1]"><span class="choice-indicator" v-if="nameChoices && nameChoices.length > 0">2</span>{{nameChoices[1]}}</li>
                  <li v-if="nameChoices[2]"><span class="choice-indicator" v-if="nameChoices && nameChoices.length > 1">3</span>{{nameChoices[2]}}</li>
                </ul>
              </li>
              <li v-if="client">
                <h4>Client Name</h4>
                <ul style="list-style: none; padding-left: 0">
                  <li>{{`${client}`}}</li>
                </ul>
              </li>
              <li v-if="contactPerson">
                <h4>Primary Contact</h4>
                <ul style="list-style: none; padding-left: 0">
                  <li>{{`${contactPerson}`}}</li>
                  <li>{{applicant.emailAddress}}</li>
                  <li>{{applicant.phoneNumber}}</li>
                </ul>
              </li>
              <li v-if="!contactPerson">
                <h4>Primary Contact</h4>
                <ul style="list-style: none; padding-left: 0">
                  <!-- If there's no contact person (agent / lawyer / etc.) the applicant is the contact -->
                  <li>{{`${applicant.firstName} ${applicant.middleName} ${applicant.lastName}`}}</li>
                  <li>{{applicant.emailAddress}}</li>
                  <li>{{applicant.phoneNumber}}</li>
                </ul>
              </li>
            </ul>
          </div>
          <div>
            <h4>Applicant Info</h4>
            <ul style="list-style: none; padding-left: 0">
              <!-- If there's no contact person (agent / lawyer / etc.) the applicant is the contact -->
              <li >{{`${applicant.firstName} ${applicant.middleName} ${applicant.lastName}`}}</li>
              <li>{{`${applicant.addrLine1} ${applicant.addrLine2}`}}</li>
              <li>{{`${applicant.city}, ${applicant.stateProvinceCd}`}}</li>
              <li>
                {{`${applicant.countryTypeCd === 'CA' ? 'Canada' : applicant.countryTypeCd}, ${applicant.postalCd}`}}
              </li>
            </ul>
          </div>
        </div>
        <fee-summary
          v-bind:filingData="[...paymentDetails]"
          v-bind:fees="[...paymentFees]"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="createPayment" id="payment-pay-btn" class="primary" text>Accept</v-btn>
        <v-btn @click="hideModal" id="payment-close-btn" class="normal" text>Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import FeeSummary from '@/components/fee-summary.vue'

import paymentModule from '@/modules/payment'
import newRequestModule, { NewRequestModule } from '@/store/new-request-module'

import * as paymentService from '@/modules/payment/services'
import * as paymentTypes from '@/modules/payment/store/types'
import * as filingTypes from '@/modules/payment/filing-types'
import * as corpTypes from '@/modules/payment/corp-types'
import * as jurisdictions from '@/modules/payment/jurisdictions'

import {
  PostApplicantI
} from "@/models"

import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

@Component({
  components: {
    FeeSummary
  },
  data: () => ({
  }),
  computed: {
    isVisible: () => {
      return paymentModule[paymentTypes.PAYMENT_MODAL_IS_VISIBLE]
    }
  }
})
export default class PaymentModal extends Vue {
  @Watch('isVisible')
  onModalShow (val: boolean, oldVal: string): void {
    if (val) {
      this.fetchFees()
    }
  }

  async showModal () {
    await paymentModule.togglePaymentModal(true)
  }

  async hideModal () {
    await paymentModule.togglePaymentModal(false)
  }

  /**
   * This uses snake_case GET params
   */
  async fetchFees () {
    const corpType = 'NRO' // We may need to handle more than one type at some point?

    const response = await paymentService.getPaymentFees({
      'corp_type': corpType,
      'filing_type_code': this.filingType,
      'jurisdiction': jurisdictions.BC,
      'date': new Date().toISOString(),
      'priority': this.priorityRequest || false
    })
    await paymentModule.setPaymentFees(response.data)
  }

  async createPayment () {
    // Grab the applicant info from state
    const corpType = 'NRO' // We may need to handle more than one type at some point?
    const methodOfPayment = 'CC' // We may need to handle more than one type at some point?

    const { applicant, name, filingType, priorityRequest, nrData, nrResponseObject } = this

    const { addrLine1, addrLine2, city, stateProvinceCd, countryTypeCd, postalCd } = applicant
    const { corpNum } = nrData
    const { nrNum } = nrResponseObject

    if (!nrNum) {
      // eslint-disable-next-line no-console
      console.warn('NR number is not present in nrResponseObject, cannot continue!')
      return
    }

    const req = {
      paymentInfo: {
        methodOfPayment: methodOfPayment
      },
      businessInfo: {
        corpType: corpType,
        // TODO: Replace this with the NR Number? Or is this the actual business number?
        // TODO: Do they even have a business number at this point?
        businessIdentifier: corpNum || nrNum,
        businessName: name,
        contactInfo: {
          addressLine1: `${addrLine1} ${addrLine2}`,
          city: city,
          province: stateProvinceCd,
          country: countryTypeCd,
          postalCode: postalCd
        }
      },
      // This info comes from the frontend
      filingInfo: {
        date: new Date().toJSON().slice(0, 10), // Today's date
        filingTypes: [
          {
            filingTypeCode: filingType,
            priority: priorityRequest || false,
            filingDescription: `${filingType}: ${name} (${corpNum})`
          }
        ]
      }
    }

    const response = await paymentService.createPaymentRequest(nrNum, req)

    const { invoices = [] } = response.data

    await paymentModule.setPayment(response.data)
    await paymentModule.setPaymentInvoice(invoices[0])
    await paymentModule.setPaymentRequest(req)

    // Grab the new payment ID
    const { paymentId } = this
    // Store the payment ID to sessionStorage, that way we can start the user back where we left off
    sessionStorage.setItem('paymentInProgress', 'true')
    sessionStorage.setItem('paymentId', `${paymentId}`)
    sessionStorage.setItem('nrNum', `${nrNum}`)

    // Redirect user to Service BC Pay Portal
    const redirectUrl = encodeURIComponent(
      `${document.baseURI}/?paymentSuccess=true&paymentId=${paymentId}`
    )

    const paymentPortalUrl = `https://dev.bcregistry.ca/business/auth/makepayment/${paymentId}/${redirectUrl}`
    window.location.href = paymentPortalUrl
  }

  get applicant () {
    const nameRequest: NewRequestModule = newRequestModule
    const applicantInfo: Partial<PostApplicantI> = nameRequest.applicant || {}
    return applicantInfo
  }

  get contactPerson () {
    const { applicant = { contact: '' } } = this
    return (applicant.contact) ? `${applicant.contact}` : undefined
  }

  get client () {
    const { applicant = { clientFirstName: '', clientLastName: '' } } = this
    return (applicant.clientFirstName || applicant.clientLastName)
      ? `${applicant.clientFirstName} ${applicant.clientLastName}`
      : undefined
  }

  get isPersonsName () {
    const nameRequest: NewRequestModule = newRequestModule
    const isPersonsName: boolean = nameRequest.isPersonsName
    return isPersonsName
  }

  get name () {
    const nameRequest: NewRequestModule = newRequestModule
    const name: string = nameRequest.name
    return name
  }

  /**
   * eg:
   * {
   *     name1: 'ACME Construction',
   *     name2: 'ACME Home Construction',
   *     name3: 'ACME Commercial Construction',
   *     designation1: 'Ltd.',
   *     designation2: 'Ltd.',
   *     designation3: 'Ltd.'
   * }
   */
  get nameChoices () {
    const nameRequest: NewRequestModule = newRequestModule
    const nameRequestChoices: {} = nameRequest.nameChoices || {}

    /** Test
     {
        name1: 'ACME Construction',
        name2: 'ACME Home Construction',
        name3: 'ACME Commercial Construction',
        designation1: 'Ltd.',
        designation2: 'Ltd.',
        designation3: 'Ltd.'
     }
     */
    const parseNameChoices = (nameChoices) => {
      return Object.keys(nameChoices)
        .reduce((names, key, idx) => {
          // Key will be either 'name' or 'designation'
          const nameIdx = key.match(/[\d]+$/)[0]
          const typeKey = key.substring(0, key.lastIndexOf(nameIdx))
          names[nameIdx] = names[nameIdx] || { name: undefined, designation: undefined }
          names[nameIdx][typeKey] = nameChoices[key]
          return names
        }, [])
        .map((choice) => {
          return (choice.name && choice.designation)
            ? `${choice.name} ${choice.designation}`
            : (choice.name && !choice.designation)
              ? `${choice.name}`
              : undefined
        })
        .filter((name) => !!name)
    }

    return parseNameChoices(nameRequestChoices)
  }

  get entityType () {
    const nameRequest: NewRequestModule = newRequestModule
    const entityType: string = nameRequest.entityType
    return entityType
  }

  get nrData () {
    const nameRequest: NewRequestModule = newRequestModule
    const nrData: Partial<any> = nameRequest.nrData || {}
    return nrData
  }

  get nrResponseObject () {
    const nameRequest: NewRequestModule = newRequestModule
    const nrResponseObject: Partial<any> = nameRequest.nrResponseObject || {}
    return nrResponseObject
  }

  get priorityRequest () {
    const nameRequest: NewRequestModule = newRequestModule
    const priorityRequest: boolean = nameRequest.priorityRequest
    return priorityRequest
  }

  get filingType () {
    const { priorityRequest } = this
    let filingType = filingTypes.NM620
    if (priorityRequest) {
      // TODO: NM521 isn't working for calculating fees...
      filingType = filingTypes.NM620
    }

    return filingType
  }

  get payment () {
    return this.$store.getters[paymentTypes.GET_PAYMENT]
  }

  get paymentId () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_ID]
  }

  get paymentDetails () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_DETAILS]
  }

  get paymentFees () {
    return this.$store.getters[paymentTypes.GET_PAYMENT_FEES]
  }
}
</script>

<style lang="scss">
  .choice-indicator {
    background-color: #002e5e;
    color: white;
    border-radius: 100%;
    width: 1.75rem;
    height: 1.75rem;
    margin-right: 0.5rem;
    margin-bottom: 5px;
    box-sizing: border-box;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
</style>
