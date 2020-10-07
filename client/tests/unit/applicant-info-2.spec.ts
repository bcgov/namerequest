import ApplicantInfo2 from '@/components/common/applicant-info-2.vue'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import module from '@/store/new-request-module'
import Vuetify from 'vuetify'
import Vuex from 'vuex'

const localVue = createLocalVue()
const vuetify = new Vuetify()
localVue.use(Vuetify)

describe('It initially renders correctly', () => {
  let wrapper: any

  beforeEach(async (done) => {
    wrapper = mount(ApplicantInfo2, {
      localVue,
      vuetify
    })
    await wrapper.vm.$nextTick()
    done()
  })
  it('checks the corpNum against the appropriate database given the setup: BC location', async () => {
    const mrasJurisdictions = ['Alberta', 'Saskatchewan', 'Manitoba']
    const mrasActions = []
    function setStore (jurisdiction, action) {
      module.mutateNRData({ key: 'xproJurisdiction', value: 'Alberta' })
    }
  })
})
