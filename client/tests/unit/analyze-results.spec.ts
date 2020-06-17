import AnalyzeResults from '@/components/new-request/analyze-results.vue'
import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'
import { quillEditor } from 'vue-quill-editor'
import { SelectionI } from '@/models'
import quill from './mocks/quill-editor'

document['getSelection'] = jest.fn()

const localVue = createLocalVue()
localVue.use(Vuetify)
localVue.use(quillEditor)
const vuetify = new Vuetify()
const stubs = {
  ReserveSubmit: true,
  NameWordRenderer: true,
  NameInput: true,
  GreyBox: true
}

describe('analyze-results.vue', () => {
  describe('Functionality of quill editor', () => {
    let wrapper: any

    beforeEach(async () => {
      newReqModule.mutateName('ACTION PAWN BROKERS LTD.')
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
                "word": "ACTION"
              }
            ],
            "setup": [
              {
                "button": "",
                "checkbox": "",
                "header": "Helpful Hint",
                "line1": "Some words that can set your name apart include an individual\u0027s name or intials; " +
                  "ageographic location; a colour; a coined, made-up word; or an acronym.",
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
        vuetify
      })
    })
    it('renders the nameActions properly', async () => {
      await wrapper.vm.$nextTick()
      expect(wrapper.html()).toContain('<span style=&quot;color: red;&quot;> [Add a Word Here]</span>')
    })
  })
})
