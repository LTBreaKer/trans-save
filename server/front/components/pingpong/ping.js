// import { fnPongGame } from '../../pong-game/src/main3d.js';
import { loadHTML, loadCSS } from '../../utils.js';

async function PingPong() {
  await loadHtmlWidthModuleScript();
}

async function loadHtmlWidthModuleScript() {
  const url = './pong-game/remote/public/3dgame.html';
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
    script.src = './pong-game/remote/src/main3d.js';
    document.body.appendChild(script);
  })
  .catch(error => console.error('Error loading html: ', error));
}

export default PingPong;
