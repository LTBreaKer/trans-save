import { loadHTML, loadCSS } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie, check_access_token } from '../../auth.js';
var api = "https://127.0.0.1:9004/api/";
var api_game = "https://127.0.0.1:9006/api/gamedb/";
let game_socket = "wss://127.0.0.1:9006/ws/game-db/";
let tournament = "https://127.0.0.1:9008/api/tournament/"
let name = "";
let html = "";
export let data_remote_player;
// export let gameApi;
export let statePongGame;
export let _player_webSocket;
let tournament_data;

export function assingGameApiToNULL() {
  data_remote_player = null;
}

export function statePongGameToTournament() {
  statePongGame = "tournament";
}

export async function sendPlayerPaddleCreated(){
  console.log("----------------  sendPlayerPaddleCreated  --------------------------");
  let data = data_remote_player;
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
      },
      credentials: 'include',
      body: JSON.stringify(participants)
    });
    console.log(response);
    const jsonData = await response.json();
    console.log(jsonData);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    tournament_data = jsonData;
    window.location.hash = "/tournament";
    // await login(jsonData.access, jsonData.refresh);
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }


}

async function Ping() {
  if (!html)
    html = await loadHTML('./components/ping/index.html');

  const app = document.getElementById('app');
  app.innerHTML = html;
  await checkFirst();


  const local_butt_game = document.getElementById('local_butt_game');
  const btn_ai = document.getElementById('btn_ai');
  const remote_butt_game = document.getElementById('butt_game');



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
        'Authorization': 'Bearer ' + get_localstorage('token')
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
    const subprotocols = ['token', get_localstorage('token')];
    const ws = new WebSocket(game_socket, subprotocols);
    ws.onmessage = async function(event) {
      const data = JSON.parse(event.data);
      console.log(' ------------------- Message from server socket woek: ---------------- ', data);
      if (data.type === "remote_game_created")
        {
          let name_current_user = await fetchUserName();
          data_remote_player = {
            name_current_user: name_current_user,
            game_id: data.game.id,
            player1_name: data.game.player1_name,
            player2_name: data.game.player2_name,
            player1_id: data.game.player1_id,
            player2_id: data.game.player2_id
          }
          // console.log("data are here => ", data_remote_player)
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
      },
      credentials: 'include',
    });
    console.log(response);
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

export async function aiGame() {
  name = "ai_bot";
  statePongGame = "ai_bot";
  await lanceLocalGame();
}

export async function localgame() {
  if (typeof input !== 'undefined')
    name = input.value;
  else
    name = data_remote_player.player2_name;
  console.log("name of user: ", name);
  statePongGame = "local";
  await lanceLocalGame();
}

function changePlayerPosition() {
  if (statePongGame === "ai_bot") {
    const tmp = data_remote_player.player1_name;
    data_remote_player.player1_name = data_remote_player.player2_name;
    data_remote_player.player2_name = tmp;
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
      },  
      credentials: 'include',
      body: JSON.stringify(data)
    });
    console.log("response: ", response);
    const jsonData = await response.json();
    // console.log("jsonData: ", jsonData);
    // console.log("jsonData.stringify(): ", JSON.stringify(jsonData));
    console.log("###  pingpong: ", window.location.hash);
    data_remote_player = jsonData;
    changePlayerPosition();
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response}`);
    }
    else if (window.location.hash == "#/pingpong") {
      console.log("### pingpong");
    }
    else {
      console.log("$$$ pingpong");
      window.location.hash = "/pingpong";
    }
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
  

export default Ping;