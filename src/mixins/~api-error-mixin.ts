import { Component, Vue } from 'vue-property-decorator'
import { AxiosError } from 'axios'

@Component({})
export class ApiErrorMixin extends Vue {
  private isAxiosError (err: AxiosError | Error): boolean {
    return (err as AxiosError).isAxiosError !== undefined
  }

  /**
   * Throws an error with error message extracted and formatted.
   * @param err error object from the catch statement
   * @param defaultMessage optional fallback message
   */
  async handleApiError (err: any, defaultMessage = ''): Promise<string> {
    if (this.isAxiosError(err)) {
      let message = ''
      const responseData = err?.response?.data
      const hasResponseData = !!responseData

      if (hasResponseData && responseData instanceof Blob) {
        // Handle any cases where the API error response is a Blob (eg, request for PDF receipt fails).
        const errorText = await responseData.text()
        const errorJson = JSON.parse(errorText)
        if (errorJson?.message) {
          message = `${err.toString()} [ ${errorJson.message} ]`
        }
      } else if (hasResponseData && responseData instanceof String) {
        // Handle any cases where the API error response is a String.
        message = `${err.toString()} [ ${responseData.toString()} ]`
      } else if (hasResponseData && responseData.message) {
        // Handle any cases where the API error response in an object (eg, { message: 'Ipsum lorem dolor' }).
        message += responseData.message
        message = `${err.toString()} [ ${responseData.message} ]`
      } else if (defaultMessage) {
        // Handle any other cases.
        message = `${err.toString()} [ ${defaultMessage} ]`
      } else {
        return err.toString()
      }

      // Replace line breaks with HTML line breaks.
      return message.replace(/(?:\r\n|\r|\n)/g, '<br>')
    } else {
      // Handle non-axios error (ie, probably a JS error).
      return (err?.toString() || defaultMessage)
    }
  }
}
