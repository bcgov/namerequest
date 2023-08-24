import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
import { getVuetify } from '@/plugins'
import { getVuexStore } from '@/store'
import PickRequestTypeDialog from '@/components/dialogs/pick-request-type.vue'
// import newReqModule from '@/store/new-request-module'

const vuetify = getVuetify()
const store = getVuexStore()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

describe('PickRequestTypeDialog', () => {
  it('renders the dialog when showModal is true', () => {
    const wrapper = shallowMount(PickRequestTypeDialog, {
      vuetify,
      store,
      computed: { showModal: () => true }
    })

    // verify dialog and title
    expect(wrapper.isVisible()).toBe(true)
    expect(wrapper.find('h4').text()).toBe('What would you like to do?')
    expect(wrapper.find('v-icon-stub').text()).toBe('mdi-close')

    // verify list items
    const texts = ['Start', 'Register', 'End', 'Change', 'Combine', 'Alter', 'Reactivate']
    const items = wrapper.findAll('.clickable-cell')
    expect(items.length).toBe(7)
    for (let i = 0; i < items.length; i++) {
      expect(items.at(i).text()).toContain(texts[i])
    }

    wrapper.destroy()
  })

  // it('When the modal visibility state key is set to false, the components internal getter is false', () => {
  //   newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = false
  //   expect(wrapper.vm.showModal).toBe(false)
  // })

  // it('and it does not show the modal', () => {
  //   expect(wrapper.find('#pick-request-type-modal-card').element).toBeFalsy()
  // })

  // it('When the modal visibility state key is set to true, expect the opposite', async () => {
  //   newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = true
  //   await wrapper.vm.$nextTick()
  //   expect(wrapper.find('#pick-request-type-modal-card').element).toBeTruthy()
  //   expect(wrapper.vm.showModal).toBe(true)
  // })

  // it('clicking an entity sets the entity_type_cd and closes the modal', async () => {
  //   wrapper.vm.showModal = true
  //   await wrapper.vm.$nextTick()
  //   let convertType = wrapper.find('#CNV')
  //   convertType.trigger('click')
  //   await wrapper.vm.$nextTick()
  //   expect(wrapper.vm.showModal).toBe(false)
  //   expect(newReqModule.request_action_cd).toBe('CNV')
  // })
})
