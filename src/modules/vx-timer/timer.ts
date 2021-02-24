/**
 * Default poll value of 1000 milliseconds
 * @param {number} DEFAULT_POLL_RATE_MS
 */
const DEFAULT_POLL_RATE_MS = 1000

export interface TimerOptions {
  id: string | number
  expirationFn?: Function
  timeoutMs?: number
  pollRate?: number
}

export class Timer {
  /**
   * The name of the timer.  Used as a unique ID.
   * @param {function} opts.expirationFn This function will be called when the timer expires.
   * @param {number} opts.timeoutMs The time interval in milliseconds,
   * before the timer will be considered to have expired.
   */
  id: string | number
  /**
   * The name of the timer.  Used as a unique ID.
   * @param {function} opts.expirationFn This function will be called when the timer expires.
   * @param {number} opts.timeoutMs The time interval in milliseconds,
   * before the timer will be considered to have expired.
   */
  expirationFn: Function
  /**
   * The time interval in milliseconds, before the timer will be considered to have expired.
   */
  timeoutMs: number
  /**
   * The time interval between checks of the Timer's timeout time.
   * If not provided, a default poll rate is used.
   */
  pollRate: number
  /**
   * The time interval in milliseconds.
   */
  timeRemaining: number
  /**
   * The number of ticks.
   */
  ticks: number
  /**
   * Flag set when timer is expired.
   */
  isExpired: boolean

  private _pollInterval: any
  private _lastActiveTimestamp: number

  constructor (opts: TimerOptions) {
    opts = opts || {} as TimerOptions

    this.expirationFn = opts.expirationFn
    this.timeoutMs = opts.timeoutMs
    this.pollRate = opts.pollRate ? opts.pollRate : DEFAULT_POLL_RATE_MS
    this.ticks = 0
    this.timeRemaining = 0
    this.isExpired = false

    // Internal data
    this._pollInterval = null
    this._lastActiveTimestamp = null
  }

  // The polling function checks that the action is done
  private pollFn () {
    if (!this._lastActiveTimestamp) {
      // If we have no last tracked activity, we should stop the timer
      this.stopPolling()
    }

    this.timeRemaining = this.timeoutMs - (this.ticks * this.pollRate)
    this.ticks++

    const currentTimestamp = new Date().getTime()
    // If not already in idle state, set idle and show warning when difference
    // between current time and last activity exceeds timeout period.
    if (currentTimestamp - this._lastActiveTimestamp > this.timeoutMs) {
      // Once we have expired, make sure to stop the interval from running
      this.stopPolling()
      this.isExpired = true
      this.expirationFn()
    }
  }

  /**
   * Restarts the timer's last active time and resets the polling interval
   */
  refresh () {
    // Set a new last active time
    this._lastActiveTimestamp = new Date().getTime()
    this.ticks = 0
    this.timeRemaining = 0
    this.isExpired = false
  }

  /**
   * Begins the timer polling
   */
  start () {
    this.stopPolling()
    this.refresh()
    // Run one poll right away before starting the interval
    this.pollFn()
    this._pollInterval = setInterval(this.pollFn.bind(this), this.pollRate)
  }

  /**
   * Stops the timer from polling
   */
  stop () {
    this.stopPolling()
    this.ticks = 0
    this.timeRemaining = 0
    this.isExpired = true
  }

  private stopPolling () {
    if (this._pollInterval) {
      clearInterval(this._pollInterval)
      this._pollInterval = null
    }
  }
}
