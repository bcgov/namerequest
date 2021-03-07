const TIMEOUT_WARNING_OFFSET_MS = 3000

export function countdown (lastRenderTime, el) {
  const countdownSec = TIMEOUT_WARNING_OFFSET_MS / 1000
  const countdownInt = parseInt(String((new Date().getTime() - lastRenderTime) / 1000))
  let text = ''
  if (countdownInt >= countdownSec) {
    text = 'Expiring in...'
  } else if (!isNaN(countdownInt)) {
    const secondsLeft = countdownSec - countdownInt
    text = `${secondsLeft} second${secondsLeft === 1 ? '' : 's'}`
  }
  el.text(text)
}
