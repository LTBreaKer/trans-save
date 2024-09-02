
import { loadHTML, loadCSS, player_webSocket } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';

var api = "https://127.0.0.1:9004/api/";
var api1 = "https://127.0.0.1:9005/api/";
async function Home() {
  const html = await loadHTML('./components/home/home.html');
  
  const app = document.getElementById('app');
  app.innerHTML = html;
  await loadCSS('./components/home/home.css');
  
<<<<<<< HEAD

  var csrftoken = getCookie('csrftoken');

await checkFirst();

player_webSocket();
console.log("------fanti =============== ========= -------");
await get_friends();




console.log("------fanti -------");
  const logout = document.getElementById('logout')
  logout.addEventListener('click', log_out_func);



=======
  var csrftoken = getCookie('csrftoken');

  await checkFirst();
  player_webSocket();
  // await get_friends();

  const logout = document.getElementById('logout')
  logout.addEventListener('click', log_out_func);

>>>>>>> fanti
// =========================== here i will work with media ===========================

// i will work with #butt

<<<<<<< HEAD
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





// notifi_display.querySelectorAll('.accept').forEach(button => {
//   button.addEventListener('click', handleAccept);
// });

// notifi_display.querySelectorAll('.decline').forEach(button => {
//   button.addEventListener('click', handleDecline);
// });



}

async function get_friends() {
  console.log("***************************************");
  const response = await fetch(api1 + 'user/get-friend-list/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + get_localstorage('token'),
    },
    credentials: 'include',
  });
  const jsonData = await response.json();
  console.log("accept anvitation =>     ", jsonData);
  if (!response.ok) {
    console.log((`HTTP error! Status: ${response.status}`), Error);
  }
  console.log(jsonData.friend_list);
  displayFriendList(jsonData.friend_list)
  console.log("***********//////*****//////****");


}



function displayFriendList(friendList) {
  if (Array.isArray(friendList)) {
    friendList.forEach(friend => {
      const username = friend.username;
      const avatar = friend.avatar || 'default-avatar.png'; // Fallback to a default avatar if none is provided

      console.log(`User: ${username}, Avatar: ${avatar}`);
  });

  }
}
=======
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



// ===== ====== ======= ======== here iwill work with games

  const gamepage = document.getElementById('gamepage');

  gamepage.addEventListener('click', () => {
    console.log('hello iiiiiiiiii');
    document.querySelector('.games').style.display = 'flex';
    document.querySelector('.conta').style.display = 'flex';
  })

  const mer_game = document.getElementById('mer_game');
  const mol_game = document.getElementById('mol_game');

  mer_game.addEventListener('click', () => {
    console.log("---------");
    document.querySelector('.conta').style.display = 'none';
    document.querySelector('.mer_cont').style.display = 'flex';

  })




const exitPups = document.querySelectorAll('.exit_pup');

exitPups.forEach(exitPup => {
    exitPup.addEventListener('click', () => {
    document.querySelector('.mer_cont').style.display = 'none';
    document.querySelector('.games').style.display = 'none';
    document.querySelector('.conta').style.display = 'none';

    });
});

// const mol_cont = document.querySelector('.moloaa');
  mol_game.addEventListener('click', () => {
    console.log("hello we are here ");
    window.location.hash = '/pingpong';
  })




// ===== ===== ===== ====== ===== ====== ======


}


>>>>>>> fanti
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
<<<<<<< HEAD
    
=======
>>>>>>> fanti
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function fetchUserHomeData() {
<<<<<<< HEAD
  
  
=======
>>>>>>> fanti
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
<<<<<<< HEAD
  
=======
>>>>>>> fanti
}

export default Home;


