import { loadHTML, loadCSS, player_webSocket } from '../../utils.js';
import {log_out_func, logoutf, get_localstorage, getCookie, login } from '../../auth.js';



const api = "https://127.0.0.1:9004/api/";
const api_one = "https://127.0.0.1:9005/api/";
var friend_user_id = 0;
var friends_array = [];
var friend_username = "";

// user/send-friend-request/
var photo = null;
async function Friends() {
  const html = await loadHTML('./components/friends/friends.html');
  loadCSS('./components/friends/friends.css');
  const app = document.getElementById('app');
  app.innerHTML = html;
  await checkFirst();
  player_webSocket();

  const logout = document.getElementById('logout')
  logout.addEventListener('click', log_out_func);
  
  const input_search = document.getElementById('input_search');
  input_search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      const query = input_search.value;
      input_search.value = "";
      send_freinds_request(query);
      console.log('Search query:', query);
    }
  })
  const cancel_friend = document.getElementById('cancel_friend');

cancel_friend.addEventListener('click', () => {
  remove_friend();
  window.location.hash = '/';
})


const butt = document.querySelector('#butt');
const side = document.querySelector('.sidebar');

butt.addEventListener('click', function() {
  
  side.classList.toggle('active');
});

document.addEventListener('click', (event) => {
  if (!side.contains(event.target) && !butt.contains(event.target)) {
    side.classList.remove('active');
  }
});



}

async function remove_friend() {
  const data = {
    friend_id: friend_user_id
  }
  const response = await fetch(api_one + 'user/remove-friend/', {
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

async function get_friends_home() {
  const response = await fetch(api_one + 'user/get-friend-list/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
    },
    credentials: 'include',
  });
  const jsonData = await response.json();
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  console.log(jsonData.friend_list);
  displayFriendList_home(jsonData.friend_list)
}

function displayFriendList_home(friendList) {
   friendList =  Object.values(friendList);
  //  friends_array = [];
if (!friendList) {
  console.error('Notification display container not found');
  return;
}

  const send_friend = document.querySelector('.send_friend_list');
  // send_friend.innerHTML = friendList.map( friend => {
  //   friends_array.push(friend.username);
  // });
  send_friend.innerHTML = friendList.map( friend => ` 
    <div class="friends" data-id="${friend.id}">
    <div class="friend" id="user_id" data-id="${friend.id}">
    <img id="player1" style="border-radius: 50%;" class="click_friend" data-name="${friend.username}" data-id="${friend.id}" class="proimage" src="${friend.avatar}" alt="">
    <h2 class="player1" class="click_friend" >${friend.username}</h2>
    </div>

  `).join('');
  send_friend.querySelectorAll('.click_friend').forEach(link => {
    link.addEventListener('click', readit);
  });
  // console.log("here i will print my array =>    ", friends_array);
}

var id_of_friends;
var name_of_friends;
function readit(event) {

  id_of_friends = event.target.getAttribute('data-id');
  name_of_friends = event.target.getAttribute('data-name');
  console.log('hello wer are here fine', id_of_friends);
  window.location.hash = `/user/${name_of_friends}`
}

export function return_id() {
  
  return id_of_friends;
}


// === here i can remove all this display flex and set just one before timeout 

async function send_freinds_request(userna) {
  const data = {
  username: userna
};

try {
  var jsonData;
  const response = await fetch(api_one + 'user/send-friend-request/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': "Bearer " + get_localstorage('token')
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  console.log("hello -----------------------------");
   jsonData = await response.json();
  console.log(jsonData.message);
  if ("Friend request sent" === jsonData.message){
    console.log("==--=-==-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=");
    document.querySelector('#send_friend_message_text').innerHTML = 'Friend Request Sent';
    document.querySelector('.send_friend_message').style.display = 'flex';
  }
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }    
} catch (error) {
  if ("Friend request already sent" === jsonData.message){
    document.querySelector('#send_friend_message_text').innerHTML = 'Request Already Sent';
    document.querySelector('.send_friend_message').style.display = 'flex';
  }
  else{
    document.querySelector('#send_friend_message_text').innerHTML = 'Friend Request Error';
    document.querySelector('.send_friend_message').style.display = 'flex';
  }
  console.error('There was a problem with the fetch operation:', error);
}
setTimeout(function() {
  document.querySelector('.send_friend_message').style.display = 'none';
}, 2000);
}

async function changeAccess() {
  const data = {
    refresh: get_localstorage('refresh')
  };

  try {
    const response = await fetch(api + 'auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonData = await response.json();
    console.log('New tokens:', jsonData);
    
    await login(jsonData.access, jsonData.refresh);

  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// Define the `checkFirst` function
async function checkFirst() {


  console.log("*******************************");
  // const subprotocols = ['token', get_localstorage('token')];

  // const socket = new WebSocket('wss://127.0.0.1:9005/ws/friend-requests/ ', subprotocols);
  // socket.onmessage = function(event) {
  //   console.log('Message from server:', event.data);
    
  //   try {
  //     const data = JSON.parse(event.data);
  //     console.log('Parsed data:', data);
  //   } catch (e) {
  //     console.error('Failed to parse message:', e);
  //   }
  // };


  const token = get_localstorage('token');
  
  console.log('Token being checked:', token); 
  console.log("--------------------------------------", api);
  try {
    const response = await fetch(api + 'auth/verify-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    console.log(response);
    if (response.status === 404){
      logoutf();
      window.location.hash = '/login';
    }

    if (response.status !== 200) {
      console.log('Token is invalid. Attempting to refresh....');
      console.log(response);
      // console.log(await response.json());

      await changeAccess();
      await get_friends_home();
      await fetchUserData();
    } else if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
      const jsonData = await response.json();
      console.log(jsonData);
      await get_friends_home();
      await fetchUserData();
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// Define a function to fetch user data
async function fetchUserData() {
  try {
    const userResponse = await fetch(api + 'auth/get-user/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + get_localstorage('token')
      },
      credentials: 'include',
    });

    if (!userResponse.ok) {
      throw new Error('Network response was not ok');
    }
    const userData = await userResponse.json();
    console.log('User data:', userData);

    const change_user = document.getElementById('UserName');
    const change_image = document.getElementById('image_user');

    change_image.src = userData.user_data.avatar;
    change_user.innerHTML = userData.user_data.username;
    console.log("==================================");
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
  await fetch_friend_data();
}



async function fetch_friend_data() {
  const path = window.location.hash.slice(1);
  const usern = path.split('/')[2]
  const data = {
    username: usern
  };
    const response = await fetch(api + 'auth/get-user-by-username/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AUTHORIZATION': "Bearer " + get_localstorage('token')
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const jsonData = await response.json();
    const avata = document.getElementById('avatar');
    const profile_username = document.getElementById('profile_username');
    // const cancel_friend = document.getElementById('cancel_friend');

    friend_user_id = jsonData.user_data.id;
    avata.src = jsonData.user_data.avatar

    profile_username.innerHTML = jsonData.user_data.username;
    friend_username = jsonData.user_data.username;
    // if (friends_array.includes(jsonData.user_data.username))
    //   cancel_friend.innerHTML = " Cancel Friend";
    // else
    //   cancel_friend.innerHTML = " Send Friend";
}

export default Friends;