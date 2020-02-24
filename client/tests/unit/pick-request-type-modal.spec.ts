import Modal from '@/components/modals/pick-request-type.vue'
import newReqModule from '@/store/new-request-module'
import { mount, createLocalVue } from '@vue/test-utils'
import Vuetify from 'vuetify'

const localVue = createLocalVue()

describe('pick-request-type.vue', (): void => {
  let wrapper: any, vuetify: any
  vuetify = new Vuetify()
  localVue.use(Vuetify)

  beforeEach(() => {
    wrapper = mount(Modal, {
      localVue,
      vuetify
    })
  })

  it('When the modal visibility state key is set to false, the components internal getter is false', () => {
    newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = false
    expect(wrapper.vm.showModal).toBe(false)
  })

  it('and it does not show the modal', () => {
    expect(wrapper.contains('#pick-request-type-modal-card')).toBe(false)
  })

  it('When the modal visibility state key is set to true, expect the opposite', async () => {
    newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = true
    await wrapper.vm.$nextTick()
    expect(wrapper.contains('#pick-request-type-modal-card')).toBe(true)
    expect(wrapper.vm.showModal).toBe(true)
  })
  it('displays the extended request type chart', async () => {
    newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = true
    await wrapper.vm.$nextTick()
    expect(wrapper.text().includes('Convert to Another Structure')).toBe(true)
  })
  it('clicking an entity sets the entityType and closes the modal', async () => {
    wrapper.vm.showModal = true
    await wrapper.vm.$nextTick()
    let convertType = wrapper.find('#CNV')
    convertType.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showModal).toBe(false)
    expect(newReqModule.requestType).toBe('CNV')
    return
  })
})
