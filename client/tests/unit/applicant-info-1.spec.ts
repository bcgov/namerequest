import ApplicantInfo1 from '@/components/common/applicant-info-1.vue'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'
import $intJurisdictions from '@/store/list-data/intl-jurisdictions'
import $canJurisdictions from '@/store/list-data/canada-jurisdictions'

const store = newReqModule
const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('applicant-info-1.vue', () => {
  let wrapper

  beforeAll(async (done) => {
    wrapper = mount(ApplicantInfo1, {
      localVue,
      vuetify,
      mocks: {
        $canJurisdictions,
        $intJurisdictions
      }
    })
    await wrapper.vm.$nextTick()
    done()
  })
  it('renders the form', () => {
    expect(wrapper.find('#applicant-info-1-form').element).toBeTruthy()
  })
  it('Initially renders the disabled continue button', () => {
    expect(wrapper.find('#submit-continue-btn').classes().includes('v-btn--disabled')).toBeTruthy()
  })
})
