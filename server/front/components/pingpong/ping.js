// import { fnPongGame } from '../../pong-game/src/main3d.js';
import { loadHTML, loadCSS } from '../../utils.js';

async function PingPong() {
  // const html = await loadHTML('./pong-game/public/3dgame.html');
  // await fnPongGame();
  // loadCSS('./pong-game/src/styles/main.css');

  // const app = document.getElementById('app');
  // app.innerHTML = html;
  loadHtmlWidthModuleScript();

}

async function loadHtmlWidthModuleScript() {
  const url = './pong-game/local/public/3dgame.html';
  fetch(url)
  .then(res => res.text())
  .then(html => {
    const container = document.getElementById('app');
    container.innerHTML = html;
  })
  .then(() => {
    loadCSS('./components/pingpong/ping.css');
    const script = document.createElement('script');
    script.type = 'module';
    script.src = './pong-game/local/src/main3d.js';
    document.body.appendChild(script);
  })
  .catch(error => console.error('Error loading html: ', error));
}

export default PingPong;

// import { loadHTML, loadCSS } from '../../utils.js';

// async function PingPong() {
//   const html = await loadHTML('./components/pingpong/ping.html');
//   loadCSS('./components/pingpong/ping.css');

//   const app = document.getElementById('app');
//   app.innerHTML = html;

// }

// export default PingPong;
