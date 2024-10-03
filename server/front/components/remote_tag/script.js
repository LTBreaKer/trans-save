import { loadHTML, loadCSS } from '../../utils.js';

async function RemoteTag() {
  const html = await loadHTML('./components/remote_tag/index.html');
  loadCSS('./components/remote_tag/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;

}

export default RemoteTag;
