import { createLocalVue, mount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Search from '@/components/new-request/search'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('search.vue', () => {
  let wrapper: any

  beforeEach( async (done) => {
    wrapper = mount(Search, {
      localVue,
      vuetify
     })
    await wrapper.vm.$nextTick()
    done()
  })

  it('Displays the necessary UI components', () => {
    expect(wrapper.contains('#search-type-options-select')).toBe(true)
    expect(wrapper.contains('#location-options-select')).toBe(true)
    expect(wrapper.contains('#entity-type-options-select')).toBe(true)
    expect(wrapper.contains('#name-input-component')).toBe(true)
  })
  it('Displays the two modal activators', () => {
    expect(wrapper.contains('#help-me-choose-activator')).toBe(true)
    expect(wrapper.contains('#nr-required-activator')).toBe(true)
  })
  it('Initially sets the state for controlling both info modals visibility to false', () => {
    expect(newReqModule.nrRequiredModalVisible).toBe(false)
    expect(newReqModule.helpMeChooseModalVisible).toBe(false)
  })
  it('Sets the modal visibility state to true when the nr-required-activator span is clicked', async () => {
    let activator = wrapper.find('#nr-required-activator')
    activator.trigger('click')
    await wrapper.vm.$nextTick()
    expect(newReqModule.nrRequiredModalVisible).toBe(true)
  })
  it('Initially renders with the BC Corporation entity type pre-selected and the PickEntity modal invisible', () => {
    expect(wrapper.vm.entityType).toBe('CR')
    expect(newReqModule.pickEntityModalVisible).toBe(false)
  })
  it('Sets PickEntityModal visibility state to true when View All Business Structures is selected', async () => {
    wrapper.vm.entityType = 'all'
    await wrapper.vm.$nextTick()
    expect(newReqModule.pickEntityModalVisible).toBe(true)
  })
})
