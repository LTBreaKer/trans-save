import { loadHTML, loadCSS, player_webSocket} from '../../utils.js';
import { log_out_func ,login , logoutf, get_localstorage, getCookie } from '../../auth.js';
import {tournament_data, tournament} from '../ping/script.js';
let tournament_here = tournament_data;
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
  player_webSocket();
  set_players_sh();


  const logout = document.getElementById('logout')
  
  logout.addEventListener('click', log_out_func);

  const next_match = document.getElementById('next_match');
  
  next_match.addEventListener('click', async () => {

    console.log(tournament_data.tournament_matches);
    tournament_data.tournament_matches.map(element => {
      console.log("hello we ar")
      console.log(tournament_data);
        console.log("==> ", element);
    });

  //   const participants = {
  //     match_id: name,
  //     tournament_id: kdfj
  //   }


  //   console.log("hello we are from morocco ")
  //   try {
  //     const response = await fetch(tournament + 'start-match/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'Bearer ' + get_localstorage('token'),
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify(participants)
  //     });
  //     console.log(response);
  //     const jsonData = await response.json();
  //     console.log(jsonData);
  
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     }
  //     // await login(jsonData.access, jsonData.refresh);
      
  //   } catch (error) {
  //     console.error('There was a problem with the fetch e here operation:', error);
  //   }
  
  })

  // console.log(tournament_data.tournament_matches)
  // console.log(tournament_data.tournament_matches[0])
  // const scoore = document.getElementById('scoore');
  // scoore.innerText = "4";

  // match3_player2.innerText = "hello";

  // const notific = document.querySelector('.notification');
  // const notifi_display = document.querySelector('.notifi_btn');

  // notific.addEventListener('click', function() {
  //   notifi_display.classList.toggle('active');
  // })
  // const butt = document.querySelector('#butt');
  // const side = document.querySelector('.sidebar');

  // butt.addEventListener('click', function() {
  //   side.classList.toggle('active');
  // });

  // document.addEventListener('click', (event) => {
  //   if (!side.contains(event.target) && !butt.contains(event.target)) {
  //     side.classList.remove('active');
  //   }
  // });

  get_stage();
}


async function get_stage() {
  const participants = {
    tournament_id: 11
  }
    try {
      const response = await fetch(tournament + 'get-next-stage/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + get_localstorage('token'),
        },
        credentials: 'include',
        body: JSON.stringify(participants)
      });
      console.log(response);
      const jsonData = await response.json();
      console.log("here stage or next stage=> ", jsonData);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // await login(jsonData.access, jsonData.refresh);
      
    } catch (error) {
      console.error('There was a problem with the fetch e here operation:', error);
    }



}

function set_players_sh() {
  const main_content  = document.getElementById('players_sh_content');

  main_content.innerHTML = `
              <div class="matches_hist">

                <div class="first_match">
                    <div class="match_n1 string">
                      <p id="player1_match1" class="player_name">${tournament_data?.tournament_matches[0].playerOneName} <span class="left_score">8</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match1" class="player_name"> ${tournament_data?.tournament_matches[0].playerTwoName}<span class="left_score">5</span></p>
                    </div>
                    <div class="match_n2 string">
                        <p id="player1_match2" class="player_name"> ${tournament_data?.tournament_matches[1].playerOneName}<span class="left_score">5</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match2" class="player_name"> ${tournament_data?.tournament_matches[1].playerOneName}<span class="left_score">5</span></p>
                    </div>
                </div>


                <div class="center_matches">
                    <fiv class="match_2">
                        <p id="player1_match5" class="player_name topp"> <span class="left_score">5</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match5" class="player_name downn"> <span class="left_score">5</span></p>

                    </fiv>
                    <fiv class="match_final">
                        <p id="player1_match7" class="player_name"><span class="left_score">5</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match7" class="player_name "><span class="left_score">5</span></p>

                    </fiv>
                    <fiv class="match_2">
                        <p id="player1_match6"  class="player_name topp right_p"> <span class="right_score">5</span>  </p>
                        <h2>Vs</h2>
                        <p id="player2_match6"  class="player_name downn right_p"><span class="right_score">5</span> </p>

                    </fiv>
                </div>


                <div class="first_match">
                    <div class="match_n1 string">
                        <p id="player1_match3" class="player_name right_p"><span class="right_score" id="scoore"></span> ${tournament_data?.tournament_matches[2].playerOneName}</p>
                        <h2>Vs</h2>
                        <p id="player2_match3" class="player_name right_p"><span class="right_score">5</span>${tournament_data?.tournament_matches[2].playerOneName} </p>
                    </div>
                    <div class="match_n2 string">
                        <p id="player1_match4" class="player_name right_p"><span class="right_score">5</span>${tournament_data?.tournament_matches[3].playerOneName} </p>
                        <h2>Vs</h2>
                        <p id="player1_match4" class="player_name right_p"><span class="right_score">5</span>${tournament_data?.tournament_matches[3].playerOneName} </p>
                    </div>
                </div>
            </div>
            <div class="winner_nextgame">
                <h2 id="next_match">Start Match  <i class="bi bi-arrow-right-circle-fill"></i></h2>
                <div class="winneer">
                    <h2 id="winn">Winner <i class="bi bi-trophy-fill"></i></h2>
                    <h3><i class="bi bi-trophy "></i> winner name</h3>
                    <hr id="line1">
                    <hr id="line2">
                    <hr id="line3">
                </div>
            </div>

  `
}

export function setHeaderContent() {
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

    const notific = document.querySelector('.notification');
    const notifi_display = document.querySelector('.notifi_btn');
  
    notific.addEventListener('click', function() {
      notifi_display.classList.toggle('active');
    })
  
}

export function setNaveBarContent() {
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
