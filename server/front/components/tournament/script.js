import { loadHTML, loadCSS, player_webSocket, socket_friend_request, accumulatedNotifications, displayNotifications} from '../../utils.js';
import { log_out_func ,login , logoutf, get_localstorage, getCookie, check_access_token } from '../../auth.js';
import { assingDataToGameData, statePongGameToTournament } from '../ping/script.js';
import {checkFirst} from '../home/home.js';
// import {changeAccess} from '../profile/profile.js';
const host = "127.0.0.1";

let tournament = `https://${host}:9008/api/tournament/`;

let tournament_data;
var api = `https://${host}:9004/api/`;
var api_game = `https://${host}:9006/api/gamedb/`;
let game_socket = `wss://${host}:9006/ws/game-db/`
let name = "";
let tournament_match_data;

async function Tournament() {
  const html = await loadHTML('./components/tournament/index.html');
  loadCSS('./components/tournament/style.css');

  localStorage.removeItem('statePongGame')
  console.log("here is data of me =:> ", tournament_data);
  const app = document.getElementById('app');
  app.innerHTML = html;
  setHeaderContent();
  await define_object_matches();
  setNaveBarContent();
  await checkFirst();
  if (!socket_friend_request)
    player_webSocket();
  else
    displayNotifications(accumulatedNotifications);
  updateContent();


  const logout = document.getElementById('logout')
  
  logout.addEventListener('click', log_out_func);

  window.addEventListener('resize', updateContent);
}

export {tournament_match_data};

function updateContent() {
  const contentDiv = document.getElementById('content');
  const width = window.innerWidth;
  if (window.location.hash === '#/tournament') {
  
    if (width < 1235) {
      set_players_s1();
    } else {
      set_players_h();
    }
  }
}

function errors_fun(message) {
  const game_tag_err = document.getElementById('game_tag_err');
  game_tag_err.innerHTML = `<i class="bi bi-check2-circle"></i> ${message}`;

  document.querySelector('.success_update').style.display = "flex";
  setTimeout(function() {
    document.querySelector('.success_update').style.display = 'none';
}, 2000);
}

async function start_tournament_match(params) {
  console.log("====>> ", params);
  await check_access_token();

    const participant = {
      match_id: params.matchNumber,
      tournament_id: params.tournamentId,
    }
    // const data = JSON.parse(participant);
    const urlEncodedData = new URLSearchParams(participant);
    console.log("djskfjksdjfksjd fsdfkjdsj =====? ", participant)
    console.log("hello we are from morocco ")
    const response = await fetch(tournament + 'start-match/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
      body: urlEncodedData
    });

    console.log(response);
    const jsonData = await response.json();
    if (response.status !== 200) {
      errors_fun(jsonData.message)
    }
    console.log(jsonData);
  
      // await login(jsonData.access, jsonData.refresh);
      
    // await add_tournament_match_scire(params);
    return response.status;

}
// add-match-score


async function add_tournament_match_score(params) {
  const participants = {
    match_id: params.matchNumber,
    tournament_id: params.tournamentId,
    player_one_score: 5, 
    player_two_score: 7,
  }

  const urlEncodedData = new URLSearchParams(participants);
  console.log("hello we are from morocco ")
  try {
    const response = await fetch(tournament + 'add-match-score/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
      body: urlEncodedData
    });
    const jsonData = await response.json();
    console.log("here are match add score: =>  ", jsonData);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('There was a problem with the fetch e here operation:', error);
  }

}

async function define_object_matches() {
  await check_access_token();

    try {
      const response = await fetch(tournament + 'check-tournament/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + get_localstorage('token'),
          'Session-ID': get_localstorage('session_id')
        },
        credentials: 'include',
      });
      console.log(response);
  
      const jsonData = await response.json();
      if (jsonData.message === 'there is no unfinished tournament')
          window.location.hash = '/ping';
      tournament_data = jsonData.tournament_matches;
      console.log("last what happened==> ", jsonData);
      console.log("here is messae: ", tournament_data[0])

      console.log("here are checked if there is any tournament or no ==>   ", jsonData);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  
    
}


async function get_stage() {
  const participants = {
    tournament_id: 0
  }
  const urlEncodedData = new URLSearchParams(participants);

    try {
      const response = await fetch(tournament + 'get-next-stage/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer ' + get_localstorage('token'),
          'Session-ID': get_localstorage('session_id')
        },
        credentials: 'include',
        body: urlEncodedData
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

function set_players_h() {
  // document.querySelector('.matches_hist').style.flexDirection = '';
  const main_content  = document.getElementById('players_sh_content');
  main_content.innerHTML = `
              <div class="matches_hist" style={{ display: 'flex', flexDirection: '' }}>

                <div class="first_match">
                    <div class="match_n1 string">
                      <p id="player1_match1" class="player_name">${tournament_data[0].playerOneName} <span class="left_score">${tournament_data[0]?.playerOneScore }</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match1" class="player_name"> ${tournament_data[0].playerTwoName}<span class="left_score">${tournament_data[0]?.playerTwoScore }</span></p>
                    </div>
                    <div class="match_n2 string">
                        <p id="player1_match2" class="player_name"> ${tournament_data[1].playerOneName}<span class="left_score">${tournament_data[1]?.playerOneScore }</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match2" class="player_name"> ${tournament_data[1].playerTwoName}<span class="left_score">${tournament_data[1]?.playerTwoScore }</span></p>
                    </div>
                </div>


                <div class="center_matches">
                    <fiv class="match_2">
                        <p id="player1_match5" class="player_name topp"> ${tournament_data[4]?.playerOneName ? tournament_data[4].playerOneName : ''} <span class="left_score">${tournament_data[4]?.playerOneScore === 0 ? '0' : tournament_data[4]?.playerOneScore || ''}</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match5" class="player_name downn">  ${tournament_data[4]?.playerTwoName ? tournament_data[4].playerTwoName : ''}<span class="left_score">${tournament_data[4]?.playerTwoScore === 0 ? '0' : tournament_data[4]?.playerTwoScore || ''}</span></p>

                    </fiv>
                    <fiv class="match_final">
                        <p id="player1_match7" class="player_name">${tournament_data[6]?.playerOneName ? tournament_data[6].playerOneName : ''}<span class="left_score">${tournament_data[6]?.playerOneScore === 0 ? '0' : tournament_data[6]?.playerOneScore || ''}</span></p>
                        <h2>Vs</h2>
                        <p id="player2_match7" class="player_name ">${tournament_data[6]?.playerTwoName ? tournament_data[6].playerTwoName : ''}<span class="left_score">${tournament_data[6]?.playerTwoScore === 0 ? '0' : tournament_data[6]?.playerTwoScore || ''}</span></p>

                    </fiv>
                    <fiv class="match_2">
                        <p id="player1_match6"  class="player_name topp right_p"> <span class="right_score">${tournament_data[5]?.playerOneScore === 0 ? '0' : tournament_data[5]?.playerOneScore || ''}</span> ${tournament_data[5]?.playerOneName ? tournament_data[5].playerOneName : ''} </p>
                        <h2>Vs</h2>
                        <p id="player2_match6"  class="player_name downn right_p"><span class="right_score">${tournament_data[5]?.playerTwoScore === 0 ? '0' : tournament_data[5]?.playerTwoScore || ''}</span> ${tournament_data[5]?.playerTwoName ? tournament_data[5].playerTwoName : ''}</p>

                    </fiv>
                </div>


                <div class="first_match">
                    <div class="match_n1 string">
                        <p id="player1_match3" class="player_name right_p"><span class="right_score" id="scoore">${tournament_data[2]?.playerOneScore }</span> ${tournament_data[2].playerOneName}</p>
                        <h2>Vs</h2>
                        <p id="player2_match3" class="player_name right_p"><span class="right_score">${tournament_data[2]?.playerTwoScore }</span>${tournament_data[2].playerTwoName} </p>
                    </div>
                    <div class="match_n2 string">
                        <p id="player1_match4" class="player_name right_p"><span class="right_score">${tournament_data[3]?.playerOneScore }</span>${tournament_data[3].playerOneName} </p>
                        <h2>Vs</h2>
                        <p id="player1_match4" class="player_name right_p"><span class="right_score">${tournament_data[3]?.playerTwoScore }</span>${tournament_data[3].playerTwoName} </p>
                    </div>
                </div>
            </div>
            <div class="winner_nextgame">
                <h2 id="next_match">Start Match  <i class="bi bi-arrow-right-circle-fill"></i></h2>
            </div>

  `
  const next_match = document.getElementById('next_match');
  next_match.addEventListener('click', async () => {
    let i = 0;
    console.log("tournament_data.tournament_matches");
    await define_object_matches();
    console.log(tournament_data.tournament_matches);
    console.log("tournament_data.tournament_matches");
    while (tournament_data[i]) {
      if (tournament_data[i].status === "upcoming") {
         const status = await start_tournament_match(tournament_data[i]);
         if (status === 200) {
          localStorage.setItem("statePongGame", "tournament")

           tournament_match_data = tournament_data[i];
           assingDataToGameData(tournament_match_data);
           statePongGameToTournament();
           window.location.hash = '/pingpong';
          }
      }
      i++;
    }  
  })

}

function set_players_s1() {
  // document.querySelector('.matches_hist').style.flexDirection = 'column';
  const main_content  = document.getElementById('players_sh_content');
  main_content.innerHTML = `
   <div class="matches_hist"  style="flex-direction: column;">
            <h3 id="text-final">1/4</h3>
            <div class="first_8">
            <div class="first_match">
                <div class="match_n1 string">
                    <p id="player1_match1" class="player_name"> ${tournament_data[0]?.playerOneName ? tournament_data[0].playerOneName : ''} <span class="left_score">${tournament_data[0]?.playerOneScore }</span></p>
                    <h2>Vs</h2>
                    <p id="player2_match1" class="player_name">${tournament_data[0]?.playerTwoName ? tournament_data[0].playerTwoName : ''} <span class="left_score">${tournament_data[0]?.playerTwoScore }</span></p>
                </div>
                <div class="match_n2 string">
                    <p id="player1_match2" class="player_name">${tournament_data[1]?.playerOneName ? tournament_data[1].playerOneName : ''}  <span class="left_score">${tournament_data[1]?.playerOneScore }</span></p>
                    <h2>Vs</h2>
                    <p id="player2_match2" class="player_name">${tournament_data[1]?.playerTwoName ? tournament_data[1].playerTwoName : ''} <span class="left_score">${tournament_data[1]?.playerTwoScore }</span></p>
                </div>
            </div>
            <div class="first_match">
                <div class="match_n1 string">
                    <p id="player1_match3" class="player_name right_p"><span class="right_score" id="scoore">${tournament_data[2]?.playerOneScore}</span> ${tournament_data[2].playerOneName}</p>
                    <h2>Vs</h2>
                    <p id="player2_match3" class="player_name right_p"><span class="right_score">${tournament_data[2]?.playerTwoScore}</span> ${tournament_data[2].playerTwoName}</p>
                </div>
                <div class="match_n2 string">
                    <p id="player1_match4" class="player_name right_p"><span class="right_score">${tournament_data[3]?.playerOneScore }</span>${tournament_data[3].playerOneName}  </p>
                    <h2>Vs</h2>
                    <p id="player1_match4" class="player_name right_p"><span class="right_score">${tournament_data[3]?.playerTwoScore }</span>${tournament_data[3].playerTwoName} </p>
                </div>
            </div>


            </div>
            <h3 id="text-final">1/2</h3>

            <div class="center_matches">
                <fiv class="match_2">
                    <p id="player1_match5" class="player_name topp"> ${tournament_data[4]?.playerOneName ? tournament_data[4].playerOneName : ''} <span class="left_score">${tournament_data[4]?.playerOneScore === 0 ? '0' : tournament_data[4]?.playerOneScore || ''}</span></p>
                    <h2>Vs</h2>
                    <p id="player2_match5" class="player_name downn"> ${tournament_data[4]?.playerTwoName ? tournament_data[4].playerTwoName : ''}<span class="left_score">${tournament_data[4]?.playerTwoScore === 0 ? '0' : tournament_data[4]?.playerTwoScore || ''}</span></p>

                </fiv>
                <fiv class="match_2">
                    <p id="player1_match6"  class="player_name topp right_p"> <span class="right_score">${tournament_data[5]?.playerOneScore === 0 ? '0' : tournament_data[5]?.playerOneScore || ''}</span> ${tournament_data[5]?.playerOneName ? tournament_data[5].playerOneName : ''} </p>
                    <h2>Vs</h2>
                    <p id="player2_match6"  class="player_name downn right_p"><span class="right_score">${tournament_data[5]?.playerTwoScore === 0 ? '0' : tournament_data[5]?.playerTwoScore || ''}</span> ${tournament_data[5]?.playerTwoName ? tournament_data[5].playerTwoName : ''} </p>

                </fiv>
            </div>
            <h3 id="text-final">1/1</h3>

            <fiv class="match_final">
                <p id="player1_match7" class="player_name">${tournament_data[6]?.playerOneName ? tournament_data[6].playerOneName : ''}<span class="left_score">${tournament_data[6]?.playerOneScore === 0 ? '0' : tournament_data[6]?.playerOneScore || ''}</span></p>
                <h2>Vs</h2>
                <p id="player2_match7" class="player_name ">${tournament_data[6]?.playerTwoName ? tournament_data[6].playerTwoName : ''}<span class="left_score">${tournament_data[6]?.playerTwoScore === 0 ? '0' : tournament_data[6]?.playerTwoScore || ''}</span></p>

            </fiv>

        </div>
            <div class="winner_nextgame">
                <h2 id="next_match">Start Match  <i class="bi bi-arrow-right-circle-fill"></i></h2>
            </div>

  `
  const next_match = document.getElementById('next_match');
  next_match.addEventListener('click', async () => {
    let i = 0;
    console.log("tournament_data.tournament_matches");
    await define_object_matches();
    console.log(tournament_data.tournament_matches);
    console.log("tournament_data.tournament_matches");
    while (tournament_data[i]) {
      if (tournament_data[i].status === "upcoming") {
         const status = await start_tournament_match(tournament_data[i]);
         if (status === 200) {

           tournament_match_data = tournament_data[i];
           assingDataToGameData(tournament_match_data);
           statePongGameToTournament();
           window.location.hash = '/pingpong';
          }
      }
      i++;
    }  
  })

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

export default Tournament;
