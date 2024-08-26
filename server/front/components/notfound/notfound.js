import { loadHTML, loadCSS } from '../../utils.js';

async function NotFound() {
  const html = await loadHTML('./components/NotFound/NotFound.html');
  loadCSS('./components/NotFound/NotFound.css');

  const app = document.getElementById('app');
  app.innerHTML = html;

  // JavaScript logic for the NotFound component
  document.getElementById('notfound-button').addEventListener('click', () => {
    alert('NotFound button clicked!');
  });
}

export default NotFound;
