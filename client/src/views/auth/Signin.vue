<template>
  <sbc-signin
    :idp-hint="idpHint"
    :redirect-url-login-fail="redirectUrlLoginFail"
    @sync-user-profile-ready="onReady()"
  />
</template>

<script lang="ts">
// Libraries
import { Component, Vue, Prop } from 'vue-property-decorator'

// Components
// @ts-ignore
import SbcSignin from 'sbc-common-components/src/components/SbcSignin'

@Component({
  components: {
    SbcSignin
  }
})
export default class Signin extends Vue {
  @Prop({ default: 'bcsc' }) idpHint: string
  @Prop({ default: '' }) redirectUrl: string
  @Prop({ default: '' }) redirectUrlLoginFail: string

  /** called when keycloak session is ready. */
  private async onReady () {
    if (this.redirectUrl) {
      // navigate to the route we originally came from
      await this.$router.push(this.redirectUrl)
    } else {
      console.error('Signin page missing redirect param') // eslint-disable-line no-console
      // redirect to Name Request home page
      const nameRequestUrl = sessionStorage.getItem('Name_Request')
      // assume Name Request URL is always reachable
      window.location.assign(nameRequestUrl)
    }
  }
}
</script>
