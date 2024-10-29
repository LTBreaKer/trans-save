const api = "https://127.0.0.1:9004/api/";
const csrftoken = getCookie('csrftoken');
const token  = localStorage.getItem('token');
const refresh  = localStorage.getItem('refresh');
import { pong_game_score } from "./components/ping/script.js";
import { friendsocket, changeAccess } from "./components/profile/profile.js"
import { add_game_score } from "./components/ta/script.js";

function isAuthenticated() {
    return !!localStorage.getItem('token');
}
  
  function login(token, refresh, session_id) {
    localStorage.setItem('token', token);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('session_id', session_id);
  }
  
  function logoutf() {
    function clearOnlineStatuses() {
      const allFriends = document.querySelectorAll('.friends');
      allFriends.forEach(friend => {
        const onlineDiv = friend.querySelector('.onlinen');
        if (onlineDiv) {
          onlineDiv.style.backgroundColor = 'gray';
        }
      });
    }
    
    if (friendsocket && friendsocket.readyState === WebSocket.OPEN)
      friendsocket.close();
    // friendsocket = null
    localStorage.removeItem('token'); 
    localStorage.removeItem('refresh'); 
    localStorage.removeItem('session_id');
    localStorage.removeItem("winner");
    localStorage.removeItem("game_id");
    localStorage.removeItem("dataPongMatch");

  }

  function get_localstorage(string) {
    if (string === 'token')
        return (localStorage.getItem('token'));
    else if (string === 'refresh')
        return (localStorage.getItem('refresh'));
    else if (string === 'session_id')
        return(localStorage.getItem('session_id'));
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
    const token = get_localstorage('token');
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
    await check_access_token();
    console.log("---------------------------------- hello ")
    if (localStorage.getItem("winner") && localStorage.getItem("game_id") )
      await add_game_score();
    if (localStorage.getItem("dataPongMatch"))
      await pong_game_score();
    const bod = {
      refresh: get_localstorage('refresh')
    }
    fetch(api + 'auth/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'AUTHORIZATION': 'Bearer ' + get_localstorage('token'),
            'Session-ID': get_localstorage('session_id')

        },
        credentials: 'include',
        body: JSON.stringify(bod)
    })
    .then(response => {
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
  