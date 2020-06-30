import Modal from '@/components/modals/pick-request-type.vue'
import newReqModule from '@/store/new-request-module'
import { mount, createLocalVue } from '@vue/test-utils'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('pick-request-type.vue', (): void => {
  let wrapper: any

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
    expect(wrapper.find('#pick-request-type-modal-card').element).toBeFalsy()
  })

  it('When the modal visibility state key is set to true, expect the opposite', async () => {
    newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#pick-request-type-modal-card').element).toBeTruthy()
    expect(wrapper.vm.showModal).toBe(true)
  })
  it('clicking an entity sets the entityType and closes the modal', async () => {
    wrapper.vm.showModal = true
    await wrapper.vm.$nextTick()
    let convertType = wrapper.find('#CNV')
    convertType.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showModal).toBe(false)
    expect(newReqModule.requestAction).toBe('CNV')
    return
  })
})
