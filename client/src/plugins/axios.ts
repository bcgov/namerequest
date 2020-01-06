import axios from 'axios'

let baseURL = process.env.VUE_APP_API_URL

const Axios: any = axios.create({
  baseURL: baseURL + '/api/v1'
})

export const cancelToken: any = axios.CancelToken.source().token
export default Axios
