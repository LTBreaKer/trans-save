import { loadHTML, loadCSS } from '../../utils.js';
import {start_game} from './tag.js';
import {tag_game_info} from '../ta/script.js'
import { get_localstorage } from '../../auth.js';
import { host } from '../../config.js';
// const host = "127.0.0.1"

let socket;
let api = `https://${host}:9007/api/tag-gamedb/`

async function Game() {

  const html = await loadHTML('./components/game/game.html');
  loadCSS('./components/game/game.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  if (!tag_game_info)
  {
    console.error("invalid players")
    window.location.hash = '#/ta'
    return
  }

  console.log("***********************")
  function connectWebSocket(url)
  {
      return new Promise((resolve, reject) => {
          const socket = new WebSocket(url);
          socket.onopen = () => {
              resolve(socket);
          };
          socket.onerror = (error) => {
              console.error('WebSocket error:', error);
              reject(error);
          };
          socket.onclose = (event) => {
              reject(new Error('WebSocket connection closed'));
          };
      });
  }
  
  async function initializeApp()
  {
    try{
        const socket = await connectWebSocket(`wss://${host}:8005/ws/tag-game/`);
        return socket;
    }
    catch(error){
        console.error('Failed to connect WebSocket:', error);
    }
  }

  socket = await(initializeApp());
  if (socket.readyState === WebSocket.OPEN)
  {
    console.log('##########################################################')
    try{
        const response = await fetch(api + 'connect-game/', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + get_localstorage('token'),
            'Session-ID': get_localstorage('session_id')
            },
            credentials: 'include',
            body: JSON.stringify({
                game_id: tag_game_info.game_id
            })
        });
        const jsonData = await response.json()
        if (!response.ok) {
          console.error(`Status: ${response.status}, Message: ${jsonData.message || 'Unknown error'}`)
        }
    }
    catch(error){
        console.error('Request failed', error)
    }
    start_game();
  }
}

export{socket}
export default Game;
