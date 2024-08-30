import { loadHTML, loadCSS } from '../../utils.js';

async function NotFound() {
  const html = await loadHTML('./components/notfound/notfound.html');
  loadCSS('./components/notfound/notfound.css');

  const app = document.getElementById('app');
  app.innerHTML = html;

}

export default NotFound;
