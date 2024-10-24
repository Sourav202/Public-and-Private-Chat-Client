//enter key pressed
function handleKeyDown(event) {
    const ENTER_KEY = 13 //keycode for enter key
    if (event.keyCode === ENTER_KEY) {
      sendMessage()
      return false //don't propogate event
    }
  }