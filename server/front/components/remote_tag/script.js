import { loadHTML, loadCSS } from '../../utils.js';
import {tag_game_info} from '../ta/script.js';

async function RemoteTag() {
  const html = await loadHTML('./components/remote_tag/index.html');
  loadCSS('./components/remote_tag/style.css');

  const app = document.getElementById('app');
  app.innerHTML = html;



  console.log("here object=: ", tag_game_info);

}

export default RemoteTag;
