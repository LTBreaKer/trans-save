import Home from './components/home/home.js';
import Profile from './components/profile/profile.js';
import Login from './components/login/login.js';
import NotFound from './components/notfound/notfound.js';
import Friends from './components/friends/friends.js';
import Game from './components/game/game.js';
import PingPong from './components/pingpong/ping.js';
import { isAuthenticated, get_localstorage, check_access_token } from './auth.js';
import Ta from './components/ta/script.js';
import Ping from './components/ping/script.js';
import Tournament from './components/tournament/script.js';
import RemoteTag from './components/remote_tag/script.js';
import TournamentScore from './components/tournamentscore/script.js';
import {remove_tag_remote_game, remove_ping_remote_game, remove_game_pong_f_database, remove_game_tag_f_database} from './utils.js';

const host = "127.0.0.1";

var api_game = `https://${host}:9006/api/gamedb/`;
let game_api = `https://${host}:9007/api/tag-gamedb/`;

const api_one = `https://${host}:9005/api/`;
let friends_array = [];
let component;
let path;
const routes = {
  '/': Home,
  '/ta': Ta,
  '/profile': Profile,
  '/login': Login,
  '/notfound': NotFound,
  '/user': Friends,
  '/game': Game,
  '/pingpong': PingPong,
  '/ping': Ping,
  '/tournament': Tournament,
  '/remoteTag': RemoteTag,
  '/tournamentScore': TournamentScore,
};
export function isUrlEncoded(str) {
  const pattern = /%[0-9A-Fa-f]{2}/;
  return pattern.test(str);
}

async function Router() {
  var usern;
  if (isAuthenticated()){
    await check_access_token();
  }

  window.addEventListener('hashchange', async () => {

     path = window.location.hash.slice(1);
    console.log("path===>: ", path);
    if (path === '')
        path = '/';
    component = routes[path] || NotFound;
    if (!isAuthenticated() && path !== '/login') {
      window.location.hash = '/login';
      return;
    }
    if (isAuthenticated() && path === "/login"){
      window.location.hash = '/';
      return;
    }
    usern = path.split('/')[2];
    if (isUrlEncoded(usern))
      usern = decodeURIComponent(usern);
    if (path.startsWith('/user'))
      await get_friends_list();
    if (path.startsWith('/user') || (path == '/user' && !friends_array.includes(usern))){
      if (typeof usern === 'undefined' || usern === null || !friends_array.includes(usern) ) 
        component = NotFound;
      else 
        component = routes['/user'];
    }
    await component();
  });
  let path = window.location.hash.slice(1) || '/';
  let component = routes[path] || NotFound;
  if (path === '')
    path = '/';
  if (!isAuthenticated() && path !== '/login') {
    window.location.hash = '/login';
    return;
  }
  if (isAuthenticated() && path === "/login") {
    window.location.hash = '/';
    return;
  }
  
  usern = path.split('/')[2];
  if (isUrlEncoded(usern))
    usern = decodeURIComponent(usern);

  if (path.startsWith('/user'))
    await get_friends_list();

  if (path.startsWith('/user') || (path == '/user' && !friends_array.includes(usern))){
    if (typeof usern === 'undefined' || usern === null ||  !friends_array.includes(usern) ) 
      component = NotFound;
    else 
      component = routes['/user'];
  }
  await component();

}

async function get_friends_list() {
  console.log("=======hello ======");
  await check_access_token();
  const response = await fetch(api_one + 'user/get-friend-list/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
      'Session-ID': get_localstorage('session_id')
    },
    credentials: 'include',
  });
  const jsonData = await response.json();
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  await add_friendstoarray(jsonData.friend_list)
}


async function add_friendstoarray(friendList) {
  if (!friendList) {
    console.error('Notification display container not found');
    return;
  }
  
  friendList =  Object.values(friendList);
  friends_array = [];
  console.log("*********************************************")
 friendList.map( friend => {
   friends_array.push(friend.username);
 });
}
export default Router;
