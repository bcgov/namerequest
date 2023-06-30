import Vue from 'vue'
import { createLocalVue, mount } from '@vue/test-utils'
import Vuetify from 'vuetify'
import NameBuildInfo from '@/components/lower-info-area/name-build-info.vue'
import { BusinessDesignation, ConsentWords, ExampleName, UnavailableWords, UniqueNames, UnknownWords }
  from '@/components/lower-info-area/name-build-sub-components'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

describe('NameBuildInfo component', () => {
  it('is an empty test', () => {})
  // let wrapper: any

  // beforeEach(async () => {
  //   wrapper = mount(NameBuildInfo, {
  //     localVue,
  //     vuetify
  //   })
  //   await wrapper.vm.$nextTick()
  // })

  // afterEach(() => {

  // })

  // it('Mounts the component', () => {
  //   expect(wrapper.findComponent(NameBuildInfo).exists()).toBeTruthy()
  // })

  // it('Displays the required ui elements', () => {
  //   // Verify title
  //   expect(wrapper.find('.h3').text()).toBe('How to Build Your Name')

  //   // Verify list items
  //   const listItems = wrapper.findAll('.v-list-item')
  //   expect(listItems.length).toBe(6)
  //   expect(listItems.at(0).text()).toContain('Check the name has the correct components')
  //   expect(listItems.at(1).text()).toContain('Check for unavailable words')
  //   expect(listItems.at(2).text()).toContain('Check for words that have not been used before')
  //   expect(listItems.at(3).text()).toContain('Check for words that require consent')
  //   expect(listItems.at(4).text()).toContain('Check for similar names in the same sector')
  //   expect(listItems.at(5).text()).toContain('Check for appropriate designation')
  // })

  // it('Displays the correct sub-component when list item 1 is hovered over', async () => {
  //   const listItems = wrapper.findAll('.v-list-item')
  //   listItems.at(0).trigger('mouseover')

  //   await Vue.nextTick()

  //   expect(wrapper.findComponent(ExampleName).exists()).toBeTruthy()
  // })

  // it('Displays the correct sub-component when list item 2 is hovered over', async () => {
  //   const listItems = wrapper.findAll('.v-list-item')
  //   listItems.at(1).trigger('mouseover')

  //   await Vue.nextTick()

  //   expect(wrapper.findComponent(UnavailableWords).exists()).toBeTruthy()
  // })

  // it('Displays the correct sub-component when list item 3 is hovered over', async () => {
  //   const listItems = wrapper.findAll('.v-list-item')
  //   listItems.at(2).trigger('mouseover')

  //   await Vue.nextTick()

  //   expect(wrapper.findComponent(UnknownWords).exists()).toBeTruthy()
  // })

  // it('Displays the correct sub-component when list item 4 is hovered over', async () => {
  //   const listItems = wrapper.findAll('.v-list-item')
  //   listItems.at(3).trigger('mouseover')

  //   await Vue.nextTick()

  //   expect(wrapper.findComponent(ConsentWords).exists()).toBeTruthy()
  // })

  // it('Displays the correct sub-component when list item 5 is hovered over', async () => {
  //   const listItems = wrapper.findAll('.v-list-item')
  //   listItems.at(4).trigger('mouseover')

  //   await Vue.nextTick()

  //   expect(wrapper.findComponent(UniqueNames).exists()).toBeTruthy()
  // })

  // it('Displays the correct sub-component when list item 6 is hovered over', async () => {
  //   const listItems = wrapper.findAll('.v-list-item')
  //   listItems.at(5).trigger('mouseover')

  //   await Vue.nextTick()

  //   expect(wrapper.findComponent(BusinessDesignation).exists()).toBeTruthy()
  // })
})
