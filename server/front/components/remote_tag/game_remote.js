import { loadHTML, loadCSS } from '../../utils.js'
import {start_game} from './tag_remote.js'
let socket

async function RemoteTag() {
  const html = await loadHTML('./components/remote_tag/game.html');
  loadCSS('./components/remote_tag/game.css');

  const app = document.getElementById('app');
  app.innerHTML = html;


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
        const socket = await connectWebSocket('ws://127.0.0.1:8006/ws/remote/');
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
        start_game();
  })
}

export default RemoteTag;
export {socket}
