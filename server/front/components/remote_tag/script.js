import { get_localstorage } from '../../auth.js';
import { loadHTML, loadCSS } from '../../utils.js';
import {tag_game_info} from '../ta/script.js';
import {start_game} from './tag.js'
let socket
let api = "https://127.0.0.1:9007/api/tag-gamedb/"

async function connect_game()
{
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
}

async function RemoteTag() {
  const html = await loadHTML('./components/remote_tag/index.html');
  loadCSS('./components/remote_tag/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;

  if (!tag_game_info)
  {
        console.error("invalid players")
        window.location.hash = '#/ta'
        return
  }
  
  function connectWebSocket(url) {
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
          const socket = await connectWebSocket('ws://127.0.0.1:8007/ws/remote/');
          return socket;
      }
      catch(error){
          console.error('Failed to connect WebSocket:', error);
      }
  }

  socket = await(initializeApp());

  if (socket.readyState === WebSocket.OPEN)
  {
    socket.send(JSON.stringify({
      'action': 'new game',
      'game_id': tag_game_info.game_id
    }))  
  }

  let message 
  socket.addEventListener('message', function(event) {
      let socket_data = JSON.parse(event.data)
      message = socket_data.content

      if (socket.readyState === WebSocket.OPEN && message === "start game")
      {
        connect_game();
        start_game();
      }

  })
}

export{socket}
export default RemoteTag;
