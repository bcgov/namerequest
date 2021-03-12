// import { mount, createLocalVue } from '@vue/test-utils'
// import Vuetify from 'vuetify'
// import { PickRequestTypeDialog } from '@/components/dialogs'
// import newReqModule from '@/store/new-request-module'

// // Prevent the warning "[Vuetify] Unable to locate target [data-app]"
// document.body.setAttribute('data-app', 'true')

// const localVue = createLocalVue()
// const vuetify = new Vuetify()

// localVue.use(Vuetify)

// describe('pick-request-type-modal', (): void => {
//   let wrapper: any

//   beforeEach(() => {
//     wrapper = mount(PickRequestTypeDialog, { localVue, vuetify })
//   })

//   afterEach(() => {
//     wrapper.destroy()
//   })

//   it('When the modal visibility state key is set to false, the components internal getter is false', () => {
//     newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = false
//     expect(wrapper.vm.showModal).toBe(false)
//   })

//   it('and it does not show the modal', () => {
//     expect(wrapper.find('#pick-request-type-modal-card').element).toBeFalsy()
//   })

//   it('When the modal visibility state key is set to true, expect the opposite', async () => {
//     newReqModule.store.state.newRequestModule.pickRequestTypeModalVisible = true
//     await wrapper.vm.$nextTick()
//     expect(wrapper.find('#pick-request-type-modal-card').element).toBeTruthy()
//     expect(wrapper.vm.showModal).toBe(true)
//   })

//   it('clicking an entity sets the entity_type_cd and closes the modal', async () => {
//     wrapper.vm.showModal = true
//     await wrapper.vm.$nextTick()
//     let convertType = wrapper.find('#CNV')
//     convertType.trigger('click')
//     await wrapper.vm.$nextTick()
//     expect(wrapper.vm.showModal).toBe(false)
//     expect(newReqModule.request_action_cd).toBe('CNV')
//   })
// })
