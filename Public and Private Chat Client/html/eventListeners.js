//Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    //This function is called after the browser has loaded the web page
  
    //add listener to buttons
    document.getElementById('send_button').addEventListener('click', sendMessage)
    document.getElementById('establish_connection_button').addEventListener('click', establishConnection)
    document.getElementById('clear_button').addEventListener('click', clearUser)
  
    //add keyboard handler for the document as a whole, not separate elements.
    document.addEventListener('keydown', handleKeyDown)
    //document.addEventListener('keyup', handleKeyUp)
  })