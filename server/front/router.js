import Home from './components/home/home.js';
import Profile from './components/profile/profile.js';
import Login from './components/login/login.js';
import NotFound from './components/notfound/notfound.js';
import { isAuthenticated } from './auth.js';

const routes = {
  '/': Home,
  '/profile': Profile,
  '/login': Login,
  '/notfound': NotFound,
};

async function Router() {
  window.addEventListener('hashchange', async () => {
    const path = window.location.hash.slice(1);
    const component = routes[path] || NotFound;

    if (!isAuthenticated() && path !== '/login') {
      window.location.hash = '/login';
      return;
    }

    await component();
  });

  const path = window.location.hash.slice(1) || '/';
  const component = routes[path] || NotFound;

  if (!isAuthenticated() && path !== '/login') {
    window.location.hash = '/login';
    return;
  }

  await component();
}

export default Router;
