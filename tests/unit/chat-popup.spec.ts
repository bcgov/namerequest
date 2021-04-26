// Libraries
import Vue from 'vue'
import Vuetify from 'vuetify'
import sinon from 'sinon'
import { mount, createLocalVue } from '@vue/test-utils'
import axios from 'axios'

// Components
import ChatPopup from '@/components/common/chat-popup.vue'

Vue.use(Vuetify)
const localVue = createLocalVue()
const vuetify = new Vuetify({})

describe('ChatPopup component', () => {
  let wrapper: any

  beforeEach(async () => {
    const get = sinon.stub(axios, 'get')
    window['webChatReason'] = 'Test'
    window['webChatStatusUrl'] = 'myhost/basePath/webchatStatus'
    window['webChatUrl'] = 'myhost/basePath/webchatUrl'

    // GET webchat status
    get.withArgs('myhost/basePath/webchatStatus')
      .returns(new Promise((resolve) => resolve({
        data: { 'status': 'open' }
      })))
    wrapper = mount(ChatPopup, { vuetify, localVue })
  })
  afterEach(() => {
    sinon.restore()
    wrapper.destroy()
  })

  it('renders the components', async () => {
    expect(wrapper.findComponent(ChatPopup).exists()).toBe(true)
    expect(wrapper.find('#chat-button-wrapper').exists()).toBe(true)
    expect(wrapper.find('#open-tooltip-message').exists()).toBe(false)
    expect(wrapper.find('#closed-tooltip-message').exists()).toBe(false)
    expect(wrapper.find('#unavailable-tooltip-message').exists()).toBe(false)
  })

  it('requests the webchat status', async () => {
    await Vue.nextTick()
    expect(wrapper.vm.chatStatus).toBe('open')
  })

  it('displays the tooltip for the open webchat status', async (done) => {
    await Vue.nextTick()
    wrapper.find('#chat-button-wrapper').trigger('mouseenter')
    requestAnimationFrame(() => {
      expect(wrapper.find('#open-tooltip-message').text()).toBe(
        'Click here to chat live with Helpdesk staff about Name Requests.'
      )
      done()
    })
  })

  it('displays the tooltip for the closed webchat status', async (done) => {
    wrapper.vm.chatStatus = 'closed'
    wrapper.find('#chat-button-wrapper').trigger('mouseenter')
    await Vue.nextTick()
    requestAnimationFrame(() => {
      expect(wrapper.find('#closed-tooltip-message').text().replace(/\s+/g, ' ')).toBe(
        'We are closed. The Service BC Contact Centre is open Monday through Friday 7:30am – 5:00pm PST ' +
                'excluding BC statutory holidays.'.replace(/\s+/g, ' ')
      )
      done()
    })
  })

  it('displays the tooltip for unavailable webchat status', async (done) => {
    wrapper.vm.chatStatus = 'response error'
    wrapper.find('#chat-button-wrapper').trigger('mouseenter')
    await Vue.nextTick()
    requestAnimationFrame(() => {
      expect(wrapper.find('#unavailable-tooltip-message').text()).toBe(
        'Webchat is temporarily unavailable.'
      )
      done()
    })
  })
})
