import ApplicantInfo1 from '@/components/common/applicant-info-1.vue'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import { CanJurisdictions, IntlJurisdictions } from '@/list-data'

// Prevent the warning "[Vuetify] Unable to locate target [data-app]"
document.body.setAttribute('data-app', 'true')

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('applicant-info-1', () => {
  it('is an empty test', () => {})
  // let wrapper

  // beforeAll(async (done) => {
  //   wrapper = mount(ApplicantInfo1, {
  //     localVue,
  //     vuetify,
  //     mocks: {
  //       $canJurisdictions: CanJurisdictions,
  //       $intlJurisdictions: IntlJurisdictions
  //     }
  //   })
  //   await wrapper.vm.$nextTick()
  //   done()
  // })
  // it('renders the form', () => {
  //   expect(wrapper.find('#applicant-info-1-form').element).toBeTruthy()
  // })
  // it('Initially renders the enabled continue button', () => {
  //   expect(wrapper.find('.submit-continue-btn').classes().includes('v-btn')).toBeTruthy()
  // })
})
