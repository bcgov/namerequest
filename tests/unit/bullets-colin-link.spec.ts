import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import BulletsColinLink from '@/components/common/bullets-colin-link.vue'

Vue.use(Vuetify)
const vuetify = new Vuetify({})

describe('Time Limit Extension component', () => {
  let wrapperFactory: any

  beforeEach(() => {
    wrapperFactory = () => mount(BulletsColinLink, { vuetify })
  })

  it('renders the component properly', () => {
    // verify the component is rendered
    const wrapper = wrapperFactory()

    expect(wrapper.find('#bullets-colin-link').exists()).toBe(true)
    wrapper.destroy()
  })

  it('renders the incorporate button correctly when numbered company is selected', async () => {
    const wrapper = wrapperFactory()
    await wrapper.find('#numbered-company-radio').setChecked()

    expect(wrapper.find('#incorporate-now-button').exists()).toBe(true)
    wrapper.destroy()
  })

  it('emits event that named company is selected (show check this name button)', async () => {
    const wrapper = wrapperFactory()
    await wrapper.find('#named-company-radio').setChecked()

    expect(wrapper.emitted('radioButtonChange').pop()[0]).toEqual('namedCompany')
    wrapper.destroy()
  })
})