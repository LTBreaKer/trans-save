import Home from './components/home/home.js';
import Profile from './components/profile/profile.js';
import Login from './components/login/login.js';
import NotFound from './components/notfound/notfound.js';
import Friends from './components/friends/friends.js';
import { isAuthenticated, get_localstorage } from './auth.js';


const api = "https://127.0.0.1:9004/api/";

const routes = {
  '/': Home,
  '/profile': Profile,
  '/login': Login,
  '/notfound': NotFound,
  '/user': Friends,
};

async function Router() {

  var usern;
  window.addEventListener('hashchange', async () => {
    const path = window.location.hash.slice(1);
    var component = routes[path] || NotFound;

    if (!isAuthenticated() && path !== '/login') {
      window.location.hash = '/login';
      return;
    }
    if (isAuthenticated() && path === "/login")
      window.location.hash = '/';
  
    if (path.startsWith('/user')){
      component = routes['/user'];
      usern = path.split('/')[2];
      console.log(usern);
    // }
    // const data = {
    //   username: usern
    // };
    
    //   const response = await fetch(api + 'auth/get-user-by-username/', {
    //     method: 'GET',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'AUTHORIZATION': "Bearer " + get_localstorage('token')
    //     },
    //     credentials: 'include',
    //     // body: JSON.stringify(data)
    //   });
    //   console.log("DATA OF USER -----------------------------");
    //   const jsonData = await response.json();
    //   console.log(jsonData);
    
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! Status: ${response.status}`);
    //   }
    






    }
    await component();
  });

  const path = window.location.hash.slice(1) || '/';
  const component = routes[path] || NotFound;

  if (!isAuthenticated() && path !== '/login') {
    window.location.hash = '/login';
    return;
  }
  if (isAuthenticated() && path === "/login")
    window.location.hash = '/';


  await component();
}

export default Router;
