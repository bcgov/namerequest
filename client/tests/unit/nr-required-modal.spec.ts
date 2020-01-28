import Modal from '@/components/modals/nr-not-required.vue'
import { mount } from '@vue/test-utils'
import Vuetify from 'vuetify'

describe('nr-not-required.vue', () => {
  let wrapper: any

  beforeEach(() => {
    let vuetify = new Vuetify()
    wrapper = mount(Modal, {
      vuetify
    })
  })
  it('Shows the modal when the state is set and it displays the required info', async () => {
    wrapper.vm.showModal = true
    await wrapper.vm.$nextTick()
    expect(wrapper.contains('#nr-required-close-btn')).toBe(true)
    expect(wrapper.text().includes('You want a numbered company. The business does not need a name.')).toBe(true)
  })
  it('Closes the modal when the close button is pressed', async () => {
    let button = wrapper.find('.v-btn__content')
    button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.showModal).toBe(false)
  })
})