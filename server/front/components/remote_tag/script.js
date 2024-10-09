import { loadHTML, loadCSS } from '../../utils.js';
import {tag_game_info} from '../ta/script.js';
import {start_game} from './tag.js'
let socket

async function RemoteTag() {
  const html = await loadHTML('./components/remote_tag/index.html');
  loadCSS('./components/remote_tag/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;

  console.log("here object=: ", tag_game_info);
  
  function connectWebSocket(url) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(url);

        socket.onopen = () => {
            console.log('WebSocket connection established');
            resolve(socket);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };

        socket.onclose = (event) => {
            console.log('WebSocket connection closed', event);
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
  let message 

  socket.addEventListener('message', function(event) {
      let socket_data = JSON.parse(event.data)
      message = socket_data.content
      if (socket.readyState === WebSocket.OPEN && message === "start game")
      {
        socket.send(JSON.stringify({
          'action': 'new game',
          'game_id': tag_game_info.game_id
        }))  
        start_game();
      }
  })

}

export{socket}
export default RemoteTag;
