<template>
  <v-row align="center" class="pa-6 pl-8 pr-9">
    <v-col cols="12" class="pa-4">
      Enter Name Request Number or Business Name and either the Applicant's Phone or Email</v-col>
    <v-col cols="1" class="max-height">
      <v-img src="../../assets/images/one-icon.png"
                  contain
                  height="60" />
    </v-col>
    <v-col cols="11" class="max-height">
      <v-text-field v-model="nrNumber"
                      filled
                      placeholder="Business Name or NR Number"
                      id="existing-req-nr-field">
      </v-text-field>
    </v-col>
    <v-col cols="12" class="mr-auto mb-n3">

    </v-col>
    <v-col cols="1" class="max-height mt-4">
      <v-img src="../../assets/images/two-icon.png"
             contain
             style="margin-bottom: auto;"
             height="60" />
    </v-col>
    <v-col class="max-height mt-4">
      <v-text-field v-model="emailAddress"
                    filled
                    placeholder="Applicant's Notification Email"
                    id="existing-req-email-field">
      </v-text-field>
    </v-col>
    <v-col class="max-height shrink mt-auto"> or </v-col>
    <v-col class="max-height mt-4">
      <v-text-field v-model="emailAddress"
                    filled
                    placeholder="Applicant's Notification Email"
                    id="existing-req-email-field">
      </v-text-field>
    </v-col>
    <v-col cols="12" class="mt-4">
      <div style="display: flex; width: 100%;">
        <div style="margin-left: auto" class="link-text"><v-btn @click="handleSubmit">Submit</v-btn></div>
      </div>

    </v-col>
  </v-row>
</template>

<script lang="ts">
import ForgotNrModal from '@/components/modals/forgot-nr'
import newReqModule from '@/store/existing-request-module'
import { Component, Vue } from 'vue-property-decorator'
import { RequestDataI, SearchDataI, NrDataResponseT, NrDataT } from '@/models'

@Component({
  components: { ForgotNrModal }
})
export default class ExistingRequstSearch extends Vue {
  get dialog (): boolean {
    return newReqModule.forgotNRModalVisible
  }
  set dialog (value: boolean) {
    newReqModule.toggleForgotNRModal(value)
  }
  get email (): NrDataT {
    return newReqModule.emailAddress
  }
  set email (addr: NrDataT) {
    newReqModule.setEmail(addr)
  }
  get nrNumber (): NrDataT {
    return newReqModule.nrNumber
  }
  set nrNumber (nr: string | null) {
    newReqModule.setNrNumber(nr)
  }
  get phone (): NrDataT {
    return newReqModule.phone
  }
  set phone (number: NrDataT) {
    newReqModule.setPhone(number)
  }

  handleSubmit (): void {

  }
  toggleModal (value: boolean) {
    newReqModule.toggleForgotNRModal(value)
  }
}

</script>

<style lang="sass" scoped>
.forgot-nr-link
  text-decoration: underline
  cursor: pointer !important

.max-height
  max-height: 60px

.no-style-button
  background-color: unset !important
  border: 0 !important
  border-radius: 0 !important
  box-shadow: unset !important

</style>
