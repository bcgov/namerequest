import { shallowMount, createLocalVue } from '@vue/test-utils'
import Component from '@/components/new-request/analyzed-name-word-renderer'

const localVue = createLocalVue()

describe('analyzed-name-word-renderer', () => {
  it('Can render the various name_actions', async () => {
    let wrapper = shallowMount(Component, {
      propsData: {
        word: 'testword',
        actions: [
          {
            type: 'strike',
            word_index: 2
          }
        ],
        index: 2
      }
    })
    await localVue.nextTick()

    expect(wrapper.html().toContain('lala')).toBe(true)
  })
})