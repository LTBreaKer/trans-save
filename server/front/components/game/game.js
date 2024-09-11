import { loadHTML, loadCSS } from '../../utils.js';
import {start_game} from './tag.js';
import {tag_game_info} from '../ta/script.js';
let socket;

async function Game() {

  const html = await loadHTML('./components/game/game.html');
  loadCSS('./components/game/game.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  console.log("object===> ", tag_game_info);

  function connectWebSocket(url)
  {
      return new Promise((resolve, reject) => {
          const socket = new WebSocket(url);
  
          // Resolve the promise when the WebSocket connection is open
          socket.onopen = () => {
              console.log('WebSocket connection established');
              resolve(socket);
          };
  
          // Reject the promise if there is an error
          socket.onerror = (error) => {
              console.error('WebSocket error:', error);
              reject(error);
          };
  
          // Reject the promise if the WebSocket connection is closed unexpectedly
          socket.onclose = (event) => {
            //   console.log('WebSocket connection closed', event);
              reject(new Error('WebSocket connection closed'));
          };
      });
  }
  
  // Async function to initialize the app
  async function initializeApp()
  {
    // Await the WebSocket connection
    try{
        const socket = await connectWebSocket('ws://127.0.0.1:8005/ws/tag-game/');
        return socket;
    }
    catch(error){
        console.error('Failed to connect WebSocket:', error);
    }
  }

  // Call the async function to start the process

  socket = await(initializeApp());

  if (socket.readyState === WebSocket.OPEN) 
    start_game();
}

export{socket}
export default Game;
