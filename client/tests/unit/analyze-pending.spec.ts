import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Comp from '@/components/new-request/analyze-pending.vue'

describe('analyze-pending.vue', () => {
  const wrapper = mount(Comp)
  it('renders a spinner', () => {
    expect(wrapper.contains('#analyze-pending-spinner')).toBe(true)
  })
  it('renders a stop button', () => {
    expect(wrapper.contains('#analyze-pending-stop-button')).toBe(true)
  })
})
