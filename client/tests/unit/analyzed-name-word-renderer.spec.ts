import { shallowMount, createLocalVue } from '@vue/test-utils'
import Component from '@/components/new-request/analyzed-name-word-renderer'
import Vuetify from 'vuetify'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('analyzed-name-word-renderer', () => {
  it('Can render the various name_actions', async () => {
    let wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        word: 'testword',
        actions: [
          {
            type: 'strike',
            index: 2,
            word: 'testword',
          }
        ],
        index: 2
      }
    })
    await localVue.nextTick()
    expect(wrapper.html()).toContain(
    `<div style=\"display: inline; color: rgb(211, 39, 44); text-decoration: line-through;\">testword&nbsp;</div>`
    )

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        word: 'testword',
        actions: [
          {
            type: 'highlight',
            index: 2,
            word: 'testword',
          }
        ],
        index: 2
      }
    })
    await localVue.nextTick()
    expect(wrapper.html()).toContain(
    `<div style=\"display: inline; color: rgb(211, 39, 44);\">testword&nbsp;</div>`
    )

  wrapper = shallowMount(Component, {
    localVue,
    vuetify,
    propsData: {
      word: 'testword',
      actions: [
        {
          type: 'brackets',
          index: 2,
          position: 'end',
          message: 'message'
        }
      ],
      index: 2
    }
  })
  await localVue.nextTick()
  expect(wrapper.html()).toContain(`<div style=\"display: inline; color: rgb(211, 39, 44);\">[message]&nbsp;</div>`)
})
})
