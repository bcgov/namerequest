import { Component, Vue } from 'vue-property-decorator'
import { UpdateLdUser } from '@/plugins'
import AuthServices from '@/services/auth-services'

@Component({})
export class UpdateUserMixin extends Vue {
  /** Fetches the user's info and updates LaunchDarkly. */
  async updateUser (): Promise<any> {
    // don't run in Jest tests
    if (process.env.JEST_WORKER_ID) return

    try {
      const userInfo = await AuthServices.fetchUserInfo()
      if (userInfo) {
        await this.updateLaunchDarkly(userInfo)
      }
    } catch (err) {
      // just log the error -- no need to halt app
      console.log('Error updating user =', err) // eslint-disable-line no-console
    }
  }

  /** Updates Launch Darkly with current user info. */
  private async updateLaunchDarkly (userInfo: any): Promise<void> {
    // since username is unique, use it as the user key
    const key = userInfo.username as string
    const email = userInfo.contacts[0]?.email || userInfo.email as string
    const firstName = userInfo?.firstname as string
    const lastName = userInfo?.lastname as string
    // remove leading { and trailing } and tokenize string
    const custom: any = { roles: userInfo.roles?.slice(1, -1).split(',') }

    return UpdateLdUser(key, email, firstName, lastName, custom)
  }
}
