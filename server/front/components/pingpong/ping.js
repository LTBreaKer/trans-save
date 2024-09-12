import { loadHTML, loadCSS } from '../../utils.js';

async function PingPong() {
  const html = await loadHTML('./components/pingpong/ping.html');
  loadCSS('./components/pingpong/ping.css');

  const app = document.getElementById('app');
  app.innerHTML = html;

}

export default PingPong;
