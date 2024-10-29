import { loadHTML, loadCSS,  remove_tag_remote_game, remove_game_tag_f_database} from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie, check_access_token } from '../../auth.js';
import {setHeaderContent, setNaveBarContent} from '../tournament/script.js';

// https://{{ip}}:9007:ws/tag-game-db/
var api = "https://127.0.0.1:9004/api/";
let game_api = 'https://127.0.0.1:9007/api/tag-gamedb/';
const ta_socket = 'wss://127.0.0.1:9007/ws/tag-game-db/';
let tag_game_info;
async function Ta() {
  await remove_game_tag_f_database();
  window.onload = async function() {

    await remove_tag_remote_game();
    // document.querySelector('#cancel_game').style.display = 'none';
    // document.querySelector('#butt_game').style.display = 'flex';
    // document.querySelector('.spinner').style.display = 'none';

  };

  const html = await loadHTML('./components/ta/index.html');
  loadCSS('./components/ta/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  setHeaderContent();
  setNaveBarContent();

  await checkFirst();
  if (localStorage.getItem("winner") && localStorage.getItem("game_id") )
    await add_game_score();
  const remote_butt_game = document.getElementById('butt_game');
  const local_butt_game = document.getElementById('local_butt_game_tag');

  const cancel_game_func = document.getElementById('cancel_game');

  const logout = document.getElementById('logout')
  
  logout.addEventListener('click', log_out_func);
cancel_game_func.addEventListener('click', await remove_tag_remote_game);

  // cancel_game_func.addEventListener('click', async () => {


  //   try {
  //     const response = await fetch(game_api + 'cancel-remote-game-creation/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
  //         'Session-ID': get_localstorage('session_id')
  //       },
  //       credentials: 'include',
  //     });
  //     console.log(response);
  //     const jsonData = await response.json();
  //     console.log("data=>  : ", jsonData);
  //     if (jsonData.message === "player removed from game queue") {
  //       document.querySelector('#cancel_game').style.display = 'none';
  //       document.querySelector('#butt_game').style.display = 'flex';
  //       document.querySelector('.spinner').style.display = 'none';
  //     }
     
        
  //     if (!response.ok) 
  //       throw new Error(`HTTP error! Status: ${response.status}`);
  //   } catch (error) {
  //     console.error('There was a problem with the fetch operation:', error);
  //   }





  // })
  // input = document.getElementById('input_tag');
  // player_name = input.value; 
  // remote_butt_game.addEventListener('click', remote_game_function);


  remote_butt_game.addEventListener('click', async () => {
    await check_access_token();

    try {
      const response = await fetch(game_api + 'create-remote-game/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
          'Session-ID': get_localstorage('session_id')
        },
        credentials: 'include',
      });
      console.log(response);
      const jsonData = await response.json();
      console.log(jsonData);
      if (jsonData.message === "waiting for second player to join") {
        document.querySelector('#cancel_game').style.display = 'flex';
        document.querySelector('#butt_game').style.display = 'none';
        document.querySelector('.spinner').style.display = 'flex';
      }

      else if (jsonData.message) {
        const game_tag_err = document.getElementById('game_tag_err');
        game_tag_err.innerHTML = `<i class="bi bi-check2-circle"></i> ${jsonData.message}`;
  
        document.querySelector('.success_update').style.display = "flex";
        setTimeout(function() {
          document.querySelector('.success_update').style.display = 'none';
      }, 2000);
    
      }
      else if (jsonData.message === "game created") {
          window.location.hash = "/remoteTag";
      }
      if (!response.ok) 
        throw new Error(`HTTP error! Status: ${response.status}`);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  })




  local_butt_game.addEventListener('click', localgame_tag);
  tag_socket();
  
  // window.addEventListener('beforeunload', function (event) {
  //   cancel_game_func.click();
  //   console.log("==========================================")
  //   console.log("==========================================")
  //   console.log("==========================================")
  //   console.log("==========================================")
  // });



}
function setTagGameInfo(value)
{
  tag_game_info = value
}
// data dyal game tag kayan fhad object just import it 
export  {tag_game_info, setTagGameInfo};



function tag_socket() {

try {
  const subprotocols = ['token', get_localstorage('token')];
  const ws = new WebSocket("wss://127.0.0.1:9007/ws/tag-game-db/",  ["token", get_localstorage('token'), "session_id", get_localstorage('session_id')]);
  ws.onmessage = async function(event) {
    const data = await JSON.parse(event.data);
    console.log(' ------------------- Message from server socket tag: ---------------- ', data);
    console.log("type ===> ", data.data.type)
    if (data.data.type === "remote_game_created")
      {
        tag_game_info = {
          game_id: data.data.game.id,
          player1name: data.data.game.player1_name,
          player2name: data.data.game.player2_name,
          player1_id: data.data.game.player1_id,
          player2_id: data.data.game.player2_id
        }
        console.log("hello -----------");
        window.location.hash = "/remoteTag";
      }

  };
  ws.onerror = function(error) {
    console.log("socket error: ", error);
    setTimeout(tag_socket, 5000)
  }

} catch (e) {
  console.error('Failed to parse message:', e);
}

}



async function localgame_tag() {
  const input = document.getElementById('input_tag');
  const player_name = input.value; 
  await check_access_token();

  console.log("name of user: ", player_name);
  const data = {
    player2_name: player_name
  };

  try {
    const response = await fetch(game_api + 'create-local-game/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
        'Session-ID': get_localstorage('session_id')
      },
      credentials: 'include',
      body: JSON.stringify(data)

    });


    
    console.log(response);
    const jsonData = await response.json();
    if (jsonData.message.player2_name) {
      const game_tag_err = document.getElementById('game_tag_err');
      game_tag_err.innerHTML = `<i class="bi bi-check2-circle"></i> invalid player name`;

      console.log('hdsklfjsldkjflsdjk    => :', jsonData.message);
      document.querySelector('.success_update').style.display = "flex";
      setTimeout(function() {
        document.querySelector('.success_update').style.display = 'none';
    }, 2000);

    }

    else if (jsonData.message) {
      const game_tag_err = document.getElementById('game_tag_err');
      game_tag_err.innerHTML = `<i class="bi bi-check2-circle"></i> ${jsonData.message}`;

      console.log('hdsklfjsldkjflsdjk    => :', jsonData.message);
      document.querySelector('.success_update').style.display = "flex";
      setTimeout(function() {
        document.querySelector('.success_update').style.display = 'none';
    }, 2000);
  
    }
    console.log(jsonData.message)
    const game_id =  jsonData.game_id;
    const player1_name =  jsonData.player1_name;
    const player2_name =  jsonData.player2_name;
    tag_game_info = {
      game_id: game_id,
      player1_name: player1_name,
      player2_name: player2_name,
    }
    if (response.status === 201)
      window.location.hash = '/game'
    // console.log(jsonData.message)
    
    if (!response.ok) {
      // console.log(jsonData.message)
      throw new Error(`HTTP error! Status: ${response.status}`);
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
      login(jsonData.access, jsonData.refresh, get_localstorage('session_id'));
      
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
          'Authorization': 'Bearer ' + get_localstorage('token'),
          'Session-ID': get_localstorage('session_id')
        },
        credentials: 'include',
      });
      
      if (userResponse.status === 404) {
        logoutf();
        window.location.hash = '/login';
      }

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

  async function add_game_score()
  {
      await check_access_token()
      const data = {
          game_id: localStorage.getItem("game_id"),
          winner_name: localStorage.getItem('winner'),
      }
      try{
          const response = await fetch(game_api + 'add-game-score/', {
              method: 'POST',
              headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + get_localstorage('token'),
              'Session-ID': get_localstorage('session_id')
              },
              credentials: 'include',
              body: JSON.stringify(data)
          });
          const jsonData = await response.json()
          if (jsonData.message === 'game score added') {
            localStorage.removeItem("game_id")
            localStorage.removeItem("winner")
          }
          if (!response.ok) {
            console.error(`Status: ${response.status}, Message: ${jsonData.message || 'Unknown error'}`)
          }
      }
      catch(error){
          console.error('Request failed', error)
      }
  }

export default Ta;
