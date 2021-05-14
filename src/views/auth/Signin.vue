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
import { Action } from 'vuex-class'
import { getKeycloakRoles } from '@/plugins'
import SbcSignin from 'sbc-common-components/src/components/SbcSignin.vue'
import { NrAffiliationMixin, UpdateUserMixin } from '@/mixins'
import { ActionBindingIF } from '@/interfaces/store-interfaces'

/**
 * When the user clicks "Log in", they are are redirected to THIS page, which
 * renders the SbcSignin component that actually performs the signin process.
 * Note that the current state is NOT saved and restored - the user will lose
 * their current session data if they sign in mid-session.
 */
@Component({
  components: { SbcSignin }
})
export default class Signin extends Mixins(NrAffiliationMixin, UpdateUserMixin) {
  @Action setKeycloakRoles!: ActionBindingIF

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

    // now that user is logged in,
    // get and store keycloak roles
    try {
      const keycloakRoles = getKeycloakRoles()
      this.setKeycloakRoles(keycloakRoles)
      console.info('Got roles!') // eslint-disable-line no-console
    } catch (error) {
      // just log the error message
      console.log(`Did not get roles (${error.message})`) // eslint-disable-line no-console
    }

    await this.updateUser()

    // If there is stored NR data to process, create the affiliation.
    // If this succeeds, the user will be redirected to their Manage Businesses page.
    // If this fails, just fall through...
    const nr = JSON.parse(sessionStorage.getItem('NR_DATA'))
    if (nr) await this.createAffiliation(nr).catch()

    // go to main app page
    await this.$router.push('/')
  }
}
</script>
