import Axios from 'axios'
import { addAxiosInterceptors } from 'sbc-common-components/src/util/interceptors'

const axios = addAxiosInterceptors(Axios.create())

export default class NamexServices {
//
// This file should contain calls to Namex API.
//
}
