import { shallowMount } from '@vue/test-utils'
import AnalyzeResults from '@/components/new-request/analyze-results.vue'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'
import sinon from 'sinon'
import Vue from 'vue'

describe('analyze-results.vue, issue_type = add_descriptive', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        status: 'Further Action Required',
        issues: [
          {
            consenting_body: null,
            issue_type: 'add_descriptive',
            name_actions: [
              {
                type: 'add_word_brackets',
                position: 'end',
                message: 'Add a Business Category Word Here'
              }
            ],
            designations: null,
            descriptive_words: [
              {
                category: 'Automotive',
                word_list: ['Car Sales', 'Car Leasing', 'Used Cars', 'Car Repair', 'Mechanics']
              },
              {
                category: 'Construction',
                word_list: ['Building', 'Contracting', 'Development', 'Houses', 'Renovations']
              },
            ],
            show_examination_button: false,
            conflicts: null,
            word: null,
            word_index: null,
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for an add_descriptive issue_type', () => {
    expect(wrapper.text().includes('Add a word to the end of your name that describes the business')).toBe(true)
  })
  it('Renders the list of categories but not words', () => {
    expect(wrapper.text().includes('Automotive')).toBe(true)
    expect(wrapper.text().includes('Construction')).toBe(true)
    expect(wrapper.text().includes('Used Cars')).toBe(false)
  })
  it('Renders the list of words when the category is set', async () => {
    wrapper.setData({
      openedCategory: 'Automotive'
    })
    await Vue.nextTick()
    expect(wrapper.text().includes('Used Cars')).toBe(true)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('analyze-results.vue, issue_type = add_distinctive', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        'status': 'Further Action Required',
        'issues': [
          {
            'consenting_body': null,
            'issue_type': 'add_distinctive',
            'name_actions': [
              {
                'type': 'add_word_brackets',
                'position': 'start',
                'message': 'Add a Word Here'
              }
            ],
            'designations': null,
            'descriptive_words': null,
            'show_examination_button': false,
            'conflicts': null,
            'word': null,
            'word_index': null
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for an add_distinctive issue_type', () => {
    expect(wrapper.html().includes('Requires a word at the beginning of your name that sets it apart')).toBe(true)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('analyze-results.vue, issue_type = unclassified_word', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        'status': 'Further Action Required',
        'issues': [
          {
            'consenting_body': null,
            'issue_type': 'unclassified_word',
            'name_actions': [
              {
                'type': 'highlight'
              },
              {
                'type': 'strike'
              }
            ],
            'descriptive_words': null,
            'designations': null,
            'show_examination_button': true,
            'conflicts': null,
            'word': 'word',
            'word_index': 1
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for an unclassified_word issue_type', () => {
    expect(wrapper.html().includes('You can remove or replace any unknown words and try your search again')).toBe(true)
  })
  it('shows the send to examination button', () => {
    expect(wrapper.contains('#send-to-examination-btn')).toBe(true)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('analyze-results.vue, issue_type = word_to_avoid', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        'status': 'Further Action Required',
        'issues': [
          {
            'consenting_body': null,
            'issue_type': 'word_to_avoid',
            'name_actions': [
              {
                'type': 'strike'
              }
            ],
            'descriptive_words': null,
            'designations': null,
            'show_examination_button': false,
            'conflicts': [],
            'word': 'Walmart',
            'word_index': 1
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for a word_to_avoid issue_type', () => {
    expect(wrapper.html().includes('Replace or remove the word <b>“Walmart”</b> from your name')).toBe(true)
  })
  it('does not show the send to examination button', () => {
    expect(wrapper.contains('#send-to-examination-btn')).toBe(false)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('analyze-results.vue, issue_type = requires_consent', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        'status': 'May be Approved With Consent',
        'issues': [
          {
            'consenting_body': {
              'name': 'Association of Professional Engineers of BC',
              'email': 'email@engineer.ca'
            },
            'issue_type': 'consent_required',
            'word': 'Engineering',
            'word_index': 1,
            'show_examination_button': false,
            'designations': null,
            'name_actions': [
              {
                'type': 'highlight'
              }
            ]
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for an requires_consent issue_type', () => {
    expect(wrapper.text().includes('May be Approved With Consent')).toBe(true)
  })
  it('Shows the body from which consent is required', () => {
    expect(wrapper.text().includes('Association of Professional Engineers of BC')).toBe(true)
  })
  it('does not show the send to examination button', () => {
    expect(wrapper.contains('#send-to-examination-btn')).toBe(false)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('analyze-results.vue, issue_type = wrong_designation', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        'status': 'Further Action Required',
        'issues': [
          {
            'consenting_body': null,
            'issue_type': 'wrong_designation',
            'word': 'Credit Union',
            'word_index': 2,
            'show_examination_button': false,
            'designations': ['inc', 'incorporated'],
            'name_actions': [
              {
                'type': 'highlight',
              }
            ]
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for a wrong_designation issue_type', () => {
    expect(wrapper.html().includes('<b>Credit Union</b> designation cannot be used with the selected')).toBe(true)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('analyze-results.vue, issue_type = corp_conflict', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        'status': 'Further Action Required',
        'issues': [
          {
            'consenting_body': null,
            'issue_type': 'corp_conflict',
            'word': 'Test',
            'word_index': 1,
            'show_examination_button': false,
            'conflicts': [
              {
                'name': `Test1 Enterprises Ltd`,
                'date': '12/21/1988'
              },
              {
                'name': `Test2 Development Ltd`,
                'date': '2/14/2004'
              }
            ],
            'descriptive_words': null,
            'designations': null,
            'name_actions': [
              {
                'type': 'strike',
              },
              {
                'type': 'add_word_brackets',
                'position': 'start',
                'message': 'Add a Word Here'
              }
            ]
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for a corp_conflict issue_type', () => {
    expect(wrapper.text().includes('Too Similar to an Existing Name')).toBe(true)
  })
  it('Lists the Conflicts', () => {
    expect(wrapper.text().includes('Test1 Enterprises Ltd')).toBe(true)
    expect(wrapper.text().includes('12/21/1988')).toBe(true)
    expect(wrapper.text().includes('Test2 Development Ltd')).toBe(true)
    expect(wrapper.text().includes('2/14/2004')).toBe(true)
  })

  afterAll(() => {
    stub.restore()
  })
})

describe('analyze-results.vue, issue_type = excess_words', () => {
  let stub: any, wrapper: any

  beforeAll(() => {
    stub = sinon.stub(newReqModule.store.state, 'newRequestModule').value({
      ...newReqModule.store.state.newRequestModule,
      analysisJSON: {
        'status': 'Further Action Required',
        'issues': [
          {
            'consenting_body': null,
            'issue_type': 'excess_words',
            'name_actions': null,
            'descriptive_words': null,
            'designations': null,
            'show_examination_button': true,
            'conflicts': null,
            'word': null,
            'word_index': null
          }
        ]
      }
    })
    let vuetify = new Vuetify()
    wrapper = shallowMount(AnalyzeResults, {
      vuetify
    })
  })

  it('Renders the results for an excess_words issue_type', () => {
    expect(wrapper.text().includes('Names with more than 4 words cannot be auto-approved')).toBe(true)
  })
  it('shows the send to examination button', () => {
    expect(wrapper.contains('#send-to-examination-btn')).toBe(true)
  })

  afterAll(() => {
    stub.restore()
  })
})
