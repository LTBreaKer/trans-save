const api = "https://127.0.0.1:9004/api/";
const csrftoken = getCookie('csrftoken');
const token  = localStorage.getItem('token');
const refresh  = localStorage.getItem('refresh');
import { friendsocket, changeAccess } from "./components/profile/profile.js"

function isAuthenticated() {
    return !!localStorage.getItem('token');
}
  
  function login(token, refresh) {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
}
  
  function logoutf() {
    friendsocket.close();
    localStorage.removeItem('token'); 
    localStorage.removeItem('refresh'); 
  }

  function get_localstorage(string) {
    if (string === 'token')
        return (localStorage.getItem('token'));
    else if (string === 'refresh')
        return (localStorage.getItem('refresh'));
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
  }


  export async function check_access_token() {
    try {
      const response = await fetch(api + 'auth/verify-token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }) 
      });
      if (response.status === 404){
        logoutf();
        window.location.hash = '/login';
      }
      if (response.status !== 200) {
        await changeAccess();
      } 
      if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }

  }

  function change_access() {
    const data = {
      Refresh: get_localstorage('refresh')
  };
  
    fetch(api + '/auth/verify-token/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          // 'X-CSRFToken': csrftoken,
      },
      credentials: 'include',
      body: JSON.stringify(data)
      })
      .then(response => {
          console.log(response);
          return response.json();
      })
      .then(data => {
          console.log(data);
          console.log(data.message, "    <=  message");
          // console.log("it is okay=>  ", response.ok);
          if (data.message === 'Invalid token'){
            const hd = get_localstorage("token");
            console.log(hd);
          }
        
      })
      .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
      });
  
  
  }






  async function log_out_func() {
    console.log("---------------------------------- hello ")
    check_access_token();
    console.log("---------------------------------- hello ")
    const bod = {
      refresh: get_localstorage('refresh')
    }
    fetch(api + 'auth/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'AUTHORIZATION': 'Bearer ' + get_localstorage('token')
        },
        credentials: 'include',
        body: JSON.stringify(bod)
    })
    .then(response => {
        console.log(response);
        console.log(response.data);
        // console.log(response.);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        
        if (data.message === 'User logged out') {
          console.log("==== ===== ===== ===== ===== ===== ===== ");
          logoutf();
            window.location.hash = '/login';
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
   }





  
  export { log_out_func, change_access, logoutf, isAuthenticated, login, get_localstorage, getCookie };
  