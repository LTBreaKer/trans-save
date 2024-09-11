import { loadHTML, loadCSS } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';
var api = "https://127.0.0.1:9004/api/";
let game_api = 'https://127.0.0.1:9007/api/tag-gamedb/';
let tag_game_info;
async function Ta() {
  const html = await loadHTML('./components/ta/index.html');
  loadCSS('./components/ta/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  
  await checkFirst();

  const local_butt_game = document.getElementById('local_butt_game_tag');
  // input = document.getElementById('input_tag');
  // player_name = input.value; 
  local_butt_game.addEventListener('click', localgame_tag);

  
}
// data dyal game tag kayan fhad object just import it 
export  {tag_game_info};


async function localgame_tag() {
  const input = document.getElementById('input_tag');
  const player_name = input.value; 

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
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    console.log(response);
    const jsonData = await response.json();
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
    
    if (!response.ok) {
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

export default Ta;
