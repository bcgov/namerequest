import { createLocalVue } from '@vue/test-utils'
// import { mount, shallowMount } from '@vue/test-utils'
// import newReqModule from '@/store/new-request-module'
// import Search from '@/components/new-request/search.vue'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
localVue.use(Vuetify)
// const vuetify = new Vuetify()

describe('Search component', () => {
  it('is an empty test', () => {})
  // let wrapper: any

  // beforeEach(async (done) => {
  //   wrapper = shallowMount(Search, {
  //     localVue,
  //     vuetify
  //   })
  //   await wrapper.vm.$nextTick()
  //   done()
  // })

  // it('Displays the necessary UI components', () => {
  //   expect(wrapper.find('#entity-type-options-select').element).toBeTruthy()
  //   expect(wrapper.find('#name-input-component').element).toBeTruthy()
  // })
  // it('Initially sets the state for controlling both info modals visibility to false', () => {
  //   expect(newReqModule.nrRequiredModalVisible).toBe(false)
  //   expect(newReqModule.helpMeChooseModalVisible).toBe(false)
  // })
  // it(
  //   'Initially renders with the BC Corporation entity type as empty and the PickEntityOrConversion modal invisible',
  //   () => {
  //     expect(wrapper.vm.entity_type_cd).toBe('')
  //     expect(newReqModule.pickEntityModalVisible).toBe(false)
  //   })
  // it('Sets PickEntityModal visibility state to true when View All Entity Types is selected', async () => {
  //   wrapper.vm.entity_type_cd = 'INFO'
  //   await wrapper.vm.$nextTick()
  //   expect(newReqModule.pickEntityModalVisible).toBe(true)
  // })
})

describe('Select Company Type block', () => {
  // let wrapperFactory: any

  // beforeEach(() => {
  //   wrapperFactory = () => mount(Search, { vuetify })
  // })

  // it('renders the component properly', () => {
  //   // verify the component is rendered
  //   const wrapper = wrapperFactory()

  //   expect(wrapper.find('#search-container').exists()).toBe(true)
  //   wrapper.destroy()
  // })

  // it('renders the incorporate button correctly when numbered company is selected', async () => {
  //   const wrapper = wrapperFactory()
  //   await wrapper.find('#numbered-company-radio').setChecked()

  //   expect(wrapper.find('#action-now-button').exists()).toBe(true)
  //   wrapper.destroy()
  // })

  // it('emits event that named company is selected (show check this name button)', async () => {
  //   const wrapper = wrapperFactory()
  //   await wrapper.find('#named-company-radio').setChecked()

  //   expect(wrapper.vm.getSearchCompanyType).toBe('namedCompany')
  //   wrapper.destroy()
  // })
})
