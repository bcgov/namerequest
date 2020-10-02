import ReserveSubmit from '@/components/new-request/submit-request/reserve-submit.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import newReqModule from '@/store/new-request-module'
import Vuetify from 'vuetify'
import sinon from 'sinon'
import { xproMapping } from '@/store/list-data/request-action-mapping'

const localVue = createLocalVue()
const vuetify = new Vuetify()

localVue.use(Vuetify)

async function provideWrapper (setup) {
  let wrapper = shallowMount(ReserveSubmit, {
    localVue,
    vuetify,
    mocks: {
      $xproMapping: xproMapping
    },
    propsData: {
      setup
    }

  })
  await wrapper.vm.$nextTick()
  return wrapper
}
let sandbox = sinon.createSandbox()

describe('reserve-submit', () => {
  describe('Case: it handles the NORMAL route (!setup) properly', () => {
    sandbox.spy(newReqModule, 'postNameRequests')
    let wrapper: any

    beforeEach(async (done) => {
      wrapper = await provideWrapper('')
      done()
    })
    afterAll(() => {
      newReqModule.mutateLocation('BC')
    })
    afterEach(() => {
      sandbox.reset()
      wrapper.destroy()
    })
    test('The button is labelled "Reserve and Continue"', async () => {
      await newReqModule.mutateLocation('BC')
      wrapper.vm.$nextTick()
      expect(wrapper.text()).toBe('Reserve and Continue')
    })
    describe('If location === "BC", it acts as a RESERVED name', () => {
      test('postNameRequests("reserved") is called with correct argument', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.postNameRequests.calledOnce).toBeTruthy()
        expect(newReqModule.postNameRequests.getCall(0).args[0] === 'reserved').toBeTruthy()
      })
      test('submissionType is set to "normal"', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionType === 'normal').toBeTruthy()
      })
      test('The UI displays Applicant-Info-1', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionTabNumber === 2).toBeTruthy()
      })
    })
    describe('If location !== "BC", it sends to examination', async () => {
      test('postNameRequests is not called', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.postNameRequests.calledOnce).toBeFalsy()
      })
      test('submissionType is set to "examination"', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionType === 'examination').toBeTruthy()
      })
      test('The UI displays NamesCapture', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionTabNumber === 1).toBeTruthy()
      })
    })
  })

  describe('Case: it handles the CONDITIONAL route (setup === "consent") properly', () => {
    let wrapper: any
    beforeEach(async (done) => {
      wrapper = await provideWrapper('consent')
      done()
    })
    afterEach(() => {
      sandbox.reset()
      wrapper.destroy()
    })
    test('The button is labelled "Conditionally Reserve"', () => {
      expect(wrapper.html()).toContain('Conditionally Reserve')
    })
    describe('If location === "BC", it acts as a RESERVED-CONDITION name', () => {
      test('postNameRequests("conditional") is called with correct argument', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.postNameRequests.calledOnce).toBeTruthy()
        expect(newReqModule.postNameRequests.getCall(0).args[0] === 'conditional').toBeTruthy()
      })
      test('submissionType is set to "consent"', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionType === 'consent').toBeTruthy()
      })
      test('The UI displays Applicant-Info-1', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionTabNumber === 2).toBeTruthy()
      })
    })
    describe('If location !== "BC", it sends to examination', () => {
      test('postNameRequests is not called', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.postNameRequests.calledOnce).toBeFalsy()
      })
      test('submissionType is set to "examination"', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionType === 'examination').toBeTruthy()
      })
      test('The UI displays NamesCapture', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionTabNumber === 1).toBeTruthy()
      })
    })
  })

  describe('Case: it handles the EXAMINATION route (setup === "examine") properly', () => {
    let wrapper: any
    beforeEach(async (done) => {
      wrapper = await provideWrapper('examine')
      done()
    })
    afterEach(() => {
      sandbox.reset()
      wrapper.destroy()
    })
    test('The button is labelled "Send for Examination"', () => {
      expect(wrapper.text()).toBe('Send for Examination')
    })
    describe('If location === "BC", it sends to examination', () => {
      newReqModule.mutateLocation('BC')
      test('postNameRequests is not called', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.postNameRequests.calledOnce).toBeFalsy()
      })
      test('submissionType is set to "examination"', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionType === 'examination').toBeTruthy()
      })
      test('The UI displays NamesCapture', async () => {
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionTabNumber === 1).toBeTruthy()
      })
    })
    describe('If location !== "BC", it sends to examination', () => {
      test('postNameRequests is not called', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.postNameRequests.calledOnce).toBeFalsy()
      })
      test('submissionType is set to "examination"', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionType === 'examination').toBeTruthy()
      })
      test('The UI displays NamesCapture', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionTabNumber === 1).toBeTruthy()
      })
    })
  })

  describe('Case: it handles the ASSUMED route (setup === "assumed") properly', () => {
    let wrapper: any
    newReqModule.mutateName('Original Assumed Name Ltd.')

    beforeEach(async (done) => {
      wrapper = await provideWrapper('assumed')
      done()
    })
    afterAll(() => {
      sandbox.restore()
    })
    afterEach(() => {
      sandbox.reset()
      wrapper.destroy()
    })
    test('The button is labelled "Continue"', () => {
      expect(wrapper.text()).toBe('Assume a name in BC')
    })

    for (let code of ['XCR', 'RLC', 'XUL']) {
      let createTest = async () => {
        describe(`If the entity_type_cd is ${code}`, () => {
          newReqModule.mutateLocation('CA')
          newReqModule.mutateEntityType(`${code}`)
          test('postNameRequests is not called', async () => {
            wrapper.vm.handleSubmit()
            await wrapper.vm.$nextTick()
            expect(newReqModule.postNameRequests.calledOnce).toBeFalsy()
            newReqModule.mutateRequestAction('NEW')
          })
          test('request_action_cd is set to "ASSUMED"', async () => {
            newReqModule.mutateRequestAction('NEW')
            wrapper.vm.handleSubmit()
            await wrapper.vm.$nextTick()
            expect(newReqModule.request_action_cd === 'ASSUMED').toBeTruthy()
          })
          test(`requestActionOriginal is set to the original request type`, async () => {
            newReqModule.mutateRequestAction('NEW')
            wrapper.vm.handleSubmit()
            await wrapper.vm.$nextTick()
            expect(newReqModule.requestActionOriginal === 'NEW').toBeTruthy()
          })
          test(`assumedNameOriginal is set to newReqModule.name`, async () => {
            wrapper.vm.handleSubmit()
            await wrapper.vm.$nextTick()
            expect(newReqModule.assumedNameOriginal === newReqModule.name).toBeTruthy()
          })
          test('submissionType is set to "examination"', async () => {
            newReqModule.mutateLocation('CA')
            wrapper.vm.handleSubmit()
            await wrapper.vm.$nextTick()
            expect(newReqModule.submissionType === 'examination').toBeTruthy()
          })
          test('The UI displays NamesCapture', async () => {
            newReqModule.mutateLocation('CA')
            wrapper.vm.handleSubmit()
            await wrapper.vm.$nextTick()
            expect(newReqModule.submissionTabNumber === 1).toBeTruthy()
          })
        })
      }
      createTest()
    }
    describe('If the entity_type_cd is not one that can be ASSUMED', () => {
      newReqModule.mutateLocation('CA')
      newReqModule.mutateName('Another Test Name Ltd.')
      test('requestActionOriginal is not set', async () => {
        newReqModule.mutateEntityType('XCP')
        newReqModule.mutateRequestActionOriginal('')
        await wrapper.vm.$nextTick()
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.requestActionOriginal).toBeFalsy()
      })
      test('request_action_cd !== "ASSUMED"', async () => {
        newReqModule.mutateEntityType('XCP')
        newReqModule.mutateRequestAction('NEW')
        await wrapper.vm.$nextTick()
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.request_action_cd === 'ASSUMED').toBeFalsy()
      })
      test('assumedNameOriginal is set to newRequestModule.name', async () => {
        expect(newReqModule.assumedNameOriginal === newReqModule.name).toBeTruthy()
      })
      test('submissionType is set to "examination"', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionType === 'examination').toBeTruthy()
      })
      test('The UI displays NamesCapture', async () => {
        newReqModule.mutateLocation('CA')
        wrapper.vm.handleSubmit()
        await wrapper.vm.$nextTick()
        expect(newReqModule.submissionTabNumber === 1).toBeTruthy()
      })
    })
  })
})
