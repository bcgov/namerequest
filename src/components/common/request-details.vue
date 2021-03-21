<template>
  <div>
    <div class="mt-4">
      <div>
        <h4>Requested Name <span v-if="nameChoices.name2">Choices</span></h4>
        <ul class="pl-0">
          <li v-if="name && !nameChoices.name2">{{nameChoices.name1}} {{nameChoices.designation1}}</li>
          <template v-else>
            <li v-if="nameChoices.name1">
              <span>1. </span>{{nameChoices.name1}} {{nameChoices.designation1}}
            </li>
            <li v-if="nameChoices.name2">
              <span>2. </span>{{nameChoices.name2}} {{nameChoices.designation2}}
            </li>
            <li v-if="nameChoices.name3">
              <span>3. </span>{{nameChoices.name2}} {{nameChoices.designation3}}
            </li>
          </template>
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
import { ApplicantI, NameChoicesIF } from '@/interfaces'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

@Component({})
export default class RequestDetails extends Vue {
  @Prop(Object)
  readonly applicant: ApplicantI

  @Prop(Object)
  readonly nameChoices: NameChoicesIF

  @Prop(String)
  readonly name: string

  @Getter getNameChoices!: NameChoicesIF

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
