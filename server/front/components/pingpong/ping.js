import { loadHTML, loadCSS } from '../../utils.js';
import { gameApi } from '../ping/script.js';

async function PingPong() {
  await loadHtmlWidthModuleScript();
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