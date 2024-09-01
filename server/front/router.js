import Home from './components/home/home.js';
import Profile from './components/profile/profile.js';
import Login from './components/login/login.js';
import NotFound from './components/notfound/notfound.js';
import Friends from './components/friends/friends.js';
import Game from './components/game/game.js';
import PingPong from './components/pingpong/ping.js';
import { isAuthenticated, get_localstorage } from './auth.js';

const api_one = "https://127.0.0.1:9005/api/";
let friends_array = [];


const routes = {
  '/': Home,
  '/profile': Profile,
  '/login': Login,
  '/notfound': NotFound,
  '/user': Friends,
  '/game': Game,
  '/pingpong': PingPong,
};

async function Router() {


  const response = await fetch(api_one + 'user/get-friend-list/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
    },
    credentials: 'include',
  });
  const jsonData = await response.json();
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  add_friendstoarray(jsonData.friend_list)




console.log("here i will print aray hhh==>>  ", friends_array)
  var usern;
  window.addEventListener('hashchange', async () => {
    const path = window.location.hash.slice(1);
    var component = routes[path] || NotFound;
    if (!isAuthenticated() && path !== '/login') {
      window.location.hash = '/login';
    }
    if (isAuthenticated() && path === "/login")
      window.location.hash = '/';
    usern = path.split('/')[2];

    if (path.startsWith('/user') || (path == '/user' && !friends_array.includes(usern))){
      if (typeof usern === 'undefined' || usern === null || !friends_array.includes(usern) ) 
        component = NotFound;
      else 
        component = routes['/user'];
    }
    await component();
  });

  const path = window.location.hash.slice(1) || '/';
  let component = routes[path] || NotFound;

  if (!isAuthenticated() && path !== '/login') {
    window.location.hash = '/login';
  }
  if (isAuthenticated() && path === "/login")
    window.location.hash = '/';
  
  usern = path.split('/')[2];
  if (path.startsWith('/user') || (path == '/user' && !friends_array.includes(usern))){
    if (typeof usern === 'undefined' || usern === null ||  !friends_array.includes(usern) ) 
      component = NotFound;
    else 
      component = routes['/user'];
  }

  await component();

}

async function get_friends_list() {
  const response = await fetch(api_one + 'user/get-friend-list/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
    },
    credentials: 'include',
  });
  const jsonData = await response.json();
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  add_friendstoarray(jsonData.friend_list)
}


function add_friendstoarray(friendList) {
  if (!friendList) {
    console.error('Notification display container not found');
    return;
  }
  
  friendList =  Object.values(friendList);
  friends_array = [];
 friendList.map( friend => {
   friends_array.push(friend.username);
 });
}
export default Router;
