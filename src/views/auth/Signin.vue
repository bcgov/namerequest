<template>
  <SbcSignin
    :idpHint="idpHint"
    :redirectUrlLoginFail="redirectUrlLoginFail"
    :inAuth="false"
    @sync-user-profile-ready="onReady()"
  />
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import SbcSignin from 'sbc-common-components/src/components/SbcSignin.vue'
import { LoadKeycloakRolesMixin, NrAffiliationMixin, UpdateUserMixin } from '@/mixins'
import { CorpTypeCd } from '@bcrs-shared-components/corp-type-module'

/**
 * When the user clicks "Log in", they are are redirected to THIS page, which
 * renders the SbcSignin component that actually performs the signin process.
 * Note that the current state is NOT saved and restored - the user will lose
 * their current session data if they sign in mid-session.
 */
@Component({
  components: { SbcSignin }
})
export default class Signin extends Mixins(LoadKeycloakRolesMixin, NrAffiliationMixin, UpdateUserMixin) {
  /** The login method, which is passed in the signin route by the SBC Header. */
  @Prop({ default: 'bcsc' })
  readonly idpHint: string

  /** The URL to redirect to if signin failed: the NR URL. */
  get redirectUrlLoginFail (): string {
    return `${window.location.origin}${process.env.VUE_APP_PATH}`
  }

  /** Called after successful signin. */
  async onReady () {
    console.info('Keycloak session is ready') // eslint-disable-line no-console

    // now that the user is logged in, load Keycloak roles and update LaunchDarkly
    this.loadKeycloakRoles()
    await this.updateUser()

    // if there is stored NR data to process then affiliate it now
    const nr = JSON.parse(sessionStorage.getItem('NR_DATA'))
    if (nr) {
      await this.createAffiliation(nr)
      // clear NR data for next time
      sessionStorage.removeItem('NR_DATA')
    }

    // if there is stored legal type for an IA then incorporate it now
    const legaltype = sessionStorage.getItem('LEGAL_TYPE')
    if (legaltype) {
      try {
        await this.incorporateNow(legaltype as CorpTypeCd)
        // clear the legal type data
        sessionStorage.removeItem('LEGAL_TYPE')
      } catch (error) {
        console.error(error)
      }
    }

    // go to main app page
    await this.$router.push('/')
  }
}
</script>
