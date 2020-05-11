import axios from 'axios'

let baseURL = process.env.VUE_APP_API_URL || process.env.APP_API_URL
baseURL = baseURL + '/api/v1'

const Axios: any = axios.create({
  baseURL
})

export default Axios
