import { loadHTML, loadCSS } from '../../utils.js';

let playGame = async () => {
	console.log("  playGame  playGame  playGame  playGame");

};

export const initPlayGame = async (initgame) => {
  playGame = await initgame;
} 

function sleep(s) {
	return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

let html = ""
export let script;

async function PingPong() {
  await loadHtmlWidthModuleScript();
  await playGame();
}

async function loadHtmlWidthModuleScript() {
  if (!html) {
    html = await loadHTML('./pong-game/local/public/3dgame.html')
    const container = document.getElementById('app');
    container.innerHTML = html;
    script = document.createElement('script');
    script.type = 'module';
    script.src = './pong-game/local/src/main3d.js';
    document.body.appendChild(script);
  }
  else {
    const container = document.getElementById('app');
    container.innerHTML = html;
  }
}

export default PingPong;