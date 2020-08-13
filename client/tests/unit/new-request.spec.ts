import { createLocalVue, mount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Search from '@/components/new-request/search.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('search.vue', () => {
  let wrapper: any

  beforeEach(async (done) => {
    wrapper = mount(Search, {
      localVue,
      vuetify
    })
    await wrapper.vm.$nextTick()
    done()
  })

  it('Displays the necessary UI components', () => {
    expect(wrapper.find('#search-type-options-select').element).toBeTruthy()
    expect(wrapper.find('#location-options-select').element).toBeTruthy()
    expect(wrapper.find('#entity-type-options-select').element).toBeTruthy()
    expect(wrapper.find('#name-input-component').element).toBeTruthy()
  })
  it('Displays the two modal activators', () => {
    expect(wrapper.find('#help-me-choose-activator').element).toBeTruthy()
    expect(wrapper.find('#nr-required-activator').element).toBeTruthy()
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
  it(
    'Initially renders with the BC Corporation entity type pre-selected and the PickEntityOrConversion modal invisible',
    () => {
      expect(wrapper.vm.entity_type_cd).toBe('CR')
      expect(newReqModule.pickEntityModalVisible).toBe(false)
    })
  it('Sets PickEntityModal visibility state to true when View All Entity Types is selected', async () => {
    wrapper.vm.entity_type_cd = 'INFO'
    await wrapper.vm.$nextTick()
    expect(newReqModule.pickEntityModalVisible).toBe(true)
  })
})
