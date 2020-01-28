import Vuetify from 'vuetify'
import Landing from '@/views/landing.vue'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import store from '@/store'
import Vue from 'vue'
import Vuex from 'vuex'
import sinon from 'sinon'
import newReqModule from '@/store/new-request-module'

describe('landing.vue', () => {
  let stub: any, wrapper: any

  beforeAll( () => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      searchShowStage: 'search'
    })
  })
  beforeEach(() => {
    let vuetify = new Vuetify()
    wrapper = shallowMount(Landing, {
      vuetify
    })
  })

  it('Landing initially displays only the New Request Tabs component', () => {
    expect(wrapper.contains('#new-req-existing-req-container')).toBe(true)
    expect(wrapper.contains('#analyze-pending-container')).toBe(false)
    expect(wrapper.contains('#analyze-results-container')).toBe(false)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('landing.vue', () => {
  let stub: any, wrapper: any

  beforeAll( () => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      searchShowStage: 'analyzing'
    })
  })
  beforeEach(() => {
    let vuetify = new Vuetify()
    wrapper = shallowMount(Landing, {
      vuetify
    })
  })

  it('When the state.searchShowStage key is set to "analysing", it shows only the pending container', () => {
    expect(wrapper.contains('#new-req-existing-req-container')).toBe(false)
    expect(wrapper.contains('#analyze-pending-container')).toBe(true)
    expect(wrapper.contains('#analyze-results-container')).toBe(false)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('landing.vue', () => {
  let stub: any, wrapper: any

  beforeAll( () => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      searchShowStage: 'results'
    })
  })
  beforeEach(() => {
    let vuetify = new Vuetify()
    wrapper = shallowMount(Landing, {
      vuetify
    })
  })

  it('When the state.searchShowStage key is set to "results", it shows only the results container', () => {
    expect(wrapper.contains('#new-req-existing-req-container')).toBe(false)
    expect(wrapper.contains('#nanalyze-pending-container')).toBe(false)
    expect(wrapper.contains('#analyze-results-container')).toBe(true)
  })

  afterAll(() => {
    stub.restore()
  })
})
