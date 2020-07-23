<template>
  <MainContainer id="analyze-pending-container">
    <template v-slot:container-header>
      <v-col cols="auto">
        <b>Your search returned the following Name Request:</b>
      </v-col>
    </template>
    <template v-slot:content>
      <v-row align="start" v-if="requestData.nrNum">
        <v-col cols="auto" class="fs-24">
          <span class="h3 mr-2">{{ requestData.nrNum }}</span>
        </v-col>
        <v-col class="bold-copy">
          <div style="display: inline-block" class="">
            <div v-for="name of names" :key="name.choice">{{ `${name.choice}) ${name.name}` }}</div>
          </div>
        </v-col>
        <v-col cols="12">
          <v-row class="pt-3">
            <v-col cols="9">
              <v-row dense class="mt-n5">
                <v-col cols="12">
                  <span class="bold-text">Last Update: </span> {{ lastUpdate }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Status: </span> {{ requestData.state }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Priority Request: </span> {{ priorityReq ? 'Yes' : 'No' }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Expiry Date: </span> {{ expiryDate }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Submit Count: </span>{{ requestData.submitCount }}
                </v-col>
                <v-col cols="12" v-if="requestData.conditions">
                  <span class="bold-text">Condition/Consent: </span>
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Submitting Party: </span> {{ requestData.applicants.lastName }},
                  {{ requestData.applicants.firstName }}
                </v-col>
                <v-col cols="12">
                  <span class="bold-text">Address: </span> {{ address }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="3" v-if="requestData.state !== 'CANCELLED'">
              <v-row dense>
                <v-col cols="12"><v-btn block @click="edit">EDIT</v-btn></v-col>
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
    let output: string = this.requestData.applicants.addrLine1
    for (let field of fields) {
      if (this.requestData.applicants[field]) {
        output += ', ' + this.requestData.applicants[field]
      }
    }
    return output
  }
  get addressLines () {
    let output = [ this.requestData.applicants.addrLine1 ]
    if (this.requestData.applicants.addrLine2) {
      output.push(this.requestData.applicants.addrLine2)
    }
    return output
  }
  get cityProvPostal () {
    let { applicants } = this.requestData
    return applicants.city + ', ' + applicants.stateProvinceCd + ', ' + applicants.postalCd
  }
  get expiryDate () {
    if (this.requestData.expirationDate) {
      return Moment(this.requestData.expirationDate).format('MMM Do[,] YYYY')
    }
    return ''
  }
  get lastUpdate () {
    if (this.requestData.lastUpdate) {
      return Moment(this.requestData.lastUpdate).format('MMM Do[,] YYYY')
    }
    return ''
  }
  get name () {
    let nameObj = this.requestData.names.find(name => name.choice === 1)
    return nameObj.name
  }
  get names () {
    return this.requestData.names.sort((a, b) => {
      if (a.choice > b.choice) {
        return 1
      }
      if (a.choice < b.choice) {
        return -1
      }
      return 0
    })
  }
  get requestData () {
    return newReqModule.requestData
  }
  get priorityReq () {
    return (this.requestData.priorityCd && this.requestData.priorityCd === 'Y')
  }
  get showIncorporate () {
    return false
  }
  get showReapply () {
    let firstDay = Moment(this.requestData.expirationDate).subtract(this.daysBeforeExpiry, 'days')
    return Moment().isSameOrAfter(firstDay, 'day')
  }
  get showReceipt () {
    return (this.requestData.state === 'APPROVED' || this.requestData.state === 'CONDITION')
  }

  edit () {
    newReqModule.editExistingRequest()
  }
}

</script>

<style lang="sass" scoped>
.whitesmoke-bg
  background-color: whitesmoke

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
