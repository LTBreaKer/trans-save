import { loadHTML, loadCSS, player_webSocket } from '../../utils.js';
import {log_out_func,  logoutf, get_localstorage, getCookie, login } from '../../auth.js';

const api = "https://127.0.0.1:9004/api/";
const api_one = "https://127.0.0.1:9005/api/";
// user/send-friend-request/
var photo = "";
async function Profile() {
  const html = await loadHTML('./components/profile/profile.html');
  loadCSS('./components/profile/profile.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  
  await checkFirst();
  
  // await player_webSocket();

  const editProfileButton = document.querySelector('.edit_profi');
  const updateProfile = document.querySelector('.update_data');
  const close_edite = document.querySelector('.bi-x');
  const update_btn = document.getElementById('update_btn');

  update_btn.addEventListener('click', await update_profile_fun);
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
      console.log('Search query:', query);

  }

  })


  // const formData = new FormData();
  // formData.append('profile_photo', file);


const update_avatar = document.getElementById('update_avatar');
if (update_avatar === null)
    console.log("nothing");
update_avatar.addEventListener('change', function(event) {
  console.log("----------------ddd---------");
  const file = event.target.files[0];

  // photo = file;

  const formData = new FormData();
  formData.append('myFile', event.target.files[0]);
  if (file) {

    const formData = new FormData();
    formData.append('avatar', file);

    photo = formData;

    const reader = new FileReader();
        
    reader.onloadend = function() {
        const base64String = reader.result; // Remove the data URL prefix
        // photo = base64String;
        console.log(base64String);
        // const jsonPayload = JSON.stringify({
        //     avatar: base64String
        // });

    // const reader = new FileReader();
    // console.log(reader);
    // reader.onload = function(e) {
    //     photo = e.target.result;
    };
    
    // photo = reader.readAsDataURL(file);
    console.log("reader ====>   ",reader.readAsDataURL(file));
  }

});

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
      // set_error("Provide a Vallid email address");
      boll = false;
    }
  if (new_password.value !== '')
      if (new_password.length < 8){
        // set_error('Password must be at least 8 characters')
        boll = false;
      }

  if (boll === true) {
    console.log("===================photo ===== >       ",photo);
    const fanti = update_Email.value.trim();
    console.log('fanti  *', fanti.trim(), "*");
    console.log('fanti  *', "hello", "*");
    console.log('email=>  *', update_Email.value.trim(), "*");
    console.log("hello hello hello hello hello hello hello");
    const data = {
      twofa_active: check_box.checked,
    }
    if (update_UserName.value !== '')
      data.username = update_UserName.value;
    if (update_Email.value !== '')
      data.email = update_Email.value;
    if (new_password.value !== '')
      data.password = new_password.value;
    if (old_password.value !== '')
      data.old_password = old_password.value;
    if (photo !== "")
        data.avatar = photo;
    await update_backend(data);
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
      'Content-Type': 'application/json',
      'AUTHORIZATION': "Bearer " + get_localstorage('token')
    },
    credentials: 'include',
    body: JSON.stringify(data)
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
    const jsonData = await response.json();
    console.log(jsonData);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // await login(jsonData.access, jsonData.refresh);

  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }

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
  const subprotocols = ['token', get_localstorage('token')];

  const socket = new WebSocket('wss://127.0.0.1:9005/ws/friend-requests/ ', subprotocols);
  socket.onmessage = function(event) {
    console.log('Message from server:', event.data);
    
    try {
      const data = JSON.parse(event.data);
      console.log('Parsed data:', data);
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  };
  console.log("*******************************");



  const token = get_localstorage('token');
  
  console.log('Token being checked:', token); // Debugging statement
  console.log("--------------------------------------", api);
  try {
    const response = await fetch(api + 'auth/verify-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrftoken, // Uncomment if needed
      },
      credentials: 'include',
      body: JSON.stringify({ token }) // Sending token in the body
    });
    console.log(response);
    if (response.status !== 200) {
      console.log('Token is invalid. Attempting to refresh...');
      await changeAccess();
      // After refreshing, retry fetching user data
      console.log("lkfjkdsjfkljsdlkfjklsdjflkjsdlkf");
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

export default Profile;
