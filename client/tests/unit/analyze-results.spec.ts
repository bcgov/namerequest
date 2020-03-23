import AnalyzeResults from '@/components/new-request/analyze-results'
import NameWordRenderer from '@/components/new-request/analyzed-name-word-renderer'
import ReserveSubmit from '@/components/new-request/reserve-submit.vue'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()
const stubs = [ 'ReserveSubmit', 'NameWordRenderer', 'NameInput' ]

localVue.use(Vuetify)

describe('analyze-results.vue', () => {
  describe('add_distinctive', () => {
    let wrapper: any

    beforeAll( async (done) => {
      newReqModule.mutateAnalysisJSON({
        "header": "Further Action Required",
        "issues": [
          {
            "issue_type": "add_distinctive",
            "line1": "Requires a word at the beggining of your name that sets it apart.",
            "line2": "",
            "name_actions": [
              {
                "index": 0,
                "message": "Add a Word Here",
                "position": "start",
                "type": "brackets",
                "word": "Action"
              }
            ],
            "setup": [
              {
                "button": "",
                "checkbox": "",
                "header": "Helpful Hint",
                "line1": "Some words that can set your name apart include an individual\u0027s name or intials; ageographic location; a colour; a coined, made-up word; or an acronym.",
                "line2": ""
              }
            ],
            "show_examination_button": false,
            "show_reserve_button": false
          }
        ],
        "status": "fa"
      })
      newReqModule.mutateName('Action Distributors')
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })

    it('Renders the correct text content', () => {
      expect(wrapper.text()).toContain('Helpful Hint')
      expect(wrapper.text()).toContain('Requires a word at the beggining of your name that sets it apart')
    })
    it('does not display a Reserve Name button', () => {
      expect(wrapper.html()).not.toContain('reserve-submit')
    })
  })
  describe('wrong_designation', () => {
    let wrapper: any

    beforeAll(async (done) => {
      newReqModule.mutateName('ACTION COOPERATIVE')
      newReqModule.mutateAnalysisJSON({
        "header": "Further Action Required",
        "issues": [
          {
            "designations": [
              "Inc"
            ],
            "issue_type": "designation_mismatch",
            "line1": "Designation \u003cb\u003eCooperative\u003c/b\u003e cannot be used with selected business " +
            "type of \u003cb\u003eCorporation\u003c/b\u003e",
            "line2": "",
            "name_actions": [
              {
                "index": 1,
                "type": "highlight",
                "word": "COOPERATIVE"
              }
            ],
            "setup": [
              {
                "type": "replace_designation",
                "checkbox": "",
                "header": "Option 1",
                "line1": "If your intention was to reserve a name for a BC Corporation, you can replace Cooperative " +
                "with a comptatible designation.  The folling are allowed:",
                "line2": ""
              },
              {
                "type": "change_entity_type",
                "checkbox": "",
                "header": "Option 2",
                "line1": "If you would like to start a Cooperative business instead of a Corporation, start your " +
                "search over and change your business type to “Cooperative”.",
                "line2": ""
              }
            ],
            "show_examination_button": false,
            "show_reserve_button": false
          }
        ],
        "status": "fa"
      })
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('Renders the correct text content', () => {
      expect(wrapper.text()).toContain('Designation Cooperative cannot be used with selected business type of Corporation')
      expect(wrapper.text()).toContain('Option 1')
      expect(wrapper.text()).toContain('Option 2')
      expect(wrapper.text()).toContain('Designation Cooperative cannot be used with selected business type of Corporation')
    })
    it('Changes the designation to the clicked designation automatically', async () => {
      let button = wrapper.find('#designation-0')
      button.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.name).toBe('ACTION INC')
    })
    it('Detetcts changes in the base name', async () => {
      newReqModule.mutateName('Lester Inc')
      expect(wrapper.vm.changesInBaseName).toBe(true)
    })
  })
  describe('corp_conflict', () => {
    let wrapper: any

    beforeAll(async (done) => {
      newReqModule.mutateName('Action Inc')
      newReqModule.mutateAnalysisJSON({
        "header": "Further Action Required",
        "issues": [
          {
            "designations": [],
            "issue_type": "corp_conflict",
            "line1": "Too similar to an existing name",
            "line2": "",
            "conflicts": [
              {
                "name": `Action Enterprises Ltd`,
                "date": '12/21/1988'
              },
              {
                "name": `Action Development Ltd`,
                "date": '2/14/2004'
              }
            ],
            "name_actions": [
              {
                "index": 0,
                "type": "strike",
                "word": "Action"
              },
              {
                "type": "brackets",
                "position": "start",
                "message": "Add a word",
                "word": "Action",
                "index": 0
              }
            ],
            "setup": [
              {
                "button": "",
                "checkbox": "",
                "header": "Option 1",
                "line1": "You can add a word that makes your name distinct.",
                "line2": "Or you can remove the word Action."
              },
              {
                "type": "send_to_examiner",
                "checkbox": "",
                "header": "Option 2",
                "line1": "You can send your name for examination.",
                "line2": ""
              },
              {
                "type": "conflict_self_consent",
                "checkbox": "",
                "header": "Option 3",
                "line1": "You can provide consent if you are the registered owner.",
                "line2": ""
              },
            ],
            "show_examination_button": false,
            "show_reserve_button": false
          }
        ],
        "status": "fa"
      })
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('renders 3 boxes of options', () => {
      let options = ['Option 1', 'Option 2', 'Option 3']
      options.every(option => expect(wrapper.text()).toContain(option))
    })
    it('displays the Option 1 text', () => {
      expect(wrapper.text()).toContain('You can add a word that makes your name distinct')
      expect(wrapper.text()).toContain('Or you can remove the word Action.')
    })
    it('renders a button to send for examination', () => {
      expect(wrapper.contains('#reserve-submit-examine')).toBe(true)
    })
    it('renders the conflict_self_consent button', () => {
      expect(wrapper.contains('#reserve-submit-consent')).toBe(true)
    })
  })
  describe('add_descriptive', () => {
    let wrapper: any

    beforeAll(async (done) => {
      newReqModule.mutateName('SMART NAME INC')
      newReqModule.mutateAnalysisJSON({
        header: 'Further Action Required',
        issues: [
          {
            conflicts: null,
            consenting_body: null,
            designations: null,
            issue_type: 'add_descriptive',
            line1: 'Requires a Business Category Word',
            line2: '',
            name_actions: [
              {
                index: 0,
                message: 'Add a Descriptive Word Here',
                position: 'end',
                type: 'brackets',
                word: 'smart'
              }
            ],
            setup: [
              {
                button: '',
                checkbox: '',
                header: 'Helpful Hint',
                line1: 'Add a word to the end of your name that describes the business category.',
                line2: '',
              }
            ],
            show_examination_button: false,
            show_reserve_button: false
          }
        ],
        status: 'fa'
      })
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('renders 1 grey box of options', () => {
      let options = ['Helpful Hint']
      options.every(option => expect(wrapper.text()).toContain(option))
    })
    it('displays the Add Descriptive text', () => {
      expect(wrapper.text()).toContain('Add a word to the end of your name that describes the business category.')
    })
    it('does not render a button to send for examination', () => {
      expect(wrapper.contains('#reserve-submit-examine')).toBe(false)
    })
  })
  describe('consent_required', () => {
    let wrapper: any

    beforeAll(async (done) => {
      newReqModule.mutateName('Action Inc')
      newReqModule.mutateAnalysisJSON({
        "header": "Further Action Required",
        "issues": [
          {
            "designations": [],
            "issue_type": "corp_conflict",
            "line1": "Too similar to an existing name",
            "line2": "",
            "conflicts": [
              {
                "name": `Action Enterprises Ltd`,
                "date": '12/21/1988'
              },
              {
                "name": `Action Development Ltd`,
                "date": '2/14/2004'
              }
            ],
            "name_actions": [
              {
                "index": 0,
                "type": "strike",
                "word": "Action"
              },
              {
                "type": "brackets",
                "position": "start",
                "message": "Add a word",
                "word": "Action",
                "index": 0
              }
            ],
            "setup": [
              {
                "type":'',
                "header": "Option 1",
                "line1": "You can add a word that makes your name distinct.",
                "line2": "Or you can remove the word Action."
              },
              {
                "type": "send_to_examiner",
                "header": "Option 2",
                "line1": "You can send your name for examination.",
                "line2": ""
              },
              {
                "type": "conflict_self_consent",
                "checkbox": "",
                "header": "Option 3",
                "line1": "You can provide consent if you are the registered owner.",
                "line2": ""
              },
            ],
            "show_examination_button": false,
            "show_reserve_button": false
          }
        ],
        "status": "fa"
      })
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('renders 3 boxes of options', () => {
      let options = ['Option 1', 'Option 2', 'Option 3']
      options.every(option => expect(wrapper.text()).toContain(option))
    })
    it('displays the Option 1 text', () => {
      expect(wrapper.text()).toContain('You can add a word that makes your name distinct')
      expect(wrapper.text()).toContain('Or you can remove the word Action.')
    })
    it('renders a button to send for examination', () => {
      expect(wrapper.contains('#reserve-submit-examine')).toBe(true)
    })
    it('renders the conflict_self_consent button', () => {
      expect(wrapper.contains('#reserve-submit-consent')).toBe(true)
    })
  })
  describe('unclassified_word', () => {
    let wrapper: any

    beforeAll(async (done) => {
      newReqModule.mutateName('Action Inc')
      newReqModule.mutateAnalysisJSON({
        "header": "Further Action Required",
        "issues": [
          {
            "designations": [],
            "issue_type": "corp_conflict",
            "line1": "Too similar to an existing name",
            "line2": "",
            "conflicts": [
              {
                "name": `Action Enterprises Ltd`,
                "date": '12/21/1988'
              },
              {
                "name": `Action Development Ltd`,
                "date": '2/14/2004'
              }
            ],
            "name_actions": [
              {
                "index": 0,
                "type": "strike",
                "word": "Action"
              },
              {
                "type": "brackets",
                "position": "start",
                "message": "Add a word",
                "word": "Action",
                "index": 0
              }
            ],
            "setup": [
              {
                "button": "",
                "checkbox": "",
                "header": "Option 1",
                "line1": "You can add a word that makes your name distinct.",
                "line2": "Or you can remove the word Action."
              },
              {
                "type": "send_to_examiner",
                "header": "Option 2",
                "line1": "You can send your name for examination.",
                "line2": ""
              },
              {
                "type": "conflict_self_consent",
                "header": "Option 3",
                "line1": "You can provide consent if you are the registered owner.",
                "line2": ""
              },
            ],
            "show_examination_button": false,
            "show_reserve_button": false
          }
        ],
        "status": "fa"
      })
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('renders 3 boxes of options', () => {
      let options = ['Option 1', 'Option 2', 'Option 3']
      options.every(option => expect(wrapper.text()).toContain(option))
    })
    it('displays the Option 1 text', () => {
      expect(wrapper.text()).toContain('You can add a word that makes your name distinct')
      expect(wrapper.text()).toContain('Or you can remove the word Action.')
    })
    it('renders a button to send for examination', () => {
      expect(wrapper.contains('#reserve-submit-examine')).toBe(true)
    })
    it('renders the consent_corp checkbox/button elememnt', () => {
      expect(wrapper.contains('#reserve-submit-consent')).toBe(true)
    })
  })
  describe('word_to_avoid', () => {
    let wrapper: any

    beforeAll(async (done) => {
      newReqModule.mutateName('Action Inc')
      newReqModule.mutateAnalysisJSON({
        "header": "Further Action Required",
        "issues": [
          {
            "designations": [],
            "issue_type": "corp_conflict",
            "line1": "Too similar to an existing name",
            "line2": "",
            "conflicts": [
              {
                "name": `Action Enterprises Ltd`,
                "date": '12/21/1988'
              },
              {
                "name": `Action Development Ltd`,
                "date": '2/14/2004'
              }
            ],
            "name_actions": [
              {
                "index": 0,
                "type": "strike",
                "word": "Action"
              },
              {
                "type": "brackets",
                "position": "start",
                "message": "Add a word",
                "word": "Action",
                "index": 0
              }
            ],
            "setup": [
              {
                "button": "",
                "checkbox": "",
                "header": "Option 1",
                "line1": "You can add a word that makes your name distinct.",
                "line2": "Or you can remove the word Action."
              },
              {
                "type": "send_to_examiner",
                "header": "Option 2",
                "line1": "You can send your name for examination.",
                "line2": ""
              },
              {
                "type": "conflict_self_consent",
                "header": "Option 3",
                "line1": "You can provide consent if you are the registered owner.",
                "line2": ""
              },
            ],
            "show_examination_button": false,
            "show_reserve_button": false
          }
        ],
        "status": "fa"
      })
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('renders 3 boxes of options', () => {
      let options = ['Option 1', 'Option 2', 'Option 3']
      options.every(option => expect(wrapper.text()).toContain(option))
    })
    it('displays the Option 1 text', () => {
      expect(wrapper.text()).toContain('You can add a word that makes your name distinct')
      expect(wrapper.text()).toContain('Or you can remove the word Action.')
    })
    it('renders a button to send for examination', () => {
      expect(wrapper.contains('#reserve-submit-examine')).toBe(true)
    })
    it('renders the consent_corp checkbox/button elememnt', () => {
      expect(wrapper.contains('#reserve-submit-consent')).toBe(true)
    })
  })
  describe('corp_conflict + consent_required + wrong_designation', () => {
    let wrapper: any

    beforeAll(async (done) => {
      newReqModule.store.state.newRequestModule.name = 'Action Inc'
      newReqModule.store.state.newRequestModule.analysisJSON = {
        "header": "Further Action Required",
        "issues": [
          {
            "designations": [],
            "issue_type": "corp_conflict",
            "line1": "Too similar to an existing name",
            "line2": "",
            "conflicts": [
              {
                "name": `Action Enterprises Ltd`,
                "date": '12/21/1988'
              },
              {
                "name": `Action Development Ltd`,
                "date": '2/14/2004'
              }
            ],
            "name_actions": [
              {
                "index": 0,
                "type": "strike",
                "word": "Action"
              },
              {
                "type": "brackets",
                "position": "start",
                "message": "Add a word",
                "word": "Action",
                "index": 0
              }
            ],
            "setup": [
              {
                "header": "Option 1",
                "line1": "You can add a word that makes your name distinct.",
                "line2": "Or you can remove the word Action."
              },
              {
                "type": "send_to_examiner",
                "header": "Option 2",
                "line1": "You can send your name for examination.",
                "line2": ""
              },
              {
                "type": "conflict_self_consent",
                "header": "Option 3",
                "line1": "You can provide consent if you are the registered owner.",
                "line2": ""
              },
            ],
            "show_examination_button": false,
            "show_reserve_button": false
          }
        ],
        "status": "fa"
      }
      wrapper = mount(AnalyzeResults, {
        localVue,
        vuetify,
        stubs
      })
      await wrapper.vm.$nextTick()
      done()
    })
    it('renders 3 boxes of options', () => {
      let options = ['Option 1', 'Option 2', 'Option 3']
      options.every(option => expect(wrapper.text()).toContain(option))
    })
    it('displays the Option 1 text', () => {
      expect(wrapper.text()).toContain('You can add a word that makes your name distinct')
      expect(wrapper.text()).toContain('Or you can remove the word Action.')
    })
    it('renders a button to send for examination', () => {
      expect(wrapper.contains('#reserve-submit-examine')).toBe(true)
    })
    it('renders the conflict_self_consent reserve-submit button', () => {
      expect(wrapper.contains('#reserve-submit-consent')).toBe(true)
    })
  })
})
