import Router from './router.js';
import { getState, setState, subscribe } from './store.js';
import {get_localstorage } from './auth.js';

console.log('hello maaraft ma9999999l hadchi walakin blan ghadi naaraf')
await Router();




subscribe((state) => {
  console.log('State changed:', state);
});
console.log('hello maaraft ma9999999l hadchi walakin blan ghadi naaraf')

document.addEventListener('DOMContentLoaded', () => {
  console.log('hello maaraft mal hadchi walakin blan ghadi naaraf')
  setTimeout(() => {
    setState({ count: getState().count + 1 });
  }, 3000);
});

// if (get_localstorage('token')){

//   let socket = new WebSocket("wss://127.0.0.1:9005/ws/friend-requests/", ["token", get_localstorage('token')]);
  
//   socket.onopen = function () {
//   console.log('its working just i dont know why data not working ===== ');
//   // alert('hhhhh khdam aslan');
//   }
  
//   socket.onmessage = function(event) {
//     console.log('Message from server:', event.data);
    
//     try {
//       const data = JSON.parse(event.data);
//       console.log(data.friend_request.message, "       ===    avatar: =>       ", data.friend_request.sender_data.user_data.avatar);
//       console.log('Parsed data:', data);
//     } catch (e) {
//       console.error('Failed to parse message:', e);
//     }
//   };
// }

