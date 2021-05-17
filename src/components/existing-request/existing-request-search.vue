<template>
  <div id="existing-request-search">

    <!-- Advanced Search Dialog -->
    <advanced-search
      attach="#existing-request-search"
      :dialog="advancedSearchDialog"
      @closeDialog="advancedSearchDialog = false"
    />

    <v-row no-gutters>

      <!-- Help Info -->
      <v-col cols="3" class="existing-request-info copy-small">
        <div class="mx-8 my-10">
          <ul>
            <li>Check review time and approval status</li>
            <li>Upgrade Name Request to Priority ($100.00)</li>
            <li>Renew your Name Request for an additional 56 days before it expires ($30.00)</li>
            <li>Cancel your Name Request</li>
            <li>Edit details, download receipts, and more</li>
          </ul>
        </div>
      </v-col>

      <!-- Existing Request Search -->
      <v-col cols="9">
        <v-form v-model="isValid" lazy-validation @submit="handleSubmit()" class="pa-10" ref="existingNrForm">

          <!-- FIRST LINE -->
          <v-row no-gutters>
            <v-col cols="1" class="max-width" />
            <v-col cols="11" class="h6">
              Enter your information to manage an existing Name Request:
            </v-col>
          </v-row>

          <!-- SECOND LINE -->
          <v-row class="mt-4" no-gutters v-if="errorMessage">
            <v-col cols="1" class="max-width" />
            <v-col cols="11" class="error-message copy-small" v-html="errorMessage" />
          </v-row>

          <!-- THIRD LINE -->
          <v-row class="mt-4" no-gutters align="center">
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
                            validate-on-blur
              />
            </v-col>
          </v-row>

          <!-- FOURTH LINE -->
          <v-row class="mt-6" no-gutters align="center">
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
                            validate-on-blur
              />
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
                            validate-on-blur
              />
            </v-col>
          </v-row>

          <!-- FIFTH LINE -->
          <v-row class="mt-9" no-gutters>
            <v-col class="text-center">
              <v-btn id="retrieve-name-btn" @click="handleSubmit()">Retrieve Name Request</v-btn>
            </v-col>
          </v-row>

          <!-- SIXTH LINE -->
          <v-row v-if="isAdvancedSearchEnabled" class="mt-3" no-gutters>
            <v-col class="text-center">
              <v-btn
                id="advanced-search-btn"
                class="button-text"
                text
                @click="advancedSearchDialog = true"
              >
                I don't know my NR Number
              </v-btn>
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
import { getFeatureFlag } from '@/plugins'

import { AdvancedSearch } from '@/components/dialogs'

import { FormType, NameRequestI, ExistingRequestSearchI } from '@/interfaces'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

@Component({
  components: {
    AdvancedSearch
  }
})
export default class ExistingRequestSearch extends Vue {
  // Refs
  $refs!: {
    existingNrForm: FormType
  }

  // Global getters
  @Getter getIsAuthenticated!: boolean
  @Getter getNr!: Partial<NameRequestI>
  @Getter getExistingRequestSearch!: ExistingRequestSearchI

  // Global actions
  @Action findNameRequest!: ActionBindingIF
  @Action setExistingRequestSearch!: ActionBindingIF
  @Action setNameRequest!: ActionBindingIF

  private errorMessage = ''
  private isValid = false
  private advancedSearchDialog = false

  // eslint-disable-next-line no-useless-escape
  private NR_REGEX = /^(NR\ ?L?|L?)?([\d]{6,8})$/

  /** Is true when a user has a token and the advanced search feature flag is true. */
  private get isAdvancedSearchEnabled (): boolean {
    return this.getIsAuthenticated && getFeatureFlag('advanced-search-enabled')
  }

  mounted () {
    this.$nextTick(() => {
      if (this.$el?.querySelector instanceof Function) {
        // add classname to button text (for more detail in Sentry breadcrumbs)
        const retrieveNrBtn = this.$el.querySelector('#retrieve-name-btn > span')
        if (retrieveNrBtn) retrieveNrBtn.classList.add('retrieve-nr-btn')
      }
    })

    if (this.getNr?.failed) {
      this.errorMessage = this.getNr.text
      this.setNameRequest({})
      return
    }

    for (let key of ['emailAddress', 'phoneNumber']) {
      this.setExistingRequestSearch({ key, value: '' })
    }
  }

  private nrRules = [
    v => this.NR_REGEX.test(v) || 'Please enter a valid NR number'
  ]
  private emailRules = []
  private phoneRules = []

  private async handleSubmit (): Promise<void> {
    this.applyRules()
    this.$refs.existingNrForm.validate()
    await this.$nextTick()

    if (this.isValid) {
      await this.findNameRequest(null)
      if (this.getNr?.failed) {
        // capture error text and then clear out the NR data
        this.errorMessage = this.getNr.text
        this.setNameRequest({})
      }
    }
  }

  /** Apply the field rules to request search inputs. */
  private applyRules (): void {
    const { emailAddress, phoneNumber } = this.getExistingRequestSearch

    this.phoneRules = (phoneNumber || !emailAddress)
      ? [
        v => !!v || 'Please enter a phone number',
        v => (v.length <= 30) || 'Cannot exceed 30 characters'
      ]
      : []

    this.emailRules = (!phoneNumber || emailAddress)
      ? [
        v => !!v || 'Please enter an email',
        v => (/.+@.+\..+/.test(v)) || 'A valid email is required'
      ]
      : []
  }

  private handleExistingRequestSearch (key: string, value: string) {
    // uppercase the NR number
    if (key === 'nrNum') value = value.toUpperCase()

    this.$refs.existingNrForm.resetValidation()
    this.setExistingRequestSearch({ key, value })
    this.errorMessage = ''
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
  padding: 0 30px !important;
  font-size: 1rem !important;
}
</style>
