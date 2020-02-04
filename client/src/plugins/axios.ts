import axios from 'axios'

let baseURL = function () {
  if (process.env.NODE_ENV === 'development') {
    return process.env.VUE_APP_API_URL_MOCK
  }
  return process.env.VUE_APP_API_URL
}

const Axios: any = axios.create({
  baseURL: baseURL() + '/api/v1'
})

export const cancelToken: any = axios.CancelToken.source().token
export default Axios
