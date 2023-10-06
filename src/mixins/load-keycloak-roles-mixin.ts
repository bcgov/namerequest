import { Component, Vue } from 'vue-property-decorator'
import { getKeycloakRoles } from '@/plugins'
import { Action } from 'vuex-class'

@Component({})
export class LoadKeycloakRolesMixin extends Vue {
  @Action setKeycloakRoles!: (val: string[]) => void
  @Action setIsAuthenticated!: (val: boolean) => void

  /** Gets and stores Keycloak roles. */
  loadKeycloakRoles (): void {
    try {
      const keycloakRoles = getKeycloakRoles()
      this.setIsAuthenticated(keycloakRoles.length > 0)
      this.setKeycloakRoles(keycloakRoles)
      console.info('Got roles!') // eslint-disable-line no-console
    } catch (err) {
      const error = err as Error
      // just log the error message
      console.log(`Did not get roles (${error.message})`) // eslint-disable-line no-console
    }
  }
}
