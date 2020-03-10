import ReserveSubmit from '@/components/new-request/reserve-submit'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'

const localVue = createLocalVue()

describe('reserve-submit.vue', () => {
  let vuetify = new Vuetify()
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
      vuetify,
      localVue,
      propsData: {
        setup: 'consent'
      }
    })
    expect(wrapper.html()).toContain('Conditionally Reserve')
    expect(wrapper.html()).toContain(`color=\"red\"`)
  })

  it('renders a conditional reserve button', () => {
    let wrapper = shallowMount(ReserveSubmit, {
      vuetify,
      localVue,
      propsData: {
        setup: 'consent'
      }
    })
    expect(wrapper.html()).toContain('Conditionally Reserve')
    expect(wrapper.html()).toContain(`color=\"red\"`)
  })
})
