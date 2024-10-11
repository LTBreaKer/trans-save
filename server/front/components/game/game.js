import { loadHTML, loadCSS } from '../../utils.js';
import {start_game} from './tag.js';
let socket;

async function Game() {

  const html = await loadHTML('./components/game/game.html');
  loadCSS('./components/game/game.css');

  const app = document.getElementById('app');
  app.innerHTML = html;

  function connectWebSocket(url)
  {
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
              reject(new Error('WebSocket connection closed'));
          };
      });
  }
  
  async function initializeApp()
  {
    try{
        const socket = await connectWebSocket('ws://127.0.0.1:8005/ws/tag-game/');
        return socket;
    }
    catch(error){
        console.error('Failed to connect WebSocket:', error);
    }
  }
  socket = await(initializeApp());

  if (socket.readyState === WebSocket.OPEN) 
    start_game();
}

export{socket}
export default Game;
