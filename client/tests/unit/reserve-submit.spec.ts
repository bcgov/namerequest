import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('reserve-submit.vue', () => {
  it('renders a Send For Examination button', () => {
    let wrapper = shallowMount(ReserveSubmit, {
      vuetify,
      localVue,
      propsData: {
        setup: 'examine'
      }
    })
    expect(wrapper.html()).toContain('Send for Examination')
  })

  it('renders a conditional reserve button', () => {
    let wrapper = shallowMount(ReserveSubmit, {
      localVue,
      vuetify,
      propsData: {
        setup: 'consent'
      }
    })
    expect(wrapper.html()).toContain('Conditionally Reserve')
    expect(wrapper.html()).toContain(`color=\"red\"`)
  })

  it('renders a conditional reserve button', () => {
    let wrapper = shallowMount(ReserveSubmit, {
      localVue,
      vuetify,
      propsData: {
        setup: 'consent'
      }
    })
    expect(wrapper.html()).toContain('Conditionally Reserve')
    expect(wrapper.html()).toContain(`color=\"red\"`)
  })
})
