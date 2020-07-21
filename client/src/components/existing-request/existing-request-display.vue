<template>
  <MainContainer id="analyze-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto">
        <b>Your search returned the following Name Request:</b>
      </v-col>
    </template>
    <template v-slot:content>
      <v-row align="center" v-if="nrData.nrNum">
        <v-col cols="12" class="fs-24">
          <span class="h3 mr-2">{{ nrData.nrNum }}</span>, {{ name }}
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="9">
              <v-row dense class="mt-n5">
                <v-col cols="12">
                  <span class="bold-text">Last Update: </span> {{ lastUpdate }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Status: </span> {{ nrData.state }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Priority Request: </span> {{ priorityReq ? 'Yes' : 'No' }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Expiry Date: </span> {{ expiryDate }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Submit Count: </span>{{ nrData.submitCount }}
                </v-col>
                <v-col cols="12" v-if="nrData.conditions">
                  <span class="bold-text">Condition/Consent: </span>
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Submitting Party: </span> {{ nrData.applicants.lastName }},
                  {{ nrData.applicants.firstName }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Address: </span> {{ address }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="3" v-if="nrData.state !== 'CANCELLED'">
              <v-row dense>
                <v-col cols="12"><v-btn block>EDIT</v-btn></v-col>
                <v-col cols="12"><v-btn block>CANCEL</v-btn></v-col>
                <v-col cols="12" v-if="showReapply"><v-btn block>RE-APPLY</v-btn></v-col>
                <v-col cols="12" v-if="showReceipt"><v-btn block>RECEIPT</v-btn></v-col>
                <v-col cols="12" v-if="showIncorporate"><v-btn block>INCORPORATE</v-btn></v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </MainContainer>
</template>

<script lang="ts">
import newReqModule from '@/store/new-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { RequestDataI } from '@/models'
import MainContainer from '@/components/new-request/main-container.vue'
import Moment from 'moment'

@Component({
  components: { MainContainer }
})
export default class ExistingRequestDisplay extends Vue {
  daysBeforeExpiry: number = 5

  get address () {
    let fields = ['addrLine2', 'city', 'stateProvinceCd', 'countryCd', 'postalCd']
    let output: string = this.nrData.applicants.addrLine1
    for (let field of fields) {
      if (this.nrData.applicants[field]) {
        output += ', ' + this.nrData.applicants[field]
      }
    }
    return output
  }
  get nrData () {
    return newReqModule.requestData
  }
  get priorityReq () {
    return (this.nrData.priorityCd && this.nrData.priorityCd === 'Y')
  }
  get expiryDate () {
    if (this.nrData.expirationDate) {
      return Moment(this.nrData.expirationDate).format('MMM Do[,] YYYY')
    }
    return ''
  }
  get addressLines () {
    let output = [ this.nrData.applicants.addrLine1 ]
    if (this.nrData.applicants.addrLine2) {
      output.push(this.nrData.applicants.addrLine2)
    }
    return output
  }
  get cityProvPostal () {
    let { applicants } = this.nrData
    return applicants.city + ', ' + applicants.stateProvinceCd + ', ' + applicants.postalCd
  }
  get lastUpdate () {
    if (this.nrData.lastUpdate) {
      return Moment(this.nrData.lastUpdate).format('MMM Do[,] YYYY')
    }
    return ''
  }
  get name () {
    let nameObj = this.nrData.names.find(name => name.choice === 1)
    return nameObj.name
  }
  get showReceipt () {
    return (this.nrData.state === 'APPROVED' || this.nrData.state === 'CONDITION')
  }
  get showReapply () {
    let firstDay = Moment(this.nrData.expirationDate).subtract(this.daysBeforeExpiry, 'days')
    return Moment().isSameOrAfter(firstDay, 'day')
  }
  get showIncorporate () {
    return false
  }
}

</script>

<style lang="sass" scoped>
.max-height
  max-height: 60px

.no-style-button
  background-color: unset !important
  border: 0 !important
  border-radius: 0 !important
  box-shadow: unset !important

.forgot-nr-link
  text-decoration: underline
  cursor: pointer !important

</style>
