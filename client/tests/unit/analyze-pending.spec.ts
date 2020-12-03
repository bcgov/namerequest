import { createLocalVue, mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import Comp from '@/components/new-request/analyze-pending.vue'
import newReqModule from '@/store/new-request-module'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

function setState (processed: number, total: number ) {
  newReqModule.updatePendingProcessed(processed)
  newReqModule.updatePendingTotal(total)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved')
    }, 100)
  })
}

describe('analyze-pending.vue', () => {
  const wrapper = mount(Comp, {
    localVue,
    vuetify
  })
  it('renders a spinner', () => {
    expect(wrapper.find('#analyze-pending-spinner').element).toBeTruthy()
  })
  it('renders a stop button', () => {
    expect(wrapper.find('#analyze-pending-stop-button').element).toBeTruthy()
  })
  it('shows the percentage completed', async () => {
    expect(wrapper.html()).toContain('0%')

    await setState(10, 0)
    expect(wrapper.html()).toContain('0%')

    await setState(10, 100)
    expect(wrapper.html()).toContain('10%')

    await setState(70, 99)
    expect(wrapper.html()).toContain('70%')
  })
})
