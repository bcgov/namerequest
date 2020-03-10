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
    expect(wrapper.contains('#analyze-pending-spinner')).toBe(true)
  })
  it('renders a stop button', () => {
    expect(wrapper.contains('#analyze-pending-stop-button')).toBe(true)
  })
})
