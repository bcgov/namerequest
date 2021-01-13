import { createLocalVue, mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import AnalyzePending from '@/components/new-request/analyze-pending.vue'
import newReqModule from '@/store/new-request-module'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

function setState () {
  newReqModule.mutateEntityType('CR')
  newReqModule.mutateLocation('BC')
  newReqModule.mutateRequestAction('NEW')
  newReqModule.mutateAnalyzePending(true)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved')
    }, 100)
  })
}

describe('analyze-pending.vue', () => {
  let wrapper: any
  beforeEach(async (done) => {
    await setState()
    wrapper = mount(AnalyzePending, {
      localVue,
      vuetify
    })
    done()
  })
  it('renders a spinner', () => {
    expect(wrapper.find('#analyze-pending-spinner').element).toBeTruthy()
  })
  it('renders a stop button', () => {
    expect(wrapper.find('#analyze-pending-stop-button').element).toBeTruthy()
  })
})
