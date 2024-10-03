import { loadHTML, loadCSS } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';
var api = "https://127.0.0.1:9004/api/";
var api_game = "https://127.0.0.1:9006/api/gamedb/";
let game_socket = "wss://127.0.0.1:9006/ws/game-db/"
let name = "";

var remote_object;
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
  gmaee();


  // here i'm working with tournament and players

  const start_tournament = document.getElementById('tournament_game_btt');
  const tournament_players = document.querySelector('.tournament_players');
  const tournament_close = document.querySelector('.bi-x');

  start_tournament.addEventListener('click', () => {
    tournament_players.style.display = 'flex';
  })

tournament_close.addEventListener('click', () => {
  tournament_players.style.display = 'none';
})



  
}



function gmaee() {
  const subprotocols = ['token', get_localstorage('token')];


  const socket = new WebSocket(game_socket, subprotocols);
  socket.onmessage = function(event) {
    console.log('Message from server socket woek:', event.data);
    
    try {
      const data = JSON.parse(event.data);
      if (data.data.type === "remote_game_created")
      {
          remote_object = {
            game_id: data.data.game.id,
            player1name: data.data.game.player1_name,
            player2name: data.data.game.player2_name,
            player1id: data.data.game.player1_id,
            player2id: data.data.game.player2_id
          }
          console.log("data are here => ", remote_object)
          // window.location.hash = 'hat hna lpath dyalk';
      }

    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  };

}

export {remote_object};

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
