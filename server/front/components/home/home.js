
import { loadHTML, loadCSS, player_webSocket } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';

var api = "https://127.0.0.1:9004/api/";
var api1 = "https://127.0.0.1:9005/api/";
async function Home() {
  const html = await loadHTML('./components/home/home.html');
  
  const app = document.getElementById('app');
  app.innerHTML = html;
  await loadCSS('./components/home/home.css');
  

  var csrftoken = getCookie('csrftoken');

await checkFirst();

player_webSocket();
console.log("------fanti =============== ========= -------");
// await get_friends();




console.log("------fanti -------");
  const logout = document.getElementById('logout')
  logout.addEventListener('click', log_out_func);



// =========================== here i will work with media ===========================

// i will work with #butt

const butt = document.querySelector('#butt');
const side = document.querySelector('.sidebar');

butt.addEventListener('click', function() {
  
  side.classList.toggle('active');
});

document.addEventListener('click', (event) => {
  if (!side.contains(event.target) && !butt.contains(event.target)) {
    side.classList.remove('active');
  }
});

const notific = document.querySelector('.notification');
const notifi_display = document.querySelector('.notifi_btn');

notific.addEventListener('click', function() {
  notifi_display.classList.toggle('active');
})


}


//  i will need this to list friend list in home page dont forget that 

//  async function get_friends() {
//   console.log("***************************************");
//   const response = await fetch(api1 + 'user/get-friend-list/', {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + get_localstorage('token'),
//     },
//     credentials: 'include',
//   });
//   console.log("response ==>   ",response);
//   const jsonData = await response.json();
//   console.log("accept anvitation =>     ", jsonData);
//   console.log("==========================================");
//   if (!response.ok) {
//     console.log((`HTTP error! Status: ${response.status}`), Error);
//   }
//   console.log(jsonData.friend_list);
//   displayFriendList(jsonData.friend_list)
//   console.log("***********//////*****//////****");

// }



// function displayFriendList(friendList) {
//    friendList = Object.values(friendList);

// console.log('hello we are from friend list list of them =========');
// if (!friendList) {
//   console.error('Notification display container not found');
//   return;
// }

//   // const send_friend = document.querySelector('.send_friend .send_friend_list');
  
//   // send_friend.innerHTML = friendList.map( friend => ` 
//   //   <div class="friend" data-id="${friend.id}">
//   //   <img id="player1" src="${friend.avatar}" alt="">
//   //   <h2 class="player1">${friend.username}</h2>

//   // `).join('');

// }



async function changeAccess() {
  const data = {
    refresh: get_localstorage('refresh')
  };

  try {
    const response = await fetch(api + 'auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    const jsonData = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    await login(jsonData.access, jsonData.refresh);
    
  } catch (error) {
    // logoutf();
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function checkFirst() {
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
    console.log(response);
    if (response.status !== 200) {
      await changeAccess();
      await fetchUserHomeData();
    } else if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
      const jsonData = await response.json();
      await fetchUserHomeData();
    }
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function fetchUserHomeData() {
  
  
  try {
    const userResponse = await fetch(api + 'auth/get-user/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + get_localstorage('token')
      },
      credentials: 'include',
    });
    
    if (!userResponse.ok) {
      throw new Error('Network response was not ok');
    }
    const userData = await userResponse.json();
    
    const change_user = document.getElementById('UserName');
    const change_imge = document.getElementById('image_user');
    
    change_user.innerHTML = userData.user_data.username;
    change_imge.src = userData.user_data.avatar;
  } catch(error)  {
    console.error('There was a problem with the fetch operation:', error);
  }
  
}

export default Home;


