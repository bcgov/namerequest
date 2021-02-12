import { createLocalVue, mount } from '@vue/test-utils'
import LinkRow from '@/components/common/link-row.vue'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('link-row.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    wrapper = mount(LinkRow, {
      localVue,
      vuetify
    })
  })

  afterEach(() => {
  })

  it('Displays the required ui elements', () => {
    expect(wrapper.find(LinkRow).exists()).toBe(true)
    expect(wrapper.find('#link-row').element).toBeTruthy()
    expect(wrapper.find('#nr-required-activator').element).toBeTruthy()
    expect(wrapper.find('#name-build-link').element).toBeTruthy()
    expect(wrapper.find('#entity-selector-link').element).toBeTruthy()
  })

  it('Sets the modal visibility state to true when the nr-required-activator span is clicked', async () => {
    let activator = wrapper.find('#nr-required-activator')
    activator.trigger('click')
    await wrapper.vm.$nextTick()
    expect(newReqModule.nrRequiredModalVisible).toBe(true)
  })
})
