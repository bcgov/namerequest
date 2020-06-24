import { createLocalVue, mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import Comp from '@/components/new-request/analyze-pending.vue'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

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
})
