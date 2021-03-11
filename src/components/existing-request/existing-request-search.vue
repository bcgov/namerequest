<template>
  <div>
    <v-row no-gutters>

      <!-- Help Info -->
      <v-col cols="3" class="existing-request-info copy-small">
        <div class="ma-8">
          <ul class="mt-3">
            <li>
              Check review time and approval status
            </li>
            <li>
              Upgrade Name Request to Priority ($100.00)
            </li>
            <li>
              Extend Name Request for an additional 56 days before it expires ($30.00)
            </li>
            <li>
              Cancel your Name Request
            </li>
            <li>
              Edit details, download receipts, and more
            </li>
          </ul>
        </div>
      </v-col>

      <!-- Existing Request Search -->
      <v-col cols="9">
        <v-form v-model="isValid" lazy-validation @submit="handleSubmit()" class="pa-10" ref="existing-nr-form">
          <v-row no-gutters>
            <!-- FIRST LINE -->
            <v-col cols="1" class="max-width"></v-col>
            <v-col cols="11" class="h6">
             Enter your information to manage an existing Name Request:
            </v-col>
          </v-row>

          <!-- SECOND LINE -->
          <v-row class="mt-4" no-gutters v-if="errorMessage">
            <v-col cols="1" class="max-width"></v-col>
            <v-col cols="11" class="error-message copy-small" v-html="errorMessage" />
          </v-row>

          <!-- THIRD LINE -->
          <v-row class="mt-4 mb-6" no-gutters align="center">
            <v-col cols="1" class="max-width">
              <v-img src="../../assets/images/number1.svg" contain width="34" height="34" />
            </v-col>
            <v-col class="max-height">
              <v-text-field :rules="nrRules"
                            :value="getExistingRequestSearch.nrNum"
                            @input="handleExistingRequestSearch('nrNum', $event)"
                            class="copy-normal"
                            filled
                            id="nr-num-text-field"
                            label="NR Number"
                            hint="Example: NR 1234567"
                            persistent-hint
                            validate-on-blur />
            </v-col>
          </v-row>

          <!-- FOURTH LINE -->
          <v-row class="mt-5" no-gutters align="center">
            <v-col cols="1" class="max-width">
              <v-img src="../../assets/images/number2.svg" contain width="34" height="34" />
            </v-col>
            <v-col class="max-height">
              <v-text-field :rules="phoneRules"
                            :value="getExistingRequestSearch.phoneNumber"
                            @input="handleExistingRequestSearch('phoneNumber', $event)"
                            class="copy-normal"
                            filled
                            id="phone-number-text-field"
                            label="Applicant's Phone Number"
                            hint="Example: 555-555-5555"
                            persistent-hint
                            validate-on-blur />
            </v-col>
            <v-col class="copy-normal text-center shrink mx-4"> or </v-col>
            <v-col class="max-height">
              <v-text-field :rules="emailRules"
                            :value="getExistingRequestSearch.emailAddress"
                            @input="handleExistingRequestSearch('emailAddress', $event)"
                            class="copy-normal"
                            filled
                            id="email-address-text-field"
                            label="Applicant's Notification Email"
                            hint="Example: name@email.com"
                            persistent-hint
                            validate-on-blur />
            </v-col>
          </v-row>

          <!-- FIFTH LINE -->
          <v-row class="mt-9" no-gutters>
            <v-col class="text-center">
              <v-btn id="retrieve-name-btn" @click="handleSubmit()">Retrieve Name Request</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class'

import { NameRequestI, ExistingRequestSearchI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({})
export default class ExistingRequestSearch extends Vue {
  // Global Getters
  @Getter getNr!: Partial<NameRequestI>
  @Getter getExistingRequestSearch!: ExistingRequestSearchI

  // Global Actions
  @Action findNameRequest!: ActionBindingIF
  @Action setExistingRequestSearch!: ActionBindingIF
  @Action setNameRequest!: ActionBindingIF

  private errorMessage = ''
  private isValid = false
  // eslint-disable-next-line no-useless-escape
  private NR_REGEX = /^(NR\ ?L?|L?)?([\d]{6,8})$/

  mounted () {
    this.$nextTick(() => {
      if (this.$el?.querySelector) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        const retrieveNrBtn = this.$el.querySelector('#retrieve-name-btn > span')
        if (retrieveNrBtn) retrieveNrBtn.classList.add('retrieve-nr-btn')
      }
    })

    if (this.getNr && this.getNr.failed) {
      this.errorMessage = this.getNr.text
      this.setNameRequest({})
      return
    }
    for (let key of ['emailAddress', 'phoneNumber']) {
      let value = ''
      this.setExistingRequestSearch({ key, value })
    }
  }

  private emailRules = [
    v => (!!v || !!this.getExistingRequestSearch?.phoneNumber) || 'Please enter either the phone or the email',
    v => !!this.getExistingRequestSearch?.phoneNumber || (!!v && /.+@.+\..+/.test(v)) ||
      'Please be sure to enter a valid email'
  ]
  private nrRules = [
    v => this.NR_REGEX.test(v) || 'Please enter a valid NR number'
  ]
  private phoneRules = [
    v => (!v || v.length <= 30) || 'Cannot exceed 30 characters'
  ]

  private async handleSubmit (): Promise<void> {
    this.$refs['existing-nr-form']['validate']()
    await this.$nextTick()
    if (this.isValid) {
      await this.findNameRequest(null)
      if (this.getNr?.failed) {
        // capture error text and then clear out the NR data
        this.errorMessage = this.getNr.text
        this.setNameRequest({})
      }
      // FUTURE: clear out applicant's phone and email ?
      // for (let key of ['emailAddress', 'phoneNumber']) {
      //   let value = ''
      //   newReqModule.mutateExistingRequestSearch({ key, value })
      // }
    }
  }

  private handleExistingRequestSearch (key: string, value: string) {
    // auto-capitalize the entered NR number
    if (key === 'nrNum') value = value.toUpperCase()

    this.$refs['existing-nr-form']['resetValidation']()
    this.setExistingRequestSearch({ key, value })
    if (this.errorMessage) {
      this.errorMessage = ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/theme.scss';

.existing-request-info {
  background-color: $gray1;
  width: 100%;
  position: relative !important;

  ul {
    display: inline-table;

    li  {
      padding-bottom: 10px;
    }
  }
}

/* Helper info column pointer */
.existing-request-info:after{
  content: "";
  position:absolute;
  top:5.75rem;
  left:100%;
  border-top: 18px solid transparent !important;
  border-bottom: 18px solid transparent !important;
  border-left: 14px solid $gray1 !important;
}

.col.max-width {
  max-width: 3rem;
}

.col.max-height {
  max-height: 60px;
}

#retrieve-name-btn {
  min-height: 45px !important;
  padding: 0 50px !important;
}
</style>
