import { Component, Vue } from 'vue-property-decorator'
import axios from 'axios'

@Component
export default class OutputMixin extends Vue {
  /**
   * Downloads the specified Name Request output.
   * @param id The Name Request id.
   */
  async downloadOutputs (id: string): Promise<any> {
    try {
      const url = `namerequests/${id}/result`
      const headers = { 'Accept': 'application/pdf' }

      // show spinner since the network calls below can take a few seconds
      this.$root.$emit('showSpinner', true)

      // Request PDF for specified id
      const outputResponse: any = await axios.get(url, { headers: headers, responseType: 'blob' as 'json' })
      const blob = new Blob([outputResponse.data], { type: 'application/pdf' })

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob)
      } else {
        // for other browsers, create a link pointing to the ObjectURL containing the blob
        const url = window.URL.createObjectURL(blob)
        const a = window.document.createElement('a')
        window.document.body.appendChild(a)
        a.setAttribute('style', 'display: none')
        a.href = url
        a.download = ''
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
      }

      // clear spinner
      this.$root.$emit('showSpinner', false)
    } catch (error) {
      console.error('downloadOutputs() =', error) // eslint-disable-line no-console
      // clear spinner on error
      this.$root.$emit('showSpinner', false)
    }
  }
}
