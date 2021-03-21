import { Component, Mixins } from 'vue-property-decorator'
import { Getter } from 'vuex-class'
import { isDate } from 'lodash'
import { CommonMixin } from './common-mixin'

/**
 * Mixin that provides some useful date utilities.
 * Ref: https://github.com/bcgov/business-edit-ui/blob/master/src/mixins/date-mixin.ts
 */
@Component({})
export class DateMixin extends Mixins(CommonMixin) {
  readonly MS_IN_A_DAY = (1000 * 60 * 60 * 24)

  // Global getter
  @Getter getCurrentJsDate!: Date

  /**
   * Fetches and returns the web server's current date (in UTC).
   * Used to bypass the user's local clock/timezone.
   * Ref: https://www.npmjs.com/package/serverdate
   * @returns a promise to return a Date object
   */
  async getServerDate (): Promise<Date> {
    const input = `${window.location.origin}${process.env.VUE_APP_PATH}/`
    const init: RequestInit = { cache: 'no-store', method: 'HEAD' }

    // don't call fetch() during Jest tests
    // because it's not defined
    if (this.isJestRunning) return new Date()

    const { headers, ok, statusText } = await fetch(input, init)

    if (!ok) {
      // eslint-disable-next-line no-console
      console.warn('Unable to get server date - using browser date instead')
      // fall back to local date
      // NB: filing  may contain invalid dates/times
      return new Date()
    }

    return new Date(headers.get('Date'))
  }

  /**
   * Creates and returns a new Date object in UTC, given parameters in Pacific timezone.
   * (This works regardless of user's local clock/timezone.)
   * @example "2021, 0, 1, 0, 0" -> "2021-01-01T08:00:00.000Z"
   * @example "2021, 6, 1, 0, 0" -> "2021-07-01T07:00:00.000Z"
   */
  createUtcDate (year: number, month: number, day: number, hours: number = 0, minutes: number = 0): Date {
    // use date from server to create a new date in Pacific timezone
    // (this sets the correct tz offset in the new date)
    const date = new Date(this.getCurrentJsDate.toLocaleString('en-US', { timeZone: 'America/Vancouver' }))

    // update all date and time fields
    date.setFullYear(year, month, day)
    date.setHours(hours, minutes, 0, 0) // zero out seconds and milliseconds

    return date
  }

  /**
   * Converts a Date object to a date string (YYYY-MM-DD) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "2020-12-31"
   * @example "2021-01-01 08:00:00 GMT" -> "2021-01-01"
   */
  dateToDateString (date: Date): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    const dateStr = date.toLocaleDateString('en-CA', {
      timeZone: 'America/Vancouver'
    })

    return dateStr
  }

  /**
   * Converts a Date object to a date string (Month Day, Year) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "December 31, 2020"
   * @example "2021-01-01 08:00:00 GMT" -> "January 1, 2021"
   */
  dateToPacificDate (date: Date): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    let dateStr = date.toLocaleDateString('en-CA', {
      timeZone: 'America/Vancouver',
      month: 'long', // December
      day: 'numeric', // 31
      year: 'numeric' // 2020
    })

    // remove period after month
    dateStr = dateStr.replace('.', '')
    return dateStr
  }

  /**
   * Converts a Date object to a time string (HH:MM am/pm) in Pacific timezone.
   * @example "2021-01-01 07:00:00 GMT" -> "11:00 pm"
   * @example "2021-01-01 08:00:00 GMT" -> "12:00 am"
   */
  dateToPacificTime (date: Date): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    let timeStr = date.toLocaleTimeString('en-CA', {
      timeZone: 'America/Vancouver',
      hour: 'numeric', // 11
      minute: '2-digit', // 00
      hour12: true // a.m./p.m.
    })

    // replace a.m. with am and p.m. with pm
    timeStr = timeStr.replace('a.m.', 'am').replace('p.m.', 'pm')

    return timeStr
  }

  /**
   * Converts a Date object to a date and time string (Month DD, YYYY at HH:MM am/pm Pacific time).
   * @example "2020-10-27T18:45:00Z" -> "October 27, 2020 at 11:45 am Pacific time"
   */
  dateToPacificDateTime (date: Date): string {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return null

    const dateStr = this.dateToPacificDate(date)
    const timeStr = this.dateToPacificTime(date)

    return `${dateStr} at ${timeStr} Pacific time`
  }

  /**
   * The number of days that 'date' is from today (in Pacific tz).
   * @param date the Date object to compare
   * @returns -1 for yesterday
   * @returns 0 for today
   * @returns +1 for tomorrow
   * @returns NaN in case of error
   */
  daysFromToday (date: Date): number {
    // safety check
    if (!isDate(date) || isNaN(date.getTime())) return NaN

    // convert Dates to dates to Pacific tz
    const todayPacific = this.dateToDateString(this.getCurrentJsDate)
    const datePacific = this.dateToDateString(date)

    // get milliseconds for start of "today" and start of "date"
    const todayPacificMs = new Date(todayPacific).setHours(0, 0, 0, 0)
    const datePacificMs = new Date(datePacific).setHours(0, 0, 0, 0)

    // return diff in days
    return Math.round((datePacificMs - todayPacificMs) / this.MS_IN_A_DAY)
  }
}
