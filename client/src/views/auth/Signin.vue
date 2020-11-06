<template>
  <sbc-signin
    :idp-hint="idpHint"
    :redirect-url-login-fail="redirectUrlLoginFail"
    @sync-user-profile-ready="onReady()"
  />
</template>

<script lang="ts">
// Libraries
import { Component, Prop, Mixins } from 'vue-property-decorator'

// Components
// @ts-ignore
import SbcSignin from 'sbc-common-components/src/components/SbcSignin'

// Mixins
import NrAffiliationMixin from '@/components/mixins/nr-affiliation-mixin'

@Component({
  components: {
    SbcSignin
  }
})
export default class Signin extends Mixins(NrAffiliationMixin) {
  @Prop({ default: 'bcsc' }) idpHint: string
  @Prop({ default: '' }) redirectUrl: string
  @Prop({ default: '' }) redirectUrlLoginFail: string

  /** called when keycloak session is ready. */
  private async onReady () {
    if (this.redirectUrl) {
      // If there is stored NR data to process, create the affiliation OR navigate to redirectUrl
      const nr = JSON.parse(sessionStorage.getItem('NR_DATA'))
      nr ? await this.createAffiliation(nr) : await this.$router.push(this.redirectUrl)
    } else {
      console.error('Signin page missing redirect param') // eslint-disable-line no-console
      // redirect to business home page
      const businessUrl = sessionStorage.getItem('BUSINESSES_URL')
      // assume business URL is always reachable
      window.location.assign(businessUrl)
    }
  }
}
</script>
