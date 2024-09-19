import { loadHTML, loadCSS } from '../../utils.js';
// import { gameApi } from '../ping/script.js';
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
async function PingPong() {
  // history.pushState({}, '', "/pingpong");
  // console.log("history: ", history.state);
  await loadHtmlWidthModuleScript();
  sleep(4);
  await playGame();
}

async function loadHtmlWidthModuleScript() {
  if (!html)
    html = await loadHTML('./pong-game/local/public/3dgame.html')
  const container = document.getElementById('app');
  container.innerHTML = html;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = './pong-game/local/src/main3d.js';
  document.body.appendChild(script);
  // const url = './pong-game/local/public/3dgame.html';
  // fetch(url)
  // .then(res => res.text())
  // .then(html => {
  //   const container = document.getElementById('app');
  //   container.innerHTML = html;
  // })
  // .then(() => {
  //   // loadCSS('./components/pingpong/ping.css');
  //   const script = document.createElement('script');
  //   script.type = 'module';
  //   script.src = './pong-game/local/src/main3d.js';
  //   document.body.appendChild(script);
  // })
  // .catch(error => console.error('Error loading html: ', error));
}

export default PingPong;