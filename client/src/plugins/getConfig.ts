import axios from 'axios'

// Detailed commentary on how this works @ github.com/bcgov/business-filings-ui/utils/fetch-config.ts
export function getConfig (): Promise<void> {
  return new Promise(async resolve => {
    const { origin } = window.location
    const { BASE_URL } = process.env

    let response = await axios.get(origin + BASE_URL + 'config/configuration.json', {
      headers: {
        'Accept': 'application/json',
        'ResponseType': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })
    const baseURL = response.data[0]['URL'] + '/api/v1'
    axios.defaults.baseURL = baseURL
    resolve()
  })
}
