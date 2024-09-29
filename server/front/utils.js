import { get_localstorage } from './auth.js';
import { get_friends_home } from './components/profile/profile.js';


export function loadHTML(url) {
  console.log(url);
    return fetch(url).then(response => response.text());
  }
  
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


const api = "https://127.0.0.1:9005/api/"
function removeAllCSSLinks() {
  const links = document.querySelectorAll('head link[rel="stylesheet"]');
  links.forEach(link => link.remove());
}


  
  let accumulatedNotifications = [];

export async function player_webSocket() {
  return new Promise((resolve) => {
    let socket = new WebSocket("wss://127.0.0.1:9005/ws/friend-requests/", ["token", get_localstorage('token')]);
    
    socket.onopen = function () {
      console.log('WebSocket connection established.');
    };
    
    socket.onmessage = async function(event) {
      const newNotification = await JSON.parse(event.data);
      const isDuplicate = accumulatedNotifications.some(notification => notification.friend_request.id === newNotification.friend_request.id
      );
      if (!isDuplicate)
        accumulatedNotifications.push(newNotification);

      await displayNotifications(accumulatedNotifications);
    };

    socket.onerror = function (error) {
      console.error('WebSocket error:', error);
    };

    socket.onclose = function () {
      console.log('WebSocket connection closed.');
    };
  });
}

async function displayNotifications(notifications) {
  console.log("hhhhhhhhhhhhhhhhhhhhh");
  console.log("notification here check what's the problem =>    ", notifications);
  const notificationsArray =  Array.isArray(notifications) ? notifications : [notifications];
  console.log(notificationsArray);
  const notifiDisplay = document.querySelector('.notifi_btn');
  if (!notifiDisplay) {
    console.error('Notification display container not found');
    return;
  }

  // Generate HTML for all notifications
  if (!notificationsArray)
      console.log("alaho akbar ");
  // console.log("here is avatar==>    ", notificationsArray[0].friend_request.sender?_data.avatar);
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


async function handleAccept(event) {
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
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const jsonData = await response.json();
  console.log("accept anvitation =>     ", jsonData);
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
    await get_friends_home();
}

async function handleDecline(event) {
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
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const jsonData = await response.json();
  console.log("accept anvitation =>     ", jsonData);
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }




}
