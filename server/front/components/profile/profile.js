import { loadHTML, loadCSS, player_webSocket } from '../../utils.js';
import {log_out_func,  logoutf, get_localstorage, getCookie, login } from '../../auth.js';

const api = "https://127.0.0.1:9004/api/";
const api_one = "https://127.0.0.1:9005/api/";
var photo = null;
async function Friends() {
  const html = await loadHTML('./components/profile/profile.html');
  loadCSS('./components/profile/profile.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  
  await check_friends_status();
  await checkFirst();
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



  const notific = document.querySelector('.notification');
  const notifi_display = document.querySelector('.notifi_btn');

  notific.addEventListener('click', function() {
    notifi_display.classList.toggle('active');
  })




// // ===== ====== ======= ======== here iwill work with games

// const gamepage = document.getElementById('gamepage');

// gamepage.addEventListener('click', () => {
//   console.log('hello iiiiiiiiii');
//   document.querySelector('.games').style.display = 'flex';
//   document.querySelector('.conta').style.display = 'flex';
// })

// const mer_game = document.getElementById('mer_game');
// const mol_game = document.getElementById('mol_game');

// mer_game.addEventListener('click', () => {
//   console.log("---------");
//   document.querySelector('.conta').style.display = 'none';
//   document.querySelector('.mer_cont').style.display = 'flex';

// })




// const exitPups = document.querySelectorAll('.exit_pup');

// exitPups.forEach(exitPup => {
//   exitPup.addEventListener('click', () => {
//               document.querySelector('.mer_cont').style.display = 'none';
//   document.querySelector('.games').style.display = 'none';
//   document.querySelector('.conta').style.display = 'none';

//   });
// });

// mol_game.addEventListener('click', () => {
//   console.log("hello we are here ");
//   window.location.hash = '/pingpong';
// })


// // ===== ===== ===== ====== ===== ====== ======





}

export async function get_friends_home() {
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
  displayFriendList_home(jsonData.friend_list)
}



function displayFriendList_home(friendList) {
  friendList =  Object.values(friendList);

  if (!friendList) {
    console.error('Notification display container not found');
    return;
  }
    const send_friend = document.querySelector('.send_friend_list');
    
    send_friend.innerHTML = friendList.map( friend => ` 
      <div class="friends"  data-id="${friend.id}">
      <div class="friend" id="user_id" data-id="${friend.id}">
      <div >  
      <i class="bi bi-octagon-fill click_friend" data-name="${friend.username}"> </i>
      <img  id="player1" style="border-radius: 50%;" class="click_friend" data-name="${friend.username}" data-id="${friend.id}"  class="proimage" src="${friend.avatar}" alt="">
      </div>
      <h2 class="player1" class="click_friend" >${friend.username}</h2>
      </div>

    `).join('');
    send_friend.querySelectorAll('.click_friend').forEach(link => {
      link.addEventListener('click', readit);
    });
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
    // const fanti = update_Email.value.trim();
    // console.log('fanti  *', fanti.trim(), "*");
    // console.log('fanti  *', "hello", "*");
    // console.log('email=>  *', update_Email.value.trim(), "*");
    // console.log("hello hello hello hello hello hello hello");
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

  console.log('username=>  ', update_UserName.value);
  console.log('password=>  ', new_password.value);
  console.log('old password=>  ', old_password.value);
  console.log('check box=>  ', check_box.checked);
}




async function update_backend(data) {

  const response = await fetch(api + 'auth/update-user/', {
    method: 'PUT',
    headers: {
      // 'Content-Type': 'multipart/form-data',
      'AUTHORIZATION': "Bearer " + get_localstorage('token')
    },
    credentials: 'include',
    body: data
  });
  console.log("hello -----------------------------");
  const jsonData = await response.json();
  console.log(jsonData);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  

}



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
    // logoutf();
    console.error('There was a problem with the fetch operation:', error);
  }
}


async function check_friends_status() {
  console.log("*******************************");
  let friendsocket = new WebSocket("wss://127.0.0.1:9005/ws/online-status/", ["token", get_localstorage('token')]);
    
  friendsocket.onopen = function () {
    console.log('Websocket connection established.');
  };
  
  friendsocket.onmessage = async function(event) {
    const newNotification = await JSON.parse(event.data);
    console.log("here are socket of friends online => ", newNotification)
    // const isDuplicate = accumulatedNotifications.some(notification => notification.friend_request.id === newNotification.friend_request.id
    // );
    // if (!isDuplicate)
    //   accumulatedNotifications.push(newNotification);

    // await displayNotifications(accumulatedNotifications);
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


  // console.log("*******************************");
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
  // console.log("*******************************");



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
    if (response.status !== 200) {
      console.log('Token is invalid. Attempting to refresh...');
      await changeAccess();
      await fetchUserData();
    } else if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
      const jsonData = await response.json();
      console.log(jsonData);
      console.log('Token verification response:', jsonData);
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
    const avata = document.getElementById('avatar');
    const change_image = document.getElementById('image_user');
    const profile_username = document.getElementById('profile_username');
    const update_avatar = document.getElementById('update_avatar');
    

    update_avatar.src = userData.user_data.avatar;
    avata.src = userData.user_data.avatar
    change_image.src = userData.user_data.avatar;
    change_user.innerHTML = userData.user_data.username;
    profile_username.innerHTML = userData.user_data.username;
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

export default Friends;