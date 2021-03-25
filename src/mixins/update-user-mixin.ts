import { Component, Vue } from 'vue-property-decorator'
import { updateLdUser } from '@/plugins'
import AuthServices from '@/services/auth.services'

@Component({})
export class UpdateUserMixin extends Vue {
  /** Fetches the user's info and updates Launch Darkly. */
  async updateUser (): Promise<any> {
    try {
      const userInfo = await AuthServices.fetchUserInfo()
      await this.updateLaunchDarkly(userInfo)
    } catch (err) {
      // just log the error -- no need to halt app
      console.log('Launch Darkly update error =', err) // eslint-disable-line no-console
    }
  }

  /** Updates Launch Darkly with current user info. */
  private async updateLaunchDarkly (userInfo: any): Promise<void> {
    // since username is unique, use it as the user key
    const key: string = userInfo.username
    const email: string = userInfo.contacts[0]?.email || userInfo.email
    const firstName: string = userInfo?.firstname
    const lastName: string = userInfo?.lastname
    // remove leading { and trailing } and tokenize string
    const custom: any = { roles: userInfo.roles?.slice(1, -1).split(',') }

    return updateLdUser(key, email, firstName, lastName, custom)
  }
}
