import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'
import errorModule from '@/modules/error'
import { ErrorI } from '@/modules/error/store/actions'

@Component
export default class OutputMixin extends Vue {
  /**
   * Downloads the specified Name Request output.
   * @param id The Name Request id.
   */
  async downloadOutputs (id: string): Promise<void> {
    try {
      const url = `namerequests/${id}/result`
      const headers = { 'Accept': 'application/pdf' }

      // show spinner since the network calls below can take a few seconds
      this.$root.$emit('showSpinner', true)

      // Request PDF for specified id
      const response: any = await axios.get(url, { headers: headers, responseType: 'blob' as 'json' })

      // Create a new blob object with mime-type explicitly set, otherwise only Chrome works
      const blob = new Blob([response.data], { type: 'application/pdf' })

      // IE doesn't allow using a blob object directly as link href, so use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob)
      } else {
        // for other browsers, create a link pointing to the ObjectURL containing the blob
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        window.document.body.appendChild(a)
        a.setAttribute('style', 'display: none')
        a.href = url
        a.download = 'Name Request Results'
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }

      // clear spinner
      this.$root.$emit('showSpinner', false)
    } catch (error) {
      console.error('downloadOutputs() =', error) // eslint-disable-line no-console

      await errorModule.setAppError(
        { id: 'download-pdf-error', error: 'Could not download PDF' } as ErrorI
      )

      // clear spinner on error
      this.$root.$emit('showSpinner', false)
    }
  }
}
