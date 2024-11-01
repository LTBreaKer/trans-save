import { get_localstorage, check_access_token } from './auth.js';
import { get_friends_home } from './components/profile/profile.js';


export var host = "127.0.0.1";
let game_api = `https://${host}:9007/api/tag-gamedb/`;
var api_game = `https://${host}:9006/api/gamedb/`;
let socket_friend_request;
let accumulatedNotifications = [];

// export {host};

export function loadHTML(url) {
  console.log(url);
    return fetch(url).then(response => response.text());
  }
  
export {socket_friend_request, accumulatedNotifications};

  export function loadCSS(url) {
    console.log()
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


const api = `https://${host}:9005/api/`
function removeAllCSSLinks() {
  const links = document.querySelectorAll('head link[rel="stylesheet"]');
  links.forEach(link => link.remove());
}


  

export async function player_webSocket() {
  // console.log("utils ----------------> ", localStorage.getItem('token'))
  // await check_access_token();
  return new Promise((resolve) => {
    socket_friend_request = new WebSocket(`wss://${host}:9005/ws/friend-requests/`, ["token", get_localstorage('token'), "session_id", get_localstorage('session_id')]);
    
    socket_friend_request.onopen = function () {
      console.log('WebSocket connection =======================================================================.');
    };
    
    socket_friend_request.onmessage = async function(event) {
      const newNotification = await JSON.parse(event.data);
      console.log(newNotification);
      const loca = window.location.hash;
      if (newNotification.type === "friend_request_accepted"){
        if (loca.startsWith('/user') || loca === '#/profile')
          await get_friends_home();
        return;
      } else if (newNotification.type === "remove_friend") {
        if (loca.startsWith('/user') || loca === '#/profile')
          await get_friends_home();
        return;
      }
      else {
          accumulatedNotifications.push(newNotification);
        await displayNotifications(accumulatedNotifications);
      }
    };

    socket_friend_request.onerror = function (error) {
      console.error('WebSocket error:', error);
      setTimeout(player_webSocket, 5000);
    };

    socket_friend_request.onclose = function () {
      console.log('WebSocket connection closed.');
    };
  });
}

export async function displayNotifications(notifications) {

    console.log("hhhhhhhhhhhhhhhhhhhhh");
    console.log("notification here check what's the problem =>    ", notifications);
    const notificationsArray =  Array.isArray(notifications) ? notifications : [notifications];
    console.log(notifications[0].type);
    
    
    const notifiDisplay = document.querySelector('.notifi_btn');
    if (!notifiDisplay) {
      console.error('Notification display container not found');
      return;
    }
    
    notifiDisplay.innerHTML = notificationsArray.map(notification => `
      <div class="send_request">
      <div class="img_text">
      <img src="${notification.friend_request.sender_data.avatar}" alt="">
      <h6>${notification.friend_request.message}</h6>
      </div>
      <div class="acc_dec">
      <button class="accept" data-id="${notification.friend_request.id}">Accept</button>
      <button class="decline" data-id="${notification.friend_request.id}">Decline</button>
      </div>
      </div>
      `).join(''); 
      
      notifiDisplay.querySelectorAll('.accept').forEach(button => {
        button.addEventListener('click', handleAccept);
      });
      
      notifiDisplay.querySelectorAll('.decline').forEach(button => {
        button.addEventListener('click', handleDecline);
      });
}

export async function remove_game_pong_f_database(params) {
  try {
    const response = await fetch(api_game + 'delete-zombie-games/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
    });
    console.log(response);
    const jsonData = await response.json();
    console.log("data delete from database=>  : ", jsonData);
   
      
    if (!response.ok) 
      throw new Error(`HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }

}

export async function remove_game_tag_f_database(params) {
  try {
    const response = await fetch(game_api + 'delete-zombie-games/', {
      method: 'DELETE',
      headers: {
        'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
    });
    console.log(response);
    const jsonData = await response.json();
    console.log("data delete from database tag game =>  : ", jsonData);
   
      
    if (!response.ok) 
      throw new Error(`HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }

}

async function handleAccept(event) {
  await check_access_token();
  const notificationDiv = event.target.closest('.send_request');
  const notificationId = event.target.getAttribute('data-id');
  console.log(`Declined notification with ID: ${notificationId}`);
  notificationDiv.remove(); 
console.log(notificationId);
  const data = {
    id: notificationId
  }
  const response = await fetch(api + 'user/accept-friend-request/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const jsonData = await response.json();
  console.log("accept anvitation =>     ", jsonData);
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  const loca = window.location.hash;
  for(let i = 0; i < accumulatedNotifications.length; i++) {
    if (accumulatedNotifications[i].friend_request.id === Number(notificationId)) {
      accumulatedNotifications.splice(i, 1);
    }
  }
  console.log("ouia here is notification => ", accumulatedNotifications);
  if (loca.startsWith('/user') || loca === '#/profile')
    await get_friends_home();
}

async function handleDecline(event) {
  await check_access_token();
  const notificationDiv = event.target.closest('.send_request');
  const notificationId = event.target.getAttribute('data-id');
  console.log(`Declined notification with ID: ${notificationId}`);
  notificationDiv.remove(); 

  const data = {
    id: notificationId
  }
  const response = await fetch(api + 'user/deny-friend-request/', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const jsonData = await response.json();
  console.log("accept anvitation =>     ", jsonData);
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }

  for(let i = 0; i < accumulatedNotifications.length; i++) {
    if (accumulatedNotifications[i].friend_request.id === Number(notificationId)) {
      accumulatedNotifications.splice(i, 1);
    }
  }
  
}

export async function remove_tag_remote_game() {
  await check_access_token();

  try {
    const response = await fetch(game_api + 'cancel-remote-game-creation/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
    });
    console.log(response);
    const jsonData = await response.json();
    console.log("data=>  : ", jsonData);
    if (jsonData.message === "player removed from game queue") {
      document.querySelector('#cancel_game').style.display = 'none';
      document.querySelector('#butt_game').style.display = 'flex';
      document.querySelector('.spinner').style.display = 'none';
    }
   
      
    if (!response.ok) 
      throw new Error(`HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }

}

export async function remove_ping_remote_game() {
  await check_access_token();

  try {
    const response = await fetch(api_game + 'cancel-remote-game-creation/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
    });
    console.log(response);
    const jsonData = await response.json();
    console.log("data=>  : ", jsonData);
    if (jsonData.message === "player removed from game queue") {
      document.querySelector('#cancel_game').style.display = 'none';
      document.querySelector('#butt_game').style.display = 'flex';
      document.querySelector('.spinner').style.display = 'none';
    }
   
      
    if (!response.ok) 
      throw new Error(`HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}