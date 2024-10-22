import { loadHTML, loadCSS, player_webSocket, socket_friend_request } from '../../utils.js';
import {log_out_func, logoutf, get_localstorage, getCookie, login, check_access_token } from '../../auth.js';
import {get_friends_home, set_pong_history , send_freinds_request, changeAccess, set_tag_history, set_tournament_data, tag_win, tag_unk, tag_los, ping_los, ping_win, tourn_win, tourn_los} from '../profile/profile.js';

const api = "https://127.0.0.1:9004/api/";
const api_one = "https://127.0.0.1:9005/api/";
const pong_game = "https://127.0.0.1:9006/api/gamedb/";
const tourna_game = "https://127.0.0.1:9008/api/tournament/";
let game_api = 'https://127.0.0.1:9007/api/tag-gamedb/';

var friend_user_id = 0;
// var friends_array = [];
var friend_username = "";

// user/send-friend-request/
var photo = null;
async function Friends() {
  const html = await loadHTML('./components/friends/friends.html');
  loadCSS('./components/friends/friends.css');
  const app = document.getElementById('app');
  app.innerHTML = html;
  await checkFirst();
  if(!socket_friend_request)
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

// === ==== ==== === here i'm working with navbar === ==== ==== ===

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

// ====== ======== ========= ========= =========

// here i working with notification ====== ===== ===== ===== =====

const notific = document.querySelector('.notification');
const notifi_display = document.querySelector('.notifi_btn');

notific.addEventListener('click', function() {
  notifi_display.classList.toggle('active');
})

// ====== ======== ========= ========= =========


window.addEventListener('resize', () => {
  if (window.innerWidth > 666) 
    perso_list.style.display = 'flex';
  if (window.innerWidth < 666) 
    perso_list.style.display = 'none';
})

const perso = document.querySelector('.bi-person-add');
const perso_list = document.querySelector('.friends_list');

perso.addEventListener('click', () => {
  perso_list.classList.toggle('active');
});






// here i'm working with match history


const tag_history = document.querySelector('.tag_game_click');
const pong_history = document.querySelector('.pong_game_click');
const tourn_history = document.querySelector('.tourn_game_click');
const tag_game_history = document.querySelector('.tag_game_history');
const tur_game_history = document.querySelector('.tur_game_history');
const ping_game_history = document.querySelector('.ping_game_history');
const nom = document.querySelectorAll('.nom');
const mw = document.querySelectorAll('.mw');
const ml = document.querySelectorAll('.ml');


tag_history.addEventListener('click', () => {
  if (tag_game_history.style.display !== 'flex'){
    ping_game_history.style.display = 'none';
    tur_game_history.style.display = 'none';
    tag_game_history.style.display = 'flex';
  }
  nom.forEach(element => {
    element.textContent =  tag_los + tag_unk + tag_win;
  });
  mw.forEach(element => {
    element.textContent = tag_win;
  });
  ml.forEach(element => {
    element.textContent = tag_los;
  });

})
pong_history.addEventListener('click', () => {
  if (ping_game_history.style.display !== 'flex'){
    ping_game_history.style.display = 'flex';
    tur_game_history.style.display = 'none';
    tag_game_history.style.display = 'none';
  }
  nom.forEach(element => {
    element.textContent =  ping_los + ping_win;
  });
  mw.forEach(element => {
    element.textContent = ping_los;
  });
  ml.forEach(element => {
    element.textContent = ping_win;
  });

  
})
tourn_history.addEventListener('click', () => {
  if (tur_game_history.style.display !== 'flex'){
    ping_game_history.style.display = 'none';
    tur_game_history.style.display = 'flex';
    tag_game_history.style.display = 'none';
  }
  nom.forEach(element => {
    element.textContent =  tourn_los + tourn_win;
  });
  mw.forEach(element => {
    element.textContent = tourn_los;
  });
  ml.forEach(element => {
    element.textContent = tourn_win;
  });

})

// ====== ======== ========= ========= =========
get_pong_history_by_name(friend_username);
get_tag_history_by_name(friend_username);
get_tournament_by_name(friend_username);
}


async function get_tournament_by_name(name) {
  console.log("here are name of ", name)
  const data = {
    username: name
  }
  const response = await fetch(tourna_game + 'get-tournament-history-by-username/', {
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


  console.log("history of game of pong using user ==== name  ==> : ", jsonData);

  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  console.log(jsonData)
  set_tournament_data(jsonData);
}




async function get_tag_history_by_name(name) {
  const data = {
    username: name
  }
  const response = await fetch(game_api + 'get-game-history-by-username/', {
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

  console.log("history of game of pong using user ==== name  ==> : ", jsonData);

  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  set_tag_history(jsonData);
}




async function get_pong_history_by_name(name) {
  const data = {
    username: name
  }
  const response = await fetch(pong_game + 'get-game-history-by-username/', {
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

  console.log("history of game of pong using user ==== name  ==> : ", jsonData);

  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  set_pong_history(jsonData);
}




async function remove_friend() {
  await check_access_token();
  const data = {
    friend_id: friend_user_id
  }
  const response = await fetch(api_one + 'user/remove-friend/', {
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
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
}

// var id_of_friends;
// var name_of_friends;
// function readit(event) {

//   id_of_friends = event.target.getAttribute('data-id');
//   name_of_friends = event.target.getAttribute('data-name');
//   console.log('hello wer are here fine', id_of_friends);
//   window.location.hash = `/user/${name_of_friends}`
// }

// export function return_id() {
//   return id_of_friends;
// }

async function checkFirst() {

  const token = get_localstorage('token');
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
        await changeAccess();
        await get_friends_home();
        await fetchUserData();
    } else if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
        const jsonData = await response.json();
        await get_friends_home();
        await fetchUserData();
    }
  } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
  }
}

// here is function to fetch user data and set it in page 

async function fetchUserData() {
  try {
    const userResponse = await fetch(api + 'auth/get-user/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
    });

    if (userResponse.status === 404) {
      logoutf();
      window.location.hash = '/login';
    }
    if (!userResponse.ok) {
      throw new Error('Network response was not ok');
    }
    const userData = await userResponse.json();
    console.log('User data:', userData);

    const change_user = document.getElementById('UserName');
    const change_image = document.getElementById('image_user');

    change_image.src = userData.user_data.avatar;
    change_user.innerHTML = userData.user_data.username;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
  await fetch_friend_data();
}


// fetch friends info and set it in page 

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
        'AUTHORIZATION': "Bearer " + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
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

    friend_user_id = jsonData.user_data.id;
    avata.src = jsonData.user_data.avatar

    profile_username.innerHTML = jsonData.user_data.username;
    friend_username = jsonData.user_data.username;
}

export default Friends;