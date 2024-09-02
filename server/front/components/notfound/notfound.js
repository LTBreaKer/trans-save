import { loadHTML, loadCSS } from '../../utils.js';

async function NotFound() {
<<<<<<< HEAD
  const html = await loadHTML('./components/NotFound/NotFound.html');
  loadCSS('./components/NotFound/NotFound.css');
=======
  const html = await loadHTML('./components/notfound/notfound.html');
  loadCSS('./components/notfound/notfound.css');
>>>>>>> fanti

  const app = document.getElementById('app');
  app.innerHTML = html;

<<<<<<< HEAD
  // JavaScript logic for the NotFound component
  document.getElementById('notfound-button').addEventListener('click', () => {
    alert('NotFound button clicked!');
  });
=======
>>>>>>> fanti
}

export default NotFound;
