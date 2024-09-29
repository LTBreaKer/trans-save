import { loadHTML, loadCSS } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';
var api = "https://127.0.0.1:9004/api/";
var api_game = "https://127.0.0.1:9006/api/gamedb/";
let game_socket = "wss://127.0.0.1:9006/ws/game-db/";
let name = "";
let html = "";
var data_remote_player;
export let statePongGame;
export let player_webSocket;

export async function sendPlayerPaddleCreated(){
  console.log("----------------  sendPlayerPaddleCreated  --------------------------");
  let data = data_remote_player;
  console.log("data.name_current_user : ", data.name_current_user)
  console.log("data.player1_name : ", data.player1name)
  let player_id = (data.name_current_user === data.player1name)
    ? data.player1id : data.player2id;
    console.log("player_id: ", player_id);
	const ws = await player_webSocket;
	if (ws && ws.readyState == 1) {
		await ws.send(JSON.stringify ({
      'message': 'player_connected',
      'game_id': data.game_id,
      'player_id': player_id,
    }));
  }
}

async function Ping() {
  if (!html)
    html = await loadHTML('./components/ping/index.html');

  const app = document.getElementById('app');
  app.innerHTML = html;
  await checkFirst();


  const local_butt_game = document.getElementById('local_butt_game');
  const remote_butt_game = document.getElementById('butt_game');



  const input = document.getElementById('input');
  name = input.value; 
  local_butt_game.addEventListener('click', localgame);
  remote_butt_game.addEventListener('click', remore_game_fun);
  player_webSocket = await connectPlayerSocket();
  
}

async function fetchUserName() {
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

async function connectPlayerSocket() {
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
            player1name: data.game.player1_name,
            player2name: data.game.player2_name,
            player1id: data.game.player1_id,
            player2id: data.game.player2_id
          }
          // console.log("data are here => ", data_remote_player)
          statePongGame = "remote";
          // window.location.hash = '/remote_pong';
          window.location.hash = "/pingpong";
        }
      else if (data.type === "message") {
        if (data.message === "Both players are connected") {
          console.log("data: ", data.message);
        }
      }
    };
    return (ws);
  } catch (e) {
    console.error('Failed to parse message:', e);
  }
}

export {data_remote_player};


async function remore_game_fun() {
  
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
    console.log("###  pingpong: ", window.location.hash);
    gameApi = JSON.stringify(jsonData);
    statePongGame = "local";
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
