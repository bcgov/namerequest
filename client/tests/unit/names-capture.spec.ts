import NamesCapture from '@/components/common/names-capture.vue'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import store from '@/store/new-request-module'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('send-for-examination.vue', () => {
  describe('It initially renders correctly', () => {
    let wrapper

    beforeAll(async (done) => {
      store.mutateName('Test Name')
      wrapper = mount(NamesCapture, {
        localVue,
        vuetify
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('displays the first choice text field and designation select', () => {
      expect(wrapper.find('#choice-1-text-field').element).toBeTruthy()
      expect(wrapper.find('#designation-1-select').element).toBeTruthy()
    })
    it('sets the first name choice to the analyzed name', () => {
      expect(wrapper.vm.nameChoices.name1).toBe('Test Name')
    })
    it('Initially renders the disabled continue button', () => {
      expect(wrapper.vm.isValid).toBe(false)
      expect(wrapper.find('#submit-continue-btn-disabled').element).toBeTruthy()
      expect(wrapper.find('#submit-continue-btn').element).toBeFalsy()
    })
    it('calls validate when Continue button is pressed', async () => {
      wrapper.vm.validate = jest.fn()
      let btn = wrapper.find('#submit-continue-btn-disabled')
      btn.trigger('click')
      expect(wrapper.vm.validate).toHaveBeenCalled()
    })
    it('demonstrates correct validation logic when designation-1 is entered', async () => {
      store.mutateNameChoices({ key: 'name1', value: 'A Really Nice Name' })
      store.mutateNameChoices({ key: 'designation1', value: 'INC.' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValid).toBe(true)
      expect(wrapper.find('#submit-continue-btn-disabled').element).toBeFalsy()
      expect(wrapper.find('#submit-continue-btn').element).toBeTruthy()
    })
    it('calls showNextComponent() when continue button is clicked and form is valid', async () => {
      store.mutateNameChoicesToInitialState()
      store.mutateNameChoices({ key: 'name1', value: 'LALA NAME' })
      store.mutateNameChoices({ key: 'designation1', value: 'INC.' })
      wrapper.vm.validate = jest.fn()
      await wrapper.vm.$nextTick()
      let btn = wrapper.find('#submit-continue-btn')
      btn.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValid).toBeTruthy()
      expect(wrapper.vm.validate).toHaveBeenCalled()
    })
    it('detects when choice3 is made without choice2', async () => {
      store.mutateNameChoices({ key: 'name1', value: 'a great name' })
      store.mutateNameChoices({ key: 'designation1', value: 'LTD.' })
      store.mutateNameChoices({ key: 'name2', value: 'a great name' })
      store.mutateNameChoices({ key: 'designation2', value: 'LTD.' })
      store.mutateNameChoices({ key: 'name3', value: 'a great name' })
      store.mutateNameChoices({ key: 'designation3', value: '' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValid).toBe(false)
      expect(wrapper.vm.messages.des3).toBe('Please choose a designation')
    })
    it('detects when choice2 is made without a designation', async () => {
      store.mutateNameChoices({ key: 'name2', value: 'a great name' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.isValid).toBe(false)
    })
  })
})
