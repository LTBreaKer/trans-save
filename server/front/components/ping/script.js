import { loadHTML, loadCSS, player_webSocket, socket_friend_request, remove_ping_remote_game, remove_game_pong_f_database, accumulatedNotifications, displayNotifications } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie, check_access_token } from '../../auth.js';
import { changeAccess } from '../profile/profile.js';
import {checkFirst} from '../home/home.js';;
import { host } from '../../config.js';
// const host = "127.0.0.1";

var api = `https://${host}:9004/api/`;
var api_game = `https://${host}:9006/api/gamedb/`;
let game_socket = `wss://${host}:9006/ws/game-db/`;
let tournament = `https://${host}:9008/api/tournament/`
const url = `https://${host}:9006/api/gamedb/add-game-score/`;

let name = "";
let html = "";
export let game_data;
// export let gameApi;
export let statePongGame = '';
export let _player_webSocket;
let tournament_data;
let tournament_name;

export function assingGameApiToNULL() {
  game_data = null;
}

export function assingDataToGameData(data) {
  data.player1_id = data.playerOneId;
  data.player2_id = data.playerTwoId;
  data.player1_name = data.playerOneName;
  data.player2_name = data.playerTwoName;
  game_data = data;
}

export function statePongGameToTournament() {
  statePongGame = "tournament";
}

export async function sendPlayerPaddleCreated(){
  console.log("----------------  sendPlayerPaddleCreated  --------------------------");
  let data = game_data;
  console.log("data.name_current_user : ", data.name_current_user)
  console.log("data.player1_name : ", data.player1_name)
  let player_id = (data.name_current_user === data.player1_name)
    ? data.player1_id : data.player2_id;
    console.log("player_id: ", player_id);
	const ws = await _player_webSocket;
	if (ws && ws.readyState == 1) {
		await ws.send(JSON.stringify ({
      'message': 'player_connected',
      'game_id': data.game_id,
      'player_id': player_id,
    }));
  }
}

async function create_tournament_function(participants) {
  await check_access_token();
  console.log("=====================================================");
  try {
    const response = await fetch(tournament + 'create-tournament/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
      body: JSON.stringify(participants)
    });
    console.log(response);
    const jsonData = await response.json();
    console.log(jsonData);
    tournament_data = jsonData;
    // window.location.hash = "/tournament";
    if (jsonData.message === "tournament created")
      window.location.hash = "/tournament";
    if (response.status !== 200){
      if (jsonData.message.startsWith('Invalid username')){
        errorhere('invalid username');
      }
      else if (jsonData.message) {
        errorhere(jsonData.message);
      }
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }


}

async function Ping() {
  
  if (!html)
    html = await loadHTML('./components/ping/index.html');
  
  const app = document.getElementById('app');
  app.innerHTML = html;
  let user_name = await fetchUserName()
  document.getElementById("description").textContent = `In local game ${user_name.toUpperCase()} moves using the keys W and S; While in the remote game uses the arrow keys (Up and Down). And the opponent uses the arrow keys (Up and Down).`

  if (localStorage.getItem("dataPongMatch"))
    await pong_game_score();

  await remove_ping_remote_game();
  await remove_game_pong_f_database();

  await checkFirst();
  if (!socket_friend_request)
    player_webSocket();
  else
    displayNotifications(accumulatedNotifications);


  setNotification();
  const butt = document.querySelector('#butt');
  const side = document.querySelector('.gm_sidebar');

  butt.addEventListener('click', function() {
    side.classList.toggle('active');
  });

  document.addEventListener('click', (event) => {
    if (!side.contains(event.target) && !butt.contains(event.target)) {
      side.classList.remove('active');
    }
  });
  const local_butt_game = document.getElementById('local_butt_game');
  const btn_ai = document.getElementById('btn_ai');
  const remote_butt_game = document.getElementById('butt_game');
  const cancel_game_func = document.getElementById('cancel_game');
  const logout = document.getElementById('logout')
  
  logout.addEventListener('click', log_out_func);

  cancel_game_func.addEventListener('click', async () => {
    await remove_ping_remote_game();
  })



  const input = document.getElementById('input');
  name = input.value; 
  local_butt_game.addEventListener('click', localgame);
  btn_ai.addEventListener('click', aiGame);
  remote_butt_game.addEventListener('click', remore_game_fun);
  _player_webSocket = await connectPlayerSocket();


// here i'm working with tournament and players

  const start_tournament = document.getElementById('btn_tournament');
  const tournament_players = document.querySelector('.tournament_players');
  const tournament_close = document.querySelector('.bi-x');

  start_tournament.addEventListener('click', async () => {
    console.log("hello wa9ila khasoo yji hnaaa");
    await check_tournament_finish();
    tournament_players.style.display = 'flex';
    document.getElementById("player1").value = tournament_name ? tournament_name : "";
  })

  tournament_close.addEventListener('click', () => {
    tournament_players.style.display = 'none';
  })

  const tournament_star = document.getElementById('start_tournament');
  tournament_star.addEventListener('click', async () => {
  const user1 = document.getElementById("player1").value;
  const user2 = document.getElementById("player2").value;
  const user3 = document.getElementById("player3").value;
  const user4 = document.getElementById("player4").value;
  const user5 = document.getElementById("player5").value;
  const user6 = document.getElementById("player6").value;
  const user7 = document.getElementById("player7").value;
  const user8 = document.getElementById("player8").value;

  console.log(user1, user2, user3, user4, user5, user6, user7, user8);

  if (user1 === "" || user2 === "" || user3 === "" || user4 === "" || user5 === "" || user6 === "" || user7 === "" || user8 === "" ) {
    console.log("fanti error hna hhhhhh");
  }
  else {
    const data = {  participants:
      [user1, user2, user3, user4, user5, user6, user7, user8]
    };
    await create_tournament_function(data)
  }
  })  
}

async function check_tournament_finish() {
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
    console.log("here is messae: ", jsonData.message)
    console.log("here are checked if there is any tournament or no ==>   ", jsonData);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    if (jsonData.message === "tournament unfinished"){
      window.location.hash = "/tournament";

    }
    // await login(jsonData.access, jsonData.refresh);
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }

}

export {tournament_data, tournament};

async function fetchUserName() {
  await check_access_token();
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
    
    if (!userResponse.ok) {
      throw new Error('Network response was not ok');
    }
    let data_user = await userResponse.json()
    return (data_user.user_data.username);
  } catch(error)  {
    console.error('There was a problem with the fetch operation:', error);
  }
}

let playRemoteGame = async () => {};
export const initPlayRemoteGame = async (initRemotegame) => {
  playRemoteGame = await initRemotegame;
} 

async function connectPlayerSocket() {
  await check_access_token();
  try {
    const subprotocols = ['token', get_localstorage('token'), "session_id", get_localstorage('session_id')];
    const ws = new WebSocket(game_socket, subprotocols);
    ws.onmessage = async function(event) {
      const data = JSON.parse(event.data);
      console.log(' ------------------- Message from server socket woek: ---------------- ', data);
      if (data.type === "remote_game_created")
        {
          let name_current_user = await fetchUserName();
          game_data = {
            name_current_user: name_current_user,
            game_id: data.game.id,
            player1_name: data.game.player1_name,
            player2_name: data.game.player2_name,
            player1_id: data.game.player1_id,
            player2_id: data.game.player2_id,
          }
          game_data.player1_score = 0;
          game_data.player2_score = 0;
          // console.log("data are here => ", game_data)
          statePongGame = "remote";
          // window.location.hash = '/remote_pong';
          window.location.hash = "/pingpong";
        }
      else if (data.type === "message") {
        if (data.message === "Both players are connected") {
          await playRemoteGame();
          console.log("data: ", data.message);
        }
      }
    };
    return (ws);
  } catch (e) {
    console.error('Failed to parse message:', e);
  }
}


async function remore_game_fun() {
  await check_access_token();
try {
      const response = await fetch(api_game + 'create-remote-game/', {
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
      if (jsonData.message === "waiting for second player to join") {
        document.querySelector('#cancel_game').style.display = 'flex';
        document.querySelector('#butt_game').style.display = 'none';
        document.querySelector('.spinner').style.display = 'flex';
      }
      else if (jsonData.message) {
        errorhere(jsonData.message);
      }

      console.log(jsonData);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // await login(jsonData.access, jsonData.refresh);
      
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }

}

export async function aiGame() {
  name = "ai_bot";
  statePongGame = "ai_bot";
  await lanceLocalGame();
}

export async function localgame() {
  if (typeof input !== 'undefined')
    name = input.value;
  else
    name = game_data.player2_name;
  console.log("name of user: ", name);
  statePongGame = "local";
  await lanceLocalGame();
}

function changePlayerPosition() {
  if (statePongGame === "ai_bot") {
    const tmp = game_data.player1_name;
    game_data.player1_name = game_data.player2_name;
    game_data.player2_name = tmp;
  }
}

async function lanceLocalGame() {
  const data = {
    player2_name: name
  };
  await check_access_token();
  try {
    const response = await fetch(api_game + 'create-local-game/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },  
      credentials: 'include',
      body: JSON.stringify(data)
    });
    console.log("response: ", response);
    const jsonData = await response.json();
    // console.log("jsonData: ", jsonData);
    // console.log("jsonData.stringify(): ", JSON.stringify(jsonData));
    if (jsonData.message === 'game created') {
      game_data = jsonData;
      changePlayerPosition();
      if (window.location.hash == "#/pingpong") {
        console.log("### pingpong");
      }
      else {
        console.log("$$$ pingpong");
        window.location.hash = "/pingpong";
      }
    }
    else if (jsonData.message.player2_name) {
      errorhere('invalid player name');
    }
    else if (jsonData.message) {
      errorhere(jsonData.message);
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response}`);
    }

  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// async function changeAccess() {
//     const data = {
//       refresh: get_localstorage('refresh')
//     };
  
//     try {
//       const response = await fetch(api + 'auth/token/refresh/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Session-ID': get_localstorage('session_id')
//         },
//         credentials: 'include',
//         body: JSON.stringify(data)
//       });
//       if (response.status === 401) {
//         logoutf();  
//         window.location.hash = '/login';
//       }  
//       const jsonData = await response.json();
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
//       login(jsonData.access, jsonData.refresh, get_localstorage('session_id'));
      
//     } catch (error) {
//       console.error('There was a problem with the fetch operation:', error);
//     }
//   }
  
  // async function checkFirst() {
  //   const token = get_localstorage('token');
  //   try {
  //     const response = await fetch(api + 'auth/verify-token/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Session-ID': get_localstorage('session_id')
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify({ token }) 
  //     });
  //     console.log(response);
  //     if (response.status === 404){
  //       logoutf();
  //       window.location.hash = '/login';
  //     }  
  //     if (response.status !== 200) {
  //       await changeAccess();
  //       await fetchUserHomeData();
  //     } else if (!response.ok) {
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //     } else {
  //       const jsonData = await response.json();
  //       await fetchUserHomeData();
  //     }
  //   } catch (error) {
  //     console.error('There was a problem with the fetch operation:', error);
  //   }
  // }
  
  // async function fetchUserHomeData() {
  //   try {
  //     const userResponse = await fetch(api + 'auth/get-user/', {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'Bearer ' + get_localstorage('token'),
  //         'Session-ID': get_localstorage('session_id')
  //       },
  //       credentials: 'include',
  //     });
      
  //     if (!userResponse.ok) {
  //       throw new Error('Network response was not ok');
  //     }
  //     const userData = await userResponse.json();
  //     tournament_name = userData.user_data.tournament_username;
  //     console.log("here iwill print user fata to check user for ===:", userData)
      
  //     const change_user = document.getElementById('UserName');
  //     const change_imge = document.getElementById('image_user');
      
  //     change_user.innerHTML = userData.user_data.username;
  //     change_imge.src = userData.user_data.avatar;
  //   } catch(error)  {
  //     console.error('There was a problem with the fetch operation:', error);
  //   }
  // }
  
  function errorhere(string) {
    const game_tag_err = document.getElementById('game_tag_err');
    game_tag_err.innerHTML = `<i class="bi bi-check2-circle"></i> ${string}`;
  
    document.querySelector('.success_update').style.display = "flex";
    setTimeout(function() {
      document.querySelector('.success_update').style.display = 'none';
  }, 2000);
}

function setNotification() {
  const notific = document.querySelector('.notification');
  const notifi_display = document.querySelector('.notifi_btn');

  notific.addEventListener('click', function() {
    notifi_display.classList.toggle('active');
  })

}

async function pong_game_score()
{
    await check_access_token()
    try{
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + get_localstorage('token'),
            'Session-ID': get_localstorage('session_id')
            },
            credentials: 'include',
            body: localStorage.getItem("dataPongMatch")
        });
        const jsonData = await response.json()
        if (jsonData.message === 'game score added') {
          localStorage.removeItem("dataPongMatch")
        }
        if (!response.ok) {
          console.error(`Status: ${response.status}, Message: ${jsonData.message || 'Unknown error'}`)
        }
    }
    catch(error){
        console.error('Request failed', error)
    }
}

export default Ping;
export {pong_game_score}