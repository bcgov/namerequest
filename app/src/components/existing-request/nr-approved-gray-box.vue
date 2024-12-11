<template>
  <v-row
    no-gutters
    class="bg-light-gray"
  >
    <v-col class="text-body-4 px-5 py-4">
      <div
        v-if="showRegisterButton"
        class="d-flex justify-center my-1"
      >
        <v-btn
          class="register-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('affiliateYourBusiness')"
        >
          <strong>Register Your Business</strong>
        </v-btn>
      </div>

      <div
        v-else-if="showIncorporateButton"
        class="d-flex justify-center my-1"
      >
        <v-btn
          class="incorporate-now-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('affiliateYourBusiness')"
        >
          <strong>Incorporate Your Business</strong>
        </v-btn>
      </div>

      <div
        v-else-if="showGoToSocietiesButton"
        class="d-flex justify-center my-1"
      >
        <v-btn
          class="societies-online-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('goToSocietiesOnline')"
        >
          <strong>Go to Societies Online to Register</strong>
          &nbsp;
          <v-icon small>
            mdi-open-in-new
          </v-icon>
        </v-btn>
      </div>

      <div
        v-else-if="showAmalgamateNowButton"
        class="d-flex justify-center my-1"
      >
        <v-btn
          v-if="showOpenExternalIcon"
          class="amalgamate-now-external-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('goToCorpOnline')"
        >
          <strong>Amalgamate Now</strong>
          &nbsp;
          <v-icon small>
            mdi-open-in-new
          </v-icon>
        </v-btn>
        <v-btn
          v-else
          class="amalgamate-now-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('affiliateYourBusiness')"
        >
          <strong>Amalgamate Now</strong>
        </v-btn>
      </div>

      <div
        v-else-if="showBeginContinuationButton"
        class="d-flex justify-center my-1"
      >
        <v-btn
          v-if="showOpenExternalIcon"
          class="amalgamate-now-external-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('goToCorpOnline')"
        >
          <strong>Begin Continuation</strong>
          &nbsp;
          <v-icon small>
            mdi-open-in-new
          </v-icon>
        </v-btn>
        <v-btn
          v-else
          class="amalgamate-now-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('affiliateYourBusiness')"
        >
          <strong>Begin Continuation</strong>
        </v-btn>
      </div>

      <div
        v-else-if="showAlterNowButton"
        class="my-1"
      >
        <div
          v-if="isAllowAlterOnline"
          class="d-flex justify-center"
        >
          <v-btn
            v-if="showOpenExternalIcon"
            class="alter-now-external-btn mt-30"
            min-width="20rem"
            :disabled="disabled"
            @click="$emit('goToCorpOnline')"
          >
            <strong>Alter Now</strong>
            &nbsp;
            <v-icon small>
              mdi-open-in-new
            </v-icon>
          </v-btn>
          <v-btn
            v-else
            class="alter-now-btn mt-30"
            min-width="20rem"
            :disabled="disabled"
            @click="$emit('goToEntityDashboard')"
          >
            <strong>Alter Now</strong>
          </v-btn>
        </div>

        <div
          v-else
          class="contact-registries mt-30"
        >
          <p>To complete this alteration, please contact us at:</p>
          <p>
            <v-icon small>
              mdi-phone
            </v-icon>&nbsp;Canada and U.S. Toll Free:
            <a href="tel:+1877-526-1526">1-877-526-1526</a>
          </p>
          <p>
            <v-icon small>
              mdi-phone
            </v-icon>&nbsp;Victoria Office:
            <a href="tel:250-387-7848">250-387-7848</a>
          </p>
          <p>
            <v-icon small>
              mdi-email
            </v-icon>&nbsp;Email:
            <a href="mailto:BCRegistries@gov.bc.ca">BCRegistries@gov.bc.ca</a>
          </p>
        </div>
      </div>

      <div
        v-else-if="showNameChangeButton"
        class="d-flex justify-center my-1"
      >
        <v-btn
          v-if="showOpenExternalIcon"
          class="change-name-now-external-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('goToCorpOnline')"
        >
          <strong>Change Name Now</strong>
          &nbsp;
          <v-icon small>
            mdi-open-in-new
          </v-icon>
        </v-btn>
        <v-btn
          v-else
          class="change-name-now-btn mt-30"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('goToEntityDashboard')"
        >
          <strong>Change Name Now</strong>
        </v-btn>
      </div>

      <p
        v-else
        class="mt-30"
      >
        Your Name Request <strong>{{ nrNum }}</strong> for <strong>{{ approvedName }}</strong> has been
        approved for use. An email has been sent to <strong>{{ emailAddress }}</strong> with instructions
        for how to use your Name Request.
      </p>

      <v-row
        no-gutters
        class="important-note mt-30 mb-30"
      >
        <v-col
          cols="auto"
          class="mr-2"
        >
          <v-icon color="caution">
            mdi-alert
          </v-icon>
        </v-col>
        <v-col
          class="no-gutters"
          cols="11"
        >
          <strong>Important:</strong> Name Requests expire. Your Name Request is <strong>reserved for 56
            days</strong> from the date of approval. Be sure to use your Name Request before it expires. If
          it expires, you will need to submit a new Name Request ($30.00 fee) as the name will once again
          be available to the public.
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { CommonMixin } from '@/mixins'
import { NameRequestI } from '@/interfaces'
import { EntityTypes, NrRequestActionCodes, NrState } from '@/enums'

@Component({})
export default class NrApprovedGrayBox extends Mixins(CommonMixin) {
  @Prop({ default: 'TBD' }) readonly nrNum!: string
  @Prop({ default: 'TBD' }) readonly approvedName!: string
  @Prop({ default: 'TBD' }) readonly emailAddress!: string
  @Prop({ default: false }) readonly disabled!: boolean

  @Getter getNr!: Partial<NameRequestI>
  @Getter getIsLearBusiness!: boolean

  isBusinesCheckDone = false

  /** Called when component is mounted. */
  mounted () {
    this.checkBusiness()
  }

  get isConversion (): boolean {
    return (this.getNr.request_action_cd === NrRequestActionCodes.CONVERSION)
  }

  get isNameChange (): boolean {
    return (this.getNr.request_action_cd === NrRequestActionCodes.CHANGE_NAME)
  }

  get isNewBusiness (): boolean {
    return (this.getNr.request_action_cd === NrRequestActionCodes.NEW_BUSINESS)
  }

  get isAmalgamate (): boolean {
    return (this.getNr.request_action_cd === NrRequestActionCodes.AMALGAMATE)
  }

  get isContinuationIn (): boolean {
    return (this.getNr.request_action_cd === NrRequestActionCodes.MOVE)
  }

  get isApprovedOrConsentUnRequired (): boolean {
    return (NrState.APPROVED === this.getNr.state || this.isConsentUnRequired)
  }

  get isConsentUnRequired (): boolean {
    return (
      (NrState.CONDITIONAL === this.getNr.state) &&
      (this.getNr.consentFlag === null || this.getNr.consentFlag === 'R' || this.getNr.consentFlag === 'N')
    )
  }

  /** True if the Alter Now button should be shown. */
  get showAlterNowButton (): boolean {
    return (this.isConversion && this.isApprovedOrConsentUnRequired)
  }

  /** True if the Amalgamate Now button should be shown. */
  get showAmalgamateNowButton (): boolean {
    return (this.isAmalgamate && this.isApprovedOrConsentUnRequired)
  }

  /** True if the Begin Continuation button should be shown. */
  get showBeginContinuationButton (): boolean {
    return (this.isContinuationIn && this.isApprovedOrConsentUnRequired)
  }

  /** True if the Change Name Now button should be shown. */
  get showNameChangeButton (): boolean {
    return (this.isNameChange && this.isApprovedOrConsentUnRequired)
  }

  get isAllowAlterOnline (): boolean {
    return this.isAlterOnline(this.getNr.requestTypeCd)
  }

  get showOpenExternalIcon (): boolean {
    if (this.showAmalgamateNowButton && !this.isSupportedAmalgamation(this.getNr.entity_type_cd)) return true
    if (this.showAlterNowButton && this.isBusinesCheckDone && !this.getIsLearBusiness) return true
    if (this.showBeginContinuationButton && !this.isSupportedContinuationIn(this.getNr.entity_type_cd)) return true
    if (this.showNameChangeButton && this.isBusinesCheckDone && !this.getIsLearBusiness) return true
    return false
  }

  /** True if the Go To Societies Online button should be shown. */
  get showGoToSocietiesButton (): boolean {
    return (
      this.getNr.entity_type_cd === EntityTypes.SO &&
      this.getNr.request_action_cd === NrRequestActionCodes.NEW_BUSINESS &&
      (NrState.APPROVED === this.getNr.state || this.isConsentUnRequired)
    )
  }

  /** True if the Incorporate button should be shown. */
  get showIncorporateButton (): boolean {
    return (
      !this.isFirm(this.getNr) &&
      this.isNewBusiness &&
      this.isSupportedIncorporationRegistration(this.getNr.entity_type_cd) &&
      this.isApprovedOrConsentUnRequired
    )
  }

  /** True if the Register button should be shown. */
  get showRegisterButton (): boolean {
    return (
      this.isFirm(this.getNr) &&
      this.isNewBusiness &&
      this.isSupportedIncorporationRegistration(this.getNr.entity_type_cd) &&
      this.isApprovedOrConsentUnRequired
    )
  }

  /** check if business is in Lear and set store value of isLearBusiness flag */
  async checkBusiness (): Promise<void> {
    await this.checkBusinessInLear(this.getNr?.corpNum)
    this.isBusinesCheckDone = true
  }
}

</script>

<style lang="scss" scoped>
@import '@/assets/styles/theme.scss';

.contact-registries {
  font-size: $px-16;
  .v-icon.v-icon {
    color: $app-dk-blue;
  }
}
</style>
