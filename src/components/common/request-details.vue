<template>
  <div>
    <div class="mt-4">
      <div>
        <h4>Requested Name <span v-if="nameChoices && nameChoices.length > 0">Choices</span></h4>
        <ul class="pl-0">
          <li v-if="nameChoices && nameChoices.length === 0">{{name}}</li>
          <li v-if="nameChoices[0]">
            <span v-if="nameChoices && nameChoices.length > 0">1. </span>{{nameChoices[0]}}
          </li>
          <li v-if="nameChoices[1]">
            <span v-if="nameChoices && nameChoices.length > 1">2. </span>{{nameChoices[1]}}
          </li>
          <li v-if="nameChoices[2]">
            <span v-if="nameChoices && nameChoices.length > 2">3. </span>{{nameChoices[2]}}
          </li>
        </ul>
      </div>
    </div>
    <v-row>
      <v-col col="6">
        <h4>Applicant Information</h4>
        <ul class="pl-0">
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
      </v-col>
      <v-col col="6">
        <ul class="pl-0">
          <li v-if="client">
            <h4>Client Name</h4>
            <ul class="pl-0">
              <li>{{`${client}`}}</li>
            </ul>
          </li>
          <li v-if="contactPerson">
            <h4>Primary Contact</h4>
            <ul class="pl-0">
              <li>{{`${contactPerson}`}}</li>
              <li>{{applicant.emailAddress}}</li>
              <li>{{applicant.phoneNumber}}</li>
            </ul>
          </li>
          <li v-if="!contactPerson">
            <h4>Primary Contact</h4>
            <ul class="pl-0">
              <!-- If there's no contact person (agent / lawyer / etc.) the applicant is the contact -->
              <li>{{`${applicantName}`}}</li>
              <li>{{applicant.emailAddress}}</li>
              <li>{{applicant.phoneNumber}}</li>
            </ul>
          </li>
        </ul>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { ApplicantI } from '@/interfaces'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
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

<style lang="scss" scoped>
@import "@/assets/scss/theme";

h4 {
  font-weight: bold !important;
  font-size: 1rem;
  color: $dk-text;
}

ul {
  list-style: none;
}
</style>
