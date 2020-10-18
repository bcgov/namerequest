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

  private _pollInterval: any
  private _lastActiveTimestamp: number

  constructor (opts: TimerOptions) {
    opts = opts || {} as TimerOptions

    this.expirationFn = opts.expirationFn
    this.timeoutMs = opts.timeoutMs
    this.pollRate = opts.pollRate ? opts.pollRate : DEFAULT_POLL_RATE_MS

    // Internal data
    this._pollInterval = null
    this._lastActiveTimestamp = null
  }

  // The polling function checks that the action is done
  private _pollFn () {
    if (!this._lastActiveTimestamp) {
      // If we have no last tracked activity, we should stop the timer
      this._stopPolling()
    }
    const currentTimestamp = new Date().getTime()
    // If not already in idle state, set idle and show warning when difference
    // between current time and last activity exceeds timeout period.
    if (currentTimestamp - this._lastActiveTimestamp > this.timeoutMs) {
      // Once we have expired, make sure to stop the interval from running
      this._stopPolling()
      // eslint-disable-next-line no-debugger
      this.expirationFn()
    }
  }

  /**
   * Restarts the timer's last active time and resets the polling interval
   */
  refresh () {
    // Set a new last active time
    this._lastActiveTimestamp = new Date().getTime()
  }

  /**
   * Begins the timer polling
   */
  start () {
    this._stopPolling()
    this.refresh()
    // Run one poll right away before starting the interval
    this._pollFn()
    this._pollInterval = setInterval(this._pollFn.bind(this), this.pollRate)
  }

  /**
   * Stops the timer from polling
   */
  stop () {
    this._stopPolling()
  }

  _stopPolling () {
    if (this._pollInterval) {
      clearInterval(this._pollInterval)
      this._pollInterval = null
    }
  }
}
