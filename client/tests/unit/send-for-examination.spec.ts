import SendForExamination from '@/components/new-request/submit-request/send-for-examination.vue'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()
const store = newReqModule

localVue.use(Vuetify)

describe('send-for-examination.vue', () => {
  describe('It initially renders correctly', () => {
    let wrapper

    beforeAll(async (done) => {
      store.mutateName('Test Name')
      wrapper = mount(SendForExamination, {
        localVue,
        vuetify
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('displays the first choice text field and designation select', () => {
      expect(wrapper.contains('#choice-1-text-field')).toBe(true)
      expect(wrapper.contains('#designation-1-select')).toBe(true)
    })
    it('sets the first name choice to the analyzed name', () => {
      expect(wrapper.vm.nameChoices.name1).toBe('Test Name')
    })
    it('initially validates choice 2 and choice 3', () => {
      expect(wrapper.vm.choice2Valid).toBe(true)
      expect(wrapper.vm.choice3Valid).toBe(true)
    })
    it('Initially renders the disabled continue button', () => {
      expect(wrapper.vm.choice1Valid).toBe(false)
      expect(wrapper.contains('#submit-continue-btn-disabled')).toBe(true)
      expect(wrapper.contains('#submit-continue-btn')).toBe(false)
    })
    it('calls validate when Continue button is pressed', async () => {
      wrapper.vm.validate = jest.fn()
      let btn = wrapper.find('#submit-continue-btn-disabled')
      btn.trigger('click')
      expect(wrapper.vm.validate).toHaveBeenCalled()
    })
    it('demonstrates correct validation logic when designation-1 is entered', async () => {
      store.mutateNameChoices({ key: 'designation1', value: 'inc' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.choice1Valid).toBe(true)
      expect(wrapper.contains('#submit-continue-btn-disabled')).toBe(false)
      expect(wrapper.contains('#submit-continue-btn')).toBe(true)
    })
    it('calls showNextComponent() when continue button is clicked and form is valid', async () => {
      store.mutateNameChoices({ key: 'designation1', value: 'inc' })
      await wrapper.vm.$nextTick()
      wrapper.vm.showNextTab = jest.fn()
      let btn = wrapper.find('#submit-continue-btn')
      btn.trigger('click')
      expect(wrapper.vm.showNextTab).toHaveBeenCalled()
    })
    it('detects when choice3 is made without choice2', async () => {
      store.mutateNameChoices({ key: 'name3', value: 'a great name' })
      store.mutateNameChoices({ key: 'designation3', value: 'a great name' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.choice3Valid).toBe(false)
      expect(wrapper.vm.choice2Valid).toBe(true)
    })
    it('detects when choice2 is made without a designation', async () => {
      store.mutateNameChoices({ key: 'name2', value: 'a great name' })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.choice2Valid).toBe(false)
    })
  })
})
