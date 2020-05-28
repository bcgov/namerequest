import Vuetify from 'vuetify'
import Landing from '@/views/landing.vue'
import AnalyzeResults from './mocks/analyze-results.vue'
import { mount, createLocalVue } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import LowerContainer from '@/components/lower-info-area/lower-container.vue'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

const stubs = {
  AnalyzeCharacters: true,
  AnalyzeResults,
  LowerContainer,
  Stats: true,
  quillEditor: true
}

describe('landing.vue', () => {
  let wrapper: any

  beforeAll(() => {
    newReqModule.mutateDisplayedComponent('Tabs')
  })
  beforeEach(() => {
    wrapper = mount(Landing, {
      stubs,
      localVue,
      vuetify
    })
  })

  it('Landing initially displays only the New Request Tabs component', () => {
    expect(wrapper.contains('#tabs-landing-comp')).toBe(true)
    expect(wrapper.contains('#analyze-pending-container')).toBe(false)
    expect(wrapper.contains('#analyze-results-container')).toBe(false)
  })
})

describe('landing.vue', () => {
  let wrapper: any

  beforeAll(() => {
    newReqModule.mutateDisplayedComponent('AnalyzePending')
  })
  beforeEach(() => {
    wrapper = mount(Landing, {
      stubs,
      localVue,
      vuetify
    })
  })

  it('When the state.searchShowStage key is set to "analysing", it shows only the pending container', () => {
    expect(wrapper.contains('#new-req-existing-req-container')).toBe(false)
    expect(wrapper.contains('#analyze-pending-container')).toBe(true)
    expect(wrapper.contains('#analyze-results-container')).toBe(false)
  })
})

describe('landing.vue', () => {
  let wrapper: any

  beforeEach(() => {
    newReqModule.mutateDisplayedComponent('AnalyzeResults')

    wrapper = mount(Landing, {
      localVue,
      stubs,
      vuetify
    })
  })

  it('When state.displayedComponent === "AnalyzeResults", it shows only the results container', async () => {
    await wrapper.vm.$nextTick()
    expect(wrapper.contains('#new-req-existing-req-container')).toBe(false)
    expect(wrapper.contains('#nanalyze-pending-container')).toBe(false)
    expect(wrapper.contains('#analyze-results-container')).toBe(true)
  })
})
