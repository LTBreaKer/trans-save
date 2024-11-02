
import { loadHTML, loadCSS, player_webSocket, socket_friend_request, accumulatedNotifications, displayNotifications } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage } from '../../auth.js';
import {tag_game_info} from '../ta/script.js'
import {check_friends_status, changeAccess , friendsocket} from '../profile/profile.js'
import {setHeaderContent, setNaveBarContent} from '../tournament/script.js';
import { host } from '../../config.js';


var api = `https://${host}:9004/api/`;
var api_game = `https://${host}:9007/api/`;
var api1 = `https://${host}:9005/api/`;
async function Home() {
  const html = await loadHTML('./components/home/home.html');
  
  const app = document.getElementById('app');
  app.innerHTML = html;
  await loadCSS('./components/home/home.css');
  
  setHeaderContent();
  setNaveBarContent();
  if (!friendsocket || friendsocket.readyState === WebSocket.CLOSED)
    await check_friends_status();
  await checkFirst();
  if (!socket_friend_request)
    player_webSocket();
  else
    displayNotifications(accumulatedNotifications);
  
  const logout = document.getElementById('logout')
  logout.addEventListener('click', log_out_func);

// =========================== here i will work with media ===========================


// ===== ===== ===== ====== ===== ====== ======

const backimage = document.getElementById('backimage');
backimage.addEventListener('click', ()=> {
  window.location.hash = '/ta';
})

const pingimage = document.getElementById('pingimage');
pingimage.addEventListener('click', ()=> {
  window.location.hash = '/ping';
})

}
export async function checkFirst() {
  console.log("fetch data from here home");
  const token = get_localstorage('token');
  console.log("token from check token : ", token);
  try {
    const response = await fetch(api + 'auth/verify-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token }) 
    });
    const jsonData = await response.json();

    console.log("===== verify user -->    ", jsonData);
    console.log("=====code status-->    ",response.status);
    if (response.status === 404){
      logoutf();
      window.location.hash = '/login';
    }
    if (response.status !== 200) {
      await changeAccess();
      await fetchUserHomeData();
    } else if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
      await fetchUserHomeData();
    }
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function fetchUserHomeData() {
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
    const change_imge = document.getElementById('image_user');
    
    change_user.innerHTML = userData.user_data.username;
    change_imge.src = userData.user_data.avatar;
  } catch(error)  {
    console.error('There was a problem with the fetch operation:', error);
  }
}

export default Home;


