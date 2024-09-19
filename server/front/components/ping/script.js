import { loadHTML, loadCSS } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';
var api = "https://127.0.0.1:9004/api/";
var api_game = "https://127.0.0.1:9006/api/gamedb/";
let name = "";
let html = "";

async function Ping() {
  if (!html){
    console.log("dkhal hna hhhhh ----------- ");
    html = await loadHTML('./components/ping/index.html');
  }
  // loadCSS('./components/ping/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  await checkFirst();


  const local_butt_game = document.getElementById('local_butt_game');
  const input = document.getElementById('input');
  name = input.value; 
  local_butt_game.addEventListener('click', localgame);

}



// import { setCookie, deleteCookie } from './cookie.js';
// import PingPong from '../pingpong/ping.js';
// import { playGame } from '../../pong-game/local/src/network/events.js';
export let gameApi;

export async function localgame() {
  if (typeof input !== 'undefined')
    name = input.value;
  else
    name = JSON.parse(gameApi).player2_name;
  console.log("name of user: ", name);
  const data = {
    player2_name: name
  };

  try {
    const response = await fetch(api_game + 'create-local-game/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + get_localstorage('token'),
      },  
      credentials: 'include',
      body: JSON.stringify(data)
    });
    console.log("response: ", response);
    const jsonData = await response.json();
    // console.log("jsonData: ", jsonData);
    // console.log("jsonData.stringify(): ", JSON.stringify(jsonData));
    gameApi = JSON.stringify(jsonData);
    // setCookie("match", JSON.stringify(jsonData));


    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    else if (window.location.hash == "#/pingpong") {
      console.log("###pingpong");
      // await playGame();
    }
    // await PingPong();
    else
      window.location.hash = "/pingpong";
  // await login(jsonData.access, jsonData.refresh);
  
} catch (error) {
  console.error('There was a problem with the fetch operation:', error);
}

// window.location.hash = "/pingpong";



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
      const jsonData = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      await login(jsonData.access, jsonData.refresh);
      
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }
  
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
      if (response.status !== 200) {
        await changeAccess();
        await fetchUserHomeData();
      } else if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      } else {
        const jsonData = await response.json();
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
          'Authorization': 'Bearer ' + get_localstorage('token')
        },
        credentials: 'include',
      });
      
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
  

export default Ping;
