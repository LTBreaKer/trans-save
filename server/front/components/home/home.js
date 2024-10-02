
import { loadHTML, loadCSS, player_webSocket } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';
import {tag_game_info} from '../ta/script.js'
import {check_friends_status} from '../profile/profile.js'



var api = "https://127.0.0.1:9004/api/";
var api_game = "https://127.0.0.1:9007/api/";
var api1 = "https://127.0.0.1:9005/api/";
async function Home() {
  const html = await loadHTML('./components/home/home.html');
  
  const app = document.getElementById('app');
  app.innerHTML = html;
  await loadCSS('./components/home/home.css');
  

  check_friends_status();
  await checkFirst();
  player_webSocket();
  // await get_friends();

  const logout = document.getElementById('logout')
  logout.addEventListener('click', log_out_func);

// =========================== here i will work with media ===========================

// i will work with #butt

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

  const notific = document.querySelector('.notification');
  const notifi_display = document.querySelector('.notifi_btn');

  notific.addEventListener('click', function() {
    notifi_display.classList.toggle('active');
  })

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


// async function local_game_func() {
//   const player_name = document.getElementById('input');
//   const name = player_name.value;
//   const data = {
//     player2_name: name
//   };
//   window.location.hash = '/game';
// }



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
    const jsonData = await response.json();
    await fetchUserHomeData();

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

export default Home;


