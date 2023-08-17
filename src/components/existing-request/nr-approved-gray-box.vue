<template>
  <v-row no-gutters class="bg-light-gray">
    <v-col class="text-body-4 px-5 py-4">
      <div v-if="showRegisterButton" class="d-flex justify-center my-1 pb-1">
        <v-btn
          class="register-btn"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('incorporateRegisterYourBusiness')"
        >
          <strong>Register Your Business</strong>
        </v-btn>
      </div>

      <div v-else-if="showIncorporateNowButton" class="d-flex justify-center my-1 pb-1">
        <v-btn
          class="incorporate-now-btn"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('incorporateRegisterYourBusiness')"
        >
          <strong>Incorporate Your Business</strong>
        </v-btn>
      </div>

      <div v-else-if="showGoToSocietiesButton" class="d-flex justify-center my-1 pb-1">
        <v-btn
          class="societies-online-btn"
          min-width="20rem"
          :disabled="disabled"
          @click="$emit('goToSocietiesOnline')"
        >
          <strong>Go to Societies Online to Register</strong>
          &nbsp;
          <v-icon small>mdi-open-in-new</v-icon>
        </v-btn>
      </div>

      <p v-else>
        Your Name Request <strong>{{nrNum}}</strong> for <strong>{{approvedName}}</strong> has been
        approved for use. An email has been sent to <strong>{{emailAddress}}</strong> with instructions
        for how to use your Name Request.
      </p>

      <v-row no-gutters>
        <v-col cols="auto" class="pt-1 mr-2"><v-icon color="caution">mdi-alert</v-icon></v-col>
        <v-col cols="11" class="pt-1 pb-1" no-gutters>
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
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class NrApprovedGrayBox extends Vue {
  @Prop({ default: 'TBD' })
  readonly nrNum: string

  @Prop({ default: 'TBD' })
  readonly approvedName: string

  @Prop({ default: 'TBD' })
  readonly emailAddress: string

  @Prop({ default: false })
  readonly showRegisterButton: boolean

  @Prop({ default: false })
  readonly showIncorporateNowButton: boolean

  @Prop({ default: false })
  readonly showGoToSocietiesButton: boolean

  @Prop({ default: false })
  readonly disabled: boolean
}
</script>
