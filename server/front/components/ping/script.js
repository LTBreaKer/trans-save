import { loadHTML, loadCSS } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';
var api = "https://127.0.0.1:9004/api/";
var api_game = "https://127.0.0.1:9006/api/gamedb/";
let game_socket = "wss://127.0.0.1:9006/ws/game-db/"
// https://{{ip}}:9008/api/tournament/create-tournament/
let tournament = "https://127.0.0.1:9008/api/tournament/"
let name = "";
let html = "";
export let data_remote_player;
export let gameApi;
export let statePongGame;
export let _player_webSocket;

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

async function Ping() {
  const html = await loadHTML('./components/ping/index.html');
  loadCSS('./components/ping/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  await checkFirst();


  const local_butt_game = document.getElementById('local_butt_game');
  const remote_butt_game = document.getElementById('butt_game');



  const input = document.getElementById('input');
  name = input.value; 
  local_butt_game.addEventListener('click', localgame);
  remote_butt_game.addEventListener('click', remore_game_fun);
  _player_webSocket = await connectPlayerSocket();


  // here i'm working with tournament and players

//   const start_tournament = document.getElementById('tournament_game_btt');
//   const tournament_players = document.querySelector('.tournament_players');
//   const tournament_close = document.querySelector('.bi-x');

//   start_tournament.addEventListener('click', () => {
//     tournament_players.style.display = 'flex';
//   })

// tournament_close.addEventListener('click', () => {
//   tournament_players.style.display = 'none';
// })



  
}

async function fetchUserName() {
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



async function create_tournament_function(participants) {
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


export {tournament_data, tournament};

function gmaee() {
  const subprotocols = ['token', get_localstorage('token')];


  const socket = new WebSocket(game_socket, subprotocols);
  socket.onmessage = function(event) {
    console.log('Message from server socket woek:', event.data);
    
    try {
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
          console.log("data are here => ", remote_object)
          // window.location.hash = 'hat hna lpath dyalk';
      }

    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  };

}


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


async function localgame() {
  name = input.value; 

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