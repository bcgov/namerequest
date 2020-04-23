import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import NameInput from '@/components/new-request/name-input.vue'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('name-input.vue', () => {
  let wrapper: any

  beforeEach(async () => {
    wrapper = mount(NameInput, {
      localVue,
      vuetify
    })
    await wrapper.vm.$nextTick()
    wrapper.vm.clearErrors()
  })

  afterEach(() => {
    newReqModule.mutateEntityType('CR')
    newReqModule.mutateRequestAction('NEW')
    newReqModule.mutateName('')
  })

  it('Displays the required ui elements', () => {
    expect(wrapper.contains('#name-input-text-field')).toBe(true)
    expect(wrapper.contains('#name-input-icon')).toBe(true)
  })
  it('Resists submitting when the entity type is set to "INFO" and detects the correct error type', async () => {
    newReqModule.mutateEntityType('INFO')
    newReqModule.mutateRequestAction('NEW')
    wrapper.vm.nameSearch = 'test'
    await wrapper.vm.$nextTick()

    expect(newReqModule.displayedComponent).toBe('Tabs')
  })
  it('Resists submission when the request type is set to "all" and detects the correct error type', async () => {
    newReqModule.store.state.newRequestModule.entityType = 'CR'
    newReqModule.store.state.newRequestModule.requestAction = 'INFO'
    wrapper.vm.nameSearch = 'test'
    await wrapper.vm.$nextTick()

    let button = wrapper.find('#name-input-icon')
    button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(newReqModule.displayedComponent).toBe('Tabs')
    expect(wrapper.vm.errors).toStrictEqual(['requestAction'])
  })
  it('Resists submission when there is no name entered and detects the correct error type', async () => {
    newReqModule.mutateEntityType('CR')
    newReqModule.mutateRequestAction('CNV')

    let button = wrapper.find('#name-input-icon')
    button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(newReqModule.displayedComponent).toBe('Tabs')
    expect(newReqModule.errors).toEqual(['name'])
  })
  it('Resists submission when the name entered is too short and detects the correct error type', async () => {
    wrapper.vm.nameSearch = 'ab'
    let button = wrapper.find('#name-input-icon')
    button.trigger('click')
    await wrapper.vm.$nextTick()
    expect(newReqModule.displayedComponent).toBe('Tabs')
    expect(wrapper.vm.errors).toStrictEqual(['length'])
  })
})
