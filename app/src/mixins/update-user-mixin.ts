import { Component, Vue } from 'vue-property-decorator'
import { getKeycloakRoles, UpdateLdUser } from '@/plugins'
import AuthServices from '@/services/auth-services'
import { SessionStorageKeys } from 'sbc-common-components/src/util/constants'

@Component({})
export class UpdateUserMixin extends Vue {
  /** Fetches the user and org info and updates LaunchDarkly. */
  async updateUser (): Promise<any> {
    // don't run in Jest tests
    if (process.env.JEST_WORKER_ID) return

    try {
      // get user info
      const userInfo = await AuthServices.fetchUserInfo().catch(() => null)

      // get user roles
      const userRoles = getKeycloakRoles()

      // get organization info
      const currentAccount = sessionStorage.getItem(SessionStorageKeys.CurrentAccount)
      const accountId = currentAccount && JSON.parse(currentAccount)?.id
      const orgInfo = accountId && await AuthServices.fetchOrgInfo(accountId).catch(() => null)

      await this.updateLaunchDarkly(userInfo, userRoles, orgInfo)
    } catch (err) {
      // just log the error -- no need to halt app
      console.log('Error updating user =', err) // eslint-disable-line no-console
    }
  }

  /** Updates Launch Darkly with current user and org contexts. */
  private async updateLaunchDarkly (userInfo = null, userRoles = null, orgInfo = null): Promise<void> {
    const userContext = userInfo && {
      kind: 'user',
      // since username is unique, use it as the user key
      key: userInfo.username,
      // if we can't get contact email then use user email
      email: userInfo.contacts[0]?.email || userInfo.email,
      firstName: userInfo?.firstname,
      lastName: userInfo?.lastname,
      roles: userRoles || []
    }

    const orgContext = orgInfo && {
      kind: 'organization',
      key: orgInfo.id.toString(),
      name: orgInfo.name
    }

    return UpdateLdUser(userContext, orgContext)
  }
}
