import { loadHTML, loadCSS, player_webSocket, socket_friend_request } from '../../utils.js';
import {log_out_func,  logoutf, get_localstorage, check_access_token, getCookie, login } from '../../auth.js';
import {setHeaderContent, setNaveBarContent} from '../tournament/script.js';
let friendsocket;
let id_of_tournament;


let tag_win;
let tag_unk;
let tag_los;
let ping_los;
let ping_win;
let tourn_win;
let tourn_los;


const api = "https://127.0.0.1:9004/api/";
const api_one = "https://127.0.0.1:9005/api/";
const tourna_game = "https://127.0.0.1:9008/api/tournament/";
const pong_game = "https://127.0.0.1:9006/api/gamedb/";
const tag_game = "https://127.0.0.1:9007/api/tag-gamedb/";
var photo = null;
let newNotification;
let username_;
async function Friends() {
  const html = await loadHTML('./components/profile/profile.html');
  loadCSS('./components/profile/profile.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  setHeaderContent();
  setNaveBarContent();
  if (!friendsocket)
    await check_friends_status();
  await checkFirst();
  if (!socket_friend_request)
    player_webSocket();

  const editProfileButton = document.querySelector('.edit_profi');
  const updateProfile = document.querySelector('.update_data');
  const close_edite = document.querySelector('.bi-x');
  const update_btn = document.getElementById('update_btn');

  update_btn.addEventListener('click', async () => {
    await update_profile_fun();
    updateProfile.classList.remove('active');
    document.querySelector('.success_update').style.display = "flex";
    setTimeout(function() {
      document.querySelector('.success_update').style.display = 'none';
  }, 2000);
    
  })
  editProfileButton.addEventListener('click', () => {
    updateProfile.classList.add('active');
  });
  
  close_edite.addEventListener('click', () => {
    updateProfile.classList.remove('active');
  });
  
  const logout = document.getElementById('logout')

  logout.addEventListener('click', log_out_func);
  
  const input_search = document.getElementById('input_search');
  input_search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const query = input_search.value;
      send_freinds_request(query);
      input_search.value = "";      
    }
  })  
  
  const update_avatar = document.getElementById('update_avatar');
  update_avatar.addEventListener('click', function(event) {
    document.getElementById('image_update_ava').click();
  });

  await get_friends_home();
  document.getElementById('image_update_ava').addEventListener('change', function(event) {
    var file = event.target.files[0];
    if (file)
          photo = file;
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 666) 
      perso_list.style.display = 'flex';
    if (window.innerWidth < 666)  {
      perso_list.style.display = 'none';
    }
  })

  const perso = document.querySelector('.bi-person-add');
  const perso_list = document.querySelector('.friends_list');

  perso.addEventListener('click', () => {
    if (perso_list.style.display === 'flex')
      perso_list.style.display = 'none';
    else 
      perso_list.style.display = 'flex';
  });

  if (newNotification)
    check_and_set_online(newNotification);

  const tag_history = document.querySelector('.tag_game_click');
  const pong_history = document.querySelector('.pong_game_click');
  const tourn_history = document.querySelector('.tourn_game_click');
  const tag_game_history = document.querySelector('.tag_game_history');
  const ping_game_history = document.querySelector('.ping_game_history');
  const tur_game_history = document.querySelector('.tur_game_history');
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

  get_pong_history();
  // get_pong_history_by_name('afanti');
  get_tag_history();
  // set_pong_score()
  // set_tag_score()
  get_tournament_history();
}

export {friendsocket, id_of_tournament, tag_win, tag_unk, tag_los, ping_los, ping_win, tourn_win, tourn_los};

async function get_tournament_history() {
  const response = await fetch(tourna_game + 'get-tournament-history/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
  });
  const jsonData = await response.json();

  console.log("history of game of tournament ==> : ", jsonData);
  console.log("--------------------------------------------------");

  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }

  set_tournament_data(jsonData.message);
}
// here i will set function that i set the players and id of everyfunctio


export function set_tournament_data(data) {
  if (data)
    console.log(data);
  const games_container = document.querySelector(".tur_game_history");
  var win = 0;
  var los = 0;

  data.forEach((index) => {
    if (username_ === index.firstPlayerName)
      win++;
    else
      los++;
    const gameDiv = document.createElement('div');
    gameDiv.classList.add('play');
    gameDiv.setAttribute('data-id', index.tournamentId); 
    gameDiv.style.cursor = 'pointer';
    gameDiv.innerHTML = `
      <div class="first_pl">
        <img id="player1" src="/images/hello.png" alt="">
        <h2 class="player1">${index.firstPlayerName}</h2>
      </div>
      <h2>First</h2>
      <h2>Second</h2>
      <div class="second_pl">
        <img id="player2" src="/images/hello.png" alt="">
        <h2 class="player2">${index.secondPlayerName}</h2>
      </div>
    `;

    gameDiv.addEventListener('click', () => {
    const tournamentId = gameDiv.getAttribute('data-id');
    id_of_tournament = tournamentId;
    window.location.hash = '/tournamentScore';
    console.log(id_of_tournament);


    });
    games_container.appendChild(gameDiv);
  })
    tourn_win = win;
    tourn_los = los;

}




async function get_pong_history() {
  const response = await fetch(pong_game + 'get-game-history/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
  });
  const jsonData = await response.json();

  console.log("history of game of pong ==> : ", jsonData);

  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  set_pong_history(jsonData)
}


export async function set_pong_history(friendList) {
  var win = 0;
  var los = 0;
  var name;

  if (!friendList) {
    console.error('Notification display container not found');
    return;
  }

    const gamesContainer = document.querySelector('.ping_game_history');
    friendList.games.forEach((game, index) => {
      name = game.player1_name;
      if (game.player1_score > game.player2_score)
          win++;
      else
        los++;

      const gameDiv = document.createElement('div');
      gameDiv.classList.add('play');
      gameDiv.innerHTML = `
        <img id="player1" src="${game.player1_avatar}" alt="Player 1 Avatar">
        <h2 class="player1">${game.player1_name}</h2>
        <h2 style="color: black;">${game.player1_score}</h2>
        <h2 style="color: black;">${game.player2_score}</h2>
        <h2 class="player2">${game.player2_name}</h2>
        <img id="player2" src="${game.player2_avatar}" alt="Player 2 Avatar">
        <h4 id="datofgame"> ${game.created_at.slice(0, 10)}</h4>

      `;
      gamesContainer.appendChild(gameDiv);
    });
    console.log("wammmmmmmmmmmmmmmiiiiiiiiiii", win, los );
    if (username_ === name) {
        ping_win = win;
        ping_los = los;
    } else {
        ping_los = los;
        ping_win = win;
    }

}


async function get_tag_history() {
  const response = await fetch(tag_game + 'get-game-history/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
  });
  const jsonData = await response.json();

  console.log("history of game of tag here  ==> : ", jsonData);

  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  set_tag_history(jsonData);
}


export async function set_tag_history(friendList) {
  let user1;
  let user2;
  var win = 0;
  var los = 0;
  var other = 0;
  var name;


  if (!friendList) {
    console.error('Notification display container not found');
    return;
  }

    const gamesContainer = document.querySelector('.tag_game_history');
    friendList.games.forEach((game, index) => {
      const gameDiv = document.createElement('div');
      if (game.winner_name === game.player1_name)
        win++;
      else if (game.winner_name === game.player2_name)
        los++;
      else 
        other++;

      name = game.player1_name;

      gameDiv.classList.add('play');
      if (game.winner_name === "unknown"){
        gameDiv.innerHTML = `
        <img id="player1" src="${game.player1_avatar}" alt="">
        <h2 class="player1">${game.player1_name}</h2>
        <h2 style="color: black;">unknown</h2>
        <h2 class="player2">${game.player2_name}</h2>
        <img id="player2" src="${game.player2_avatar}" alt="">
        <h4 id="datofgame"> ${game.created_at.slice(0, 10)}</h4>
      `;

      }
      else if (game.winner_name === game.player1_name){
        user1 = 'W';
        user2 = 'L';
        gameDiv.innerHTML = `
        <img id="player1" src="${game.player1_avatar}" alt="">
        <h2 class="player1">${game.player1_name}</h2>
        <h2 style="color: green;">${user1}</h2>
        <h2 style="color: red;">${user2}</h2>
        <h2 class="player2">${game.player2_name}</h2>
        <img id="player2" src="${game.player2_avatar}" alt="">
        <h4 id="datofgame"> ${game.created_at.slice(0, 10)}</h4>

      `;

      } else {
        user1 = 'L';
        user2 = 'W';
        gameDiv.innerHTML = `
        <img id="player1" src="${game.player1_avatar}" alt="">
        <h2 class="player1">${game.player1_name}</h2>
        <h2 style="color: red;" >${user1}</h2>
        <h2 style="color: green;" >${user2}</h2>
        <h2 class="player2">${game.player2_name}</h2>
        <img id="player2" src="${game.player2_avatar}" alt="">
        <h4 id="datofgame"> ${game.created_at.slice(0, 10)}</h4>
      `;
      }
      gamesContainer.appendChild(gameDiv);
    });
    if (username_ === name) {
      tag_win = win;
      tag_los = los;
      tag_unk = other;
    } else {
      tag_los = los;
      tag_win = win;
      tag_unk = other;
    }

}


async function set_pong_score() {
  const data = {
    game_id:2,
    player1_score: 1,
    player2_score: 7,
    player1_name: "afanti", 
    player2_name: "fanti"

  }
  const response = await fetch(pong_game + 'add-game-score/', {
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

  console.log("create game here -----==> : ", jsonData);

  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }

}


export async function get_friends_home() {
  await check_access_token();

  const response = await fetch(api_one + 'user/get-friend-list/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
  });
  const jsonData = await response.json();
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  displayFriendList_home(jsonData.friend_list)
}

async function displayFriendList_home(friendList) {
  friendList =  await Object.values(friendList);
  if (!friendList) {
    console.error('Notification display container not found');
    return;
  }
    const send_friend = document.querySelector('.send_friend_list');
  if (send_friend) {

    send_friend.innerHTML = friendList.map( friend => ` 
      <div class="friends"  data-id="${friend.id}">
      <div class="friend" id="user_id" data-id="${friend.id}">
      <div >  
      <img  id="player1" style="border-radius: 50%;" class="click_friend" data-name="${friend.username}" data-id="${friend.id}"  class="proimage" src="${friend.avatar}" alt="">
      </div>
      <div class="onlinen" data-id="${friend.id}"> </div>
      <h2 class="player1" class="click_friend" >${friend.username}</h2>
      </div>
      
      `).join('');
      send_friend.querySelectorAll('.click_friend').forEach(link => {
        link.addEventListener('click', readit);
      });
    }
    set_onlines(friendList);
}

function readit(event) {
  const name_of_friends = event.target.getAttribute('data-name');
  window.location.hash = `/user/${name_of_friends}`
}

const isValidEmail = signupemail => {
  const re =  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return (re.test(String(signupemail).toLowerCase()));
}

async function update_profile_fun() {
  await check_access_token()
  const update_Email = document.getElementById('update_Email');
  const update_UserName = document.getElementById('update_UserName');
  const new_password = document.getElementById('new_password');
  const old_password = document.getElementById('old_password');
  const check_box = document.getElementById('check_box');

  var boll = true;
  if (update_Email.value !== '') 
    if (!isValidEmail(update_Email.value)){
      boll = false;
    }
  if (new_password.value !== '')
      if (new_password.length < 8){
        boll = false;
      }
  if (boll === true) {
    let formData = new FormData();
    if (photo) formData.append('avatar', photo);
    if (update_Email.value) formData.append('email', update_Email.value);
    if (update_UserName.value) formData.append('username', update_UserName.value);
    if (new_password.value) formData.append('password', new_password.value);
    if (old_password.value) formData.append('old_password', old_password.value);
    formData.append('twofa_active', check_box.checked);

    await update_backend(formData);
    await fetchUserData();
  }
}

async function update_backend(data) {
  const response = await fetch(api + 'auth/update-user/', {
    method: 'PUT',
    headers: {
      'AUTHORIZATION': "Bearer " + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
    body: data
  });
  const jsonData = await response.json();
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
}

export async function send_freinds_request(userna) {
  await check_access_token();

    const data = {
    username: userna
  };

  try {
    var jsonData;
    const response = await fetch(api_one + 'user/send-friend-request/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': "Bearer " + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
     jsonData = await response.json();
    if ("Friend request sent" === jsonData.message){
      document.querySelector('#send_friend_message_text').innerHTML = 'Friend Request Sent';
      document.querySelector('.send_friend_message').style.display = 'flex';
    } if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }    
  } catch (error) {
    if ("Friend request already sent" === jsonData.message){
      document.querySelector('#send_friend_message_text').innerHTML = 'Request Already Sent';
      document.querySelector('.send_friend_message').style.display = 'flex';
    } else{
      document.querySelector('#send_friend_message_text').innerHTML = 'Friend Request Error';
      document.querySelector('.send_friend_message').style.display = 'flex';
    }
    console.error('There was a problem with the fetch operation:', error);
  }
  setTimeout(function() {
    document.querySelector('.send_friend_message').style.display = 'none';
  }, 2000);

}

export async function changeAccess() {
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
    login(jsonData.access, jsonData.refresh, get_localstorage('session_id'));
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

export function set_onlines(users_list) {
  users_list.map(users => {
    const send_friend = document.querySelector('.friends');
    const onlineDiv = send_friend.querySelector(`.onlinen[data-id="${users.id}"]`);
    if (users.is_online)
      onlineDiv.style.backgroundColor = 'green'; 
  })
}

function check_and_set_online(newNotification) {
    const send_friend = document.querySelector('.friends');
    const onlineDiv = send_friend.querySelector(`.onlinen[data-id="${newNotification.user_id}"]`);
    if (onlineDiv) {
      onlineDiv.style.backgroundColor = 'green'; 
    } if (!newNotification.is_online)
      onlineDiv.style.backgroundColor = 'gray'; 
}

export async function check_friends_status() {
  await check_access_token();

  friendsocket = new WebSocket("wss://127.0.0.1:9005/ws/online-status/", ["token", get_localstorage('token'), "session_id", get_localstorage('session_id')]);
    
  friendsocket.onopen = function () {
    console.log('online status Websocket connection established.');
  };
  
  friendsocket.onmessage = async function(event) {
    newNotification = await JSON.parse(event.data);
    check_and_set_online(newNotification);
  };
  friendsocket.onerror = function (error) {
    console.error('Websocket error:', error);
  };
  friendsocket.onclose = function () {
    console.log('Websocket connection closed.');
  };
}

// Define the `checkFirst` function
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
    if (response.status === 404){
      logoutf();
      window.location.hash = '/login';
    }
    if (response.status !== 200) {
      await changeAccess();
      await fetchUserData();
    } 
    else if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
      await fetchUserData();
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

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


    const change_user = document.getElementById('UserName');
    const avata = document.getElementById('avatar');
    const change_image = document.getElementById('image_user');
    const profile_username = document.getElementById('profile_username');
    const update_avatar = document.getElementById('update_avatar');
    const check_bo = document.getElementById('check_box');
    username_ = userData.user_data.username;
    update_avatar.src = userData.user_data.avatar;
    avata.src = userData.user_data.avatar
    change_image.src = userData.user_data.avatar;
    change_user.innerHTML = userData.user_data.username;
    profile_username.innerHTML = userData.user_data.username;
    check_bo.checked = userData.user_data.twofa_active;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

export default Friends;