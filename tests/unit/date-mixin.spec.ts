import Vue from 'vue'
import { shallowMount } from '@vue/test-utils'
// import { getVuexStore } from '@/store'
import { Store } from 'vuex'
import ContactInfo from '@/components/common/contact-info.vue'
import { DateMixin } from '@/mixins'

// the "non-actions" in actions.ts cause "TypeError: Cannot read property 'default' of undefined"
// so this is commented out for now -- FUTURE: restore this when actions.ts is cleaned up
const store = new Store({ state: {} as any }) // getVuexStore()

describe('Date Mixin', () => {
  let vm: any

  beforeAll(async () => {
    // mount the component and wait for everything to stabilize
    // (this can be any component since we are not really using it)
    const wrapper = shallowMount(ContactInfo, { store, mixins: [DateMixin] })
    vm = wrapper.vm
    await Vue.nextTick()
  })

  // FUTURE: this works locally but not in GHA; fix later
  xit('returns correct values for createUtcDate()', () => {
    // init store
    store.state.stateModel.currentJsDate = new Date()

    expect(vm.createUtcDate(2021, 0, 1, 0, 0).toISOString()).toBe('2021-01-01T08:00:00.000Z')
    expect(vm.createUtcDate(2021, 6, 1, 0, 0).toISOString()).toBe('2021-07-01T07:00:00.000Z')
  })

  it('returns correct values for dateToDateString()', () => {
    expect(vm.dateToDateString(null)).toBeNull()
    expect(vm.dateToDateString(new Date('not a date'))).toBeNull()
    // verify that GMT/UTC is correctly converted to Pacific
    expect(vm.dateToDateString(new Date('2021-01-01 07:00:00 GMT'))).toBe('2020-12-31') // Standard Time
    expect(vm.dateToDateString(new Date('2021-01-01 08:00:00 GMT'))).toBe('2021-01-01') // Standard Time
    expect(vm.dateToDateString(new Date('2021-07-01 06:00:00 GMT'))).toBe('2021-06-30') // Daylight Time
    expect(vm.dateToDateString(new Date('2021-07-01 07:00:00 GMT'))).toBe('2021-07-01') // Daylight Time
    // verify that Pacific is correctly converted to Pacific
    expect(vm.dateToDateString(new Date('2021-01-01 00:00:00 PST'))).toBe('2021-01-01')
    expect(vm.dateToDateString(new Date('2021-01-01 23:59:59 PST'))).toBe('2021-01-01')
    expect(vm.dateToDateString(new Date('2021-07-01 00:00:00 PDT'))).toBe('2021-07-01')
    expect(vm.dateToDateString(new Date('2021-07-01 23:59:59 PDT'))).toBe('2021-07-01')
    // verify that Eastern is correctly converted to Pacific
    expect(vm.dateToDateString(new Date('2021-01-01 02:00:00 EST'))).toBe('2020-12-31')
    expect(vm.dateToDateString(new Date('2021-01-01 03:00:00 EST'))).toBe('2021-01-01')
    expect(vm.dateToDateString(new Date('2021-07-01 02:00:00 EDT'))).toBe('2021-06-30')
    expect(vm.dateToDateString(new Date('2021-07-01 03:00:00 EDT'))).toBe('2021-07-01')
  })

  it('returns correct values for dateToPacificTime()', () => {
    expect(vm.dateToPacificTime(null)).toBeNull()
    expect(vm.dateToPacificTime(new Date('not a date'))).toBeNull()
    // verify that GMT/UTC is correctly converted to Pacific
    expect(vm.dateToPacificTime(new Date('2021-01-01 07:00:00 GMT'))).toBe('11:00 pm') // Standard Time
    expect(vm.dateToPacificTime(new Date('2021-01-01 08:00:00 GMT'))).toBe('12:00 am') // Standard Time
    expect(vm.dateToPacificTime(new Date('2021-07-01 06:00:00 GMT'))).toBe('11:00 pm') // Daylight Time
    expect(vm.dateToPacificTime(new Date('2021-07-01 07:00:00 GMT'))).toBe('12:00 am') // Daylight Time
    // verify that Pacific is correctly converted to Pacific
    expect(vm.dateToPacificTime(new Date('2021-01-01 00:00:00 PST'))).toBe('12:00 am')
    expect(vm.dateToPacificTime(new Date('2021-01-01 23:59:59 PST'))).toBe('11:59 pm')
    expect(vm.dateToPacificTime(new Date('2021-07-01 00:00:00 PDT'))).toBe('12:00 am')
    expect(vm.dateToPacificTime(new Date('2021-07-01 23:59:59 PDT'))).toBe('11:59 pm')
    // verify that Eastern is correctly converted to Pacific
    expect(vm.dateToPacificTime(new Date('2021-01-01 02:00:00 EST'))).toBe('11:00 pm')
    expect(vm.dateToPacificTime(new Date('2021-01-01 03:00:00 EST'))).toBe('12:00 am')
    expect(vm.dateToPacificTime(new Date('2021-07-01 02:00:00 EDT'))).toBe('11:00 pm')
    expect(vm.dateToPacificTime(new Date('2021-07-01 03:00:00 EDT'))).toBe('12:00 am')
  })

  it('returns correct values for dateToPacificDate()', () => {
    expect(vm.dateToPacificDate(null)).toBeNull()
    expect(vm.dateToPacificDate(new Date('not a date'))).toBeNull()
    // verify that GMT/UTC is correctly converted to Pacific
    expect(vm.dateToPacificDate(new Date('2021-01-01 07:00:00 GMT'))).toBe('December 31, 2020') // Standard Time
    expect(vm.dateToPacificDate(new Date('2021-01-01 08:00:00 GMT'))).toBe('January 1, 2021') // Standard Time
    expect(vm.dateToPacificDate(new Date('2021-07-01 06:00:00 GMT'))).toBe('June 30, 2021') // Daylight Time
    expect(vm.dateToPacificDate(new Date('2021-07-01 07:00:00 GMT'))).toBe('July 1, 2021') // Daylight Time
    // verify that Pacific is correctly converted to Pacific
    expect(vm.dateToPacificDate(new Date('2021-01-01 00:00:00 PST'))).toBe('January 1, 2021')
    expect(vm.dateToPacificDate(new Date('2021-01-01 23:59:59 PST'))).toBe('January 1, 2021')
    expect(vm.dateToPacificDate(new Date('2021-07-01 00:00:00 PDT'))).toBe('July 1, 2021')
    expect(vm.dateToPacificDate(new Date('2021-07-01 23:59:59 PDT'))).toBe('July 1, 2021')
    // verify that Eastern is correctly converted to Pacific
    expect(vm.dateToPacificDate(new Date('2021-01-01 02:00:00 EST'))).toBe('December 31, 2020')
    expect(vm.dateToPacificDate(new Date('2021-01-01 03:00:00 EST'))).toBe('January 1, 2021')
    expect(vm.dateToPacificDate(new Date('2021-07-01 02:00:00 EDT'))).toBe('June 30, 2021')
    expect(vm.dateToPacificDate(new Date('2021-07-01 03:00:00 EDT'))).toBe('July 1, 2021')
  })

  it('returns correct values for dateToPacificDateTime()', () => {
    expect(vm.dateToPacificDateTime(null)).toBeNull()
    expect(vm.dateToPacificDateTime(new Date('not a date'))).toBeNull()
    // verify some Standard times
    expect(vm.dateToPacificDateTime(new Date('2021-01-01 07:00:00 GMT')))
      .toBe('December 31, 2020 at 11:00 pm Pacific time')
    expect(vm.dateToPacificDateTime(new Date('2021-01-01 08:00:00 GMT')))
      .toBe('January 1, 2021 at 12:00 am Pacific time')
      // verify some Daylight times
    expect(vm.dateToPacificDateTime(new Date('2021-07-01 06:00:00 GMT')))
      .toBe('June 30, 2021 at 11:00 pm Pacific time')
    expect(vm.dateToPacificDateTime(new Date('2021-07-01 07:00:00 GMT')))
      .toBe('July 1, 2021 at 12:00 am Pacific time')
  })

  xit('returns correct values for daysFromToday()', () => {
    // init store
    store.state.stateModel.tombstone.currentJsDate = new Date('2021-01-20')

    expect(vm.daysFromToday(null)).toBeNaN()
    expect(vm.dateToPacificDateTime(new Date('not a date'))).toBeNaN()
    expect(vm.daysFromToday(new Date('2021-01-19'))).toBe(-1) // yesterday
    expect(vm.daysFromToday(new Date('2021-01-20'))).toBe(0) // today
    expect(vm.daysFromToday(new Date('2021-01-21'))).toBe(1) // tomorrow
  })
})
