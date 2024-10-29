import { loadHTML, loadCSS } from '../../utils.js';
import { game_data, statePongGame } from '../ping/script.js';
export let playGame = async () => {
	console.log("  playGame  playGame  playGame  playGame");

};

export const initPlayGame = async (initgame) => {
  playGame = await initgame;
}

let html = ""
export let script;

export async function isGameDataFull()
{
  if (!game_data) {
	  window.location.hash = "/ping";	
    return (0);
  }
  return (1);
}

async function PingPong() {
  if (statePongGame === '' && localStorage.getItem('statePongGame'))
    window.location.hash = "/tournament";	
  else if (await isGameDataFull()) {
    await loadHtmlWidthModuleScript();
    await playGame();
  }
}

export async function loadHtmlWidthModuleScript() {
  if (!html) {
    // html = await loadHTML('./pong-game/local/public/3dgame.html')
    html = await loadHTML('./pong-game/public/3dgame.html')
    const container = document.getElementById('app');
    container.innerHTML = html;
    script = document.createElement('script');
    script.type = 'module';
    // script.src = './pong-game/local/src/main3d.js';
    script.src = './pong-game/src/main3d.js';
    document.body.appendChild(script);
  }
  else {
    const container = document.getElementById('app');
    container.innerHTML = html;
  }
}

export default PingPong;