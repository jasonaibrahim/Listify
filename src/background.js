'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages
//
// Example:
// if (request.type === 'GREETINGS') {
//   const message = `Hi ${
//     sender.tab ? 'Con' : 'Pop'
//   }, my name is Bac. I am from Background. It's great to hear from you.`;
//
//   // Log message coming from the `request` parameter
//   console.log(request.payload.message);
//   // Send a response message
//   sendResponse({
//     message,
//   });
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SAVE':
      window.localStorage.setItem(
        request.payload.key,
        JSON.stringify(request.payload.value),
      );

      sendResponse({
        [request.payload.key]: request.payload.value,
      });
      break;
    case 'RETRIEVE':
      sendResponse(
        JSON.parse(window.localStorage.getItem(request.payload.key))
      );
      break;
  }

  return true;
});
