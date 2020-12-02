import { Component, Vue } from 'vue-property-decorator'

@Component
export default class DateMixin extends Vue {
  readonly MS_IN_A_DAY = (1000 * 60 * 60 * 24)

  /**
   * The number of days that 'date' is from today.
   * @returns -1 for yesterday
   * @returns 0 for today
   * @returns +1 for tomorrow
   * @returns NaN in case of error
   */
  daysFromToday (date: string): number {
    if (!date) return NaN
    // calculate difference between start of "today" and start of "date" (in local time)
    const todayLocalMs = new Date().setHours(0, 0, 0, 0)
    const dateLocalMs = new Date(date).setHours(0, 0, 0, 0)
    return Math.round((dateLocalMs - todayLocalMs) / this.MS_IN_A_DAY)
  }
}
