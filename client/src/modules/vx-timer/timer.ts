/**
 * Default poll value of 1000 milliseconds
 * @param {number} DEFAULT_POLL_RATE_MS
 */
const DEFAULT_POLL_RATE_MS = 1000

export function Timer (opts) {
  opts = opts || {}

  /**
   * @param {string} opts.id The name of the timer.  Used as a unique ID.
   * @param {function} opts.expiration_fn This function will be called when the timer expires.
   * @param {number} opts.timeout_ms The time interval in milliseconds,
   * before the timer will be considered to have expired.
   * @memberof core.components.timers.Timer
   */
  this.id = opts.id
  this.expiration_fn = opts.expiration_fn
  this.timeout_ms = opts.timeout_ms

  /**
   * @param {number} [poll_rate] The time interval between checks of the Timer's timeout time.
   * If not provided, a default poll rate is used.
   * @memberof core.components.timers.Timer
   */
  this.poll_rate = opts.poll_rate ? opts.poll_rate : DEFAULT_POLL_RATE_MS

  // Internal data
  this._poll_interval = null
  this._last_active_timestamp = null

  // The polling function checks that the action is done
  this._pollFn = function () {
    if (!this._last_active_timestamp) {
      // If we have no last tracked activity, we should stop the timer
      this._stop_polling()
    }
    const current_timestamp = new Date().getTime()

    // If not already in idle state, set idle and show warning when difference
    // between current time and last activity exceeds timeout period.
    if (current_timestamp - this._last_active_timestamp > this.timeout_ms) {
      // Once we have expired, make sure to stop the interval from running
      this._stop_polling()
      this.expiration_fn()
      // TODO: Should Timer clean itself up here?
    }
  }

  /**
   * Restarts the timer's last active time and resets the polling interval
   * @memberof core.components.timers.Timer
   */
  this.refresh = function () {
    // Set a new last active time
    this._last_active_timestamp = new Date().getTime()
  }

  this._stop_polling = function () {
    if (this._poll_interval) {
      clearInterval(this._poll_interval)
      this._poll_interval = null
    }
  }

  /**
   * Begins the timer polling
   * @memberof core.components.timers.Timer
   */
  this.start = function () {
    this._stop_polling()
    this.refresh()
    // Run one poll right away before starting the interval
    this._pollFn()
    this._poll_interval = setInterval(this._pollFn.bind(this), this.poll_rate)
  }

  /**
   * Stops the timer from polling
   * @memberof core.components.timers.Timer
   */
  this.stop = function () {
    // TODO: Any other metadata type calls here?
    this._stop_polling()
  }
}
