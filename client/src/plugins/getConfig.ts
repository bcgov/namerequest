import axios, { AxiosInstance } from 'axios'

// Detailed commentary on how this works @ github.com/bcgov/business-filings-ui/utils/fetch-config.ts
export async function getConfig (): Promise<void> {
  const { BASE_URL } = process.env
  const { origin } = window.location
  const configURL = origin + BASE_URL + 'config/configuration.json'
  const headers = {
    'Accept': 'application/json',
    'ResponseType': 'application/json',
    'Cache-Control': 'no-cache'
  }

  let response = await axios.get(configURL, { headers })
  let configJSON = response.data[0]
  let baseURL = configJSON['URL']
  baseURL = baseURL + '/api/v1'
  sessionStorage.setItem('BASE_URL', baseURL)

  return Promise.resolve()
}
