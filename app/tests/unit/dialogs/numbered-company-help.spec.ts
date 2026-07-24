import Vuetify from 'vuetify'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import NumberedCompanyHelpDialog from '@/components/dialogs/numbered-company-help.vue'
import { useStore } from '@/store'

const vuetify = new Vuetify()

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

setActivePinia(createPinia())
const store = useStore()

// NB: store state is set before mounting because pinia -> component reactivity
// is not available in this test environment (pinia is externalized by vitest)
describe('NumberedCompanyHelpDialog', () => {
  afterEach(() => {
    store.setNumberedCompanyHelpModalVisible(false)
  })

  it('is hidden when the state is not set', () => {
    const wrapper = mount(NumberedCompanyHelpDialog, { vuetify })

    expect(wrapper.vm.showModal).toBe(false)
    expect(wrapper.find('#numbered-company-help-close-btn').exists()).toBe(false)

    wrapper.destroy()
  })

  it('shows the modal when the state is set and displays the placeholder info', () => {
    store.setNumberedCompanyHelpModalVisible(true)
    const wrapper = mount(NumberedCompanyHelpDialog, { vuetify })

    expect(wrapper.vm.showModal).toBe(true)
    expect(wrapper.text()).toContain('Help me Choose')
    expect(wrapper.text()).toContain(
      'Information to help you choose between Corporate Online and the new BC Business Registry'
    )
    expect(wrapper.find('#numbered-company-help-close-btn').exists()).toBe(true)

    wrapper.destroy()
  })

  it('closes the modal when the close button is pressed', async () => {
    store.setNumberedCompanyHelpModalVisible(true)
    const wrapper = mount(NumberedCompanyHelpDialog, { vuetify })
    expect(wrapper.vm.showModal).toBe(true)

    await wrapper.find('#numbered-company-help-close-btn').trigger('click')

    expect(store.getNumberedCompanyHelpModalVisible).toBe(false)

    wrapper.destroy()
  })
})
