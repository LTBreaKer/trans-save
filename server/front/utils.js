import { get_localstorage } from './auth.js';


export function loadHTML(url) {
    return fetch(url).then(response => response.text());
  }
  
  export function loadCSS(url) {
    removeAllCSSLinks();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }
  
  export function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while ((m = regex.exec(queryString)) !== null) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}



function removeAllCSSLinks() {
  const links = document.querySelectorAll('head link[rel="stylesheet"]');
  links.forEach(link => link.remove());
}

// export async function player_webSocket() {
//   var fanti;
//   console.log('------------------------------------------ ===== ');
//   let socket = new WebSocket("wss://127.0.0.1:9005/ws/friend-requests/", ["token", get_localstorage('token')]);
  
//   socket.onopen = function () {
//   console.log('its working just i dont know why data not working ===== ');
//   // alert('hhhhh khdam aslan');
//   }
  
//   socket.onmessage = function(event) {
//     console.log('Message from server:', event.data);
//     fanti = event.data;
    
//     // try {
//     //   const data = JSON.parse(event.data);
//     //   console.log(data.friend_request.message, "       ===    avatar: =>       ", data.friend_request.sender_data.user_data.avatar);
//     //   console.log('Parsed data:', data);
//     // } catch (e) {
//     //   console.error('Failed to parse message:', e);
//     console.log("fanti  ",fanti);
//     // }
//   };
//   return fanti
// }

export async function player_webSocket() {
  return new Promise((resolve) => {
    var fanti;
    console.log('------------------------------------------ ===== ');
    let socket = new WebSocket("wss://127.0.0.1:9005/ws/friend-requests/", ["token", get_localstorage('token')]);
    
    socket.onopen = function () {
      console.log('its working just i dont know why data not working ===== ');
      // alert('hhhhh khdam aslan');
    }
    
    socket.onmessage = function(event) {
      console.log('Message from server:', event.data);
      fanti = event.data;
      // console.log("fanti  ",fanti);
      resolve(fanti);
      
      
    };
    // reject fanti;
  });
}