import { loadHTML, loadCSS } from '../../utils.js';
import { log_out_func ,login , logoutf, get_localstorage, getCookie } from '../../auth.js';
var api = "https://127.0.0.1:9004/api/";
var api_game = "https://127.0.0.1:9006/api/gamedb/";
let game_socket = "wss://127.0.0.1:9006/ws/game-db/"
let name = "";

async function Tournament() {
  const html = await loadHTML('./components/tournament/index.html');
  loadCSS('./components/tournament/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  setHeaderContent();
  setNaveBarContent();
  await checkFirst();
  const logout = document.getElementById('logout')
  
  logout.addEventListener('click', log_out_func);
  const notific = document.querySelector('.notification');
  const notifi_display = document.querySelector('.notifi_btn');

  notific.addEventListener('click', function() {
    notifi_display.classList.toggle('active');
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

function setHeaderContent() {
    const header = document.querySelector('.header');
    header.innerHTML = `
        <div class="profile">
            <div class="notification">
                <h3><i class="bi bi-bell"></i></h3>
            </div>
            <div class="text">
                <h3 id="UserName"></h3>
            </div>
            <div class="image">
                <img id="image_user" src="" alt="profile photo">
            </div>
        </div>
        <div class="notifi_btn"></div>
        <i id="butt" class="bi bi-justify"></i>
    `;
}

function setNaveBarContent() {
    const nav_ba = document.querySelector('.navbar');
    nav_ba.innerHTML = `
        <div class="image-text">
                <img src="../../images/login/logo.webp" alt="logo">
        </div>
        <nav class="sidebar close">
        
            <div class="menu-bar toggle">
                
                <div class="menu">
                    <ul class="menu-links">
                        <li class="nav-link"  id="homepage">
                            <a href="#/">
                                <i class='bx bx-home  icon' ></i>
                            </a>
                        </li>
                        <li class="nav-link"  id="profilepage">
                            <a href="#/profile">
                                <i class="bi bi-person icon"></i>
                            </a>
                        </li>

                    </ul>
                </div>
                <div class="bottom-content">
                    <li id="logout">
                        <a href="#">
                            <i class='bx bx-log-out  icon' ></i>
                        </a>
                    </li>
                </div>
            </div>
        </nav>
`;
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
  

export default Tournament;
