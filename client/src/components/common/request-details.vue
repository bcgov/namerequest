<template>
  <div>
    <div style="display: flex; justify-content: space-between; flex-flow: row wrap; margin-bottom: 15px">
      <div style="margin: 30px 30px 0">
        <h4>Requested Name <span v-if="nameChoices && nameChoices.length > 0">Choices</span></h4>
        <ul style="list-style: none" class="pl-0">
          <li v-if="nameChoices && nameChoices.length === 0">{{name}}</li>
          <li v-if="nameChoices[0]">
            <span class="choice-indicator" v-if="nameChoices && nameChoices.length > 0">1</span>{{nameChoices[0]}}
          </li>
          <li v-if="nameChoices[1]">
            <span class="choice-indicator" v-if="nameChoices && nameChoices.length > 1">2</span>{{nameChoices[1]}}
          </li>
          <li v-if="nameChoices[2]">
            <span class="choice-indicator" v-if="nameChoices && nameChoices.length > 2">3</span>{{nameChoices[2]}}
          </li>
        </ul>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; flex-flow: row wrap; margin-bottom: 15px">
      <div style="margin: 15px 30px 15px">
        <ul style="list-style: none" class="pl-0">
          <li v-if="client">
            <h4>Client Name</h4>
            <ul style="list-style: none" class="pl-0">
              <li>{{`${client}`}}</li>
            </ul>
          </li>
          <li v-if="contactPerson">
            <h4>Primary Contact</h4>
            <ul style="list-style: none" class="pl-0">
              <li>{{`${contactPerson}`}}</li>
              <li>{{applicant.emailAddress}}</li>
              <li>{{applicant.phoneNumber}}</li>
            </ul>
          </li>
          <li v-if="!contactPerson">
            <h4>Primary Contact</h4>
            <ul style="list-style: none" class="pl-0">
              <!-- If there's no contact person (agent / lawyer / etc.) the applicant is the contact -->
              <li>{{`${applicantName}`}}</li>
              <li>{{applicant.emailAddress}}</li>
              <li>{{applicant.phoneNumber}}</li>
            </ul>
          </li>
        </ul>
      </div>
      <div style="margin: 15px 30px 15px">
        <h4>Applicant Info</h4>
        <ul style="list-style: none" class="pl-0">
          <!-- If there's no contact person (agent / lawyer / etc.) the applicant is the contact -->
          <li >{{`${applicantName}`}}</li>
          <li>
            {{`${applicant.addrLine1 ? applicant.addrLine1 : ''} ${applicant.addrLine2 ? applicant.addrLine2 : ''}`}}
          </li>
          <li>
            {{`${applicant.city ? applicant.city : ''}, ${applicant.stateProvinceCd ? applicant.stateProvinceCd : ''}`}}
          </li>
          <li>
            {{`${applicant.countryTypeCd === 'CA' ? 'Canada' : applicant.countryTypeCd},
             ${applicant.postalCd ? applicant.postalCd : ''}`}}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import FeeSummary from '@/components/payment/fee-summary.vue'

import {
  ApplicantI
} from '@/models'

import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({
  components: {
    FeeSummary
  }
})
export default class RequestDetails extends Vue {
  @Prop(Object) applicant: ApplicantI
  @Prop(Array) nameChoices: {
    type: any[]
    required: false
  }
  @Prop(String) name: string
  // @Prop(Boolean) priorityRequest: boolean
  // @Prop(Object) payment: any

  get applicantName (): string {
    const applicant = this.applicant
    if (!applicant) return ''
    return [applicant.firstName, applicant.middleName, applicant.lastName]
      .filter(str => !!str).join(' ')
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
}
</script>

<style lang="scss">
@import "@/assets/scss/theme.scss";

.choice-indicator {
  background-color: $gray9;
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

h4 {
  font-weight: bold !important;
}
</style>
