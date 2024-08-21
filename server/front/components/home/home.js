
import { loadHTML, loadCSS, player_webSocket } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';




var api = "https://127.0.0.1:9004/api/";
async function Home() {
  const html = await loadHTML('./components/home/home.html');
  
  const app = document.getElementById('app');
  app.innerHTML = html;
  await loadCSS('./components/home/home.css');
  

  var csrftoken = getCookie('csrftoken');

await checkFirst();


fetchNotificatoins();








console.log("------fanti -------");
  const logout = document.getElementById('logout')
  logout.addEventListener('click', log_out_func);


  // hre will be single page aplication for navpages

  // const homepage = document.getElementById('homepage'),
  // gamepage = document.getElementById('gamepage'),
  // profilepage = document.getElementById('profilepage');



  // profilepage.addEventListener('click', () => {
  //   window.location.hash = '/profile';
  // });

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





// ---------------------------------------------------------------------------------------------





async function fetchNotificatoins() {
  try {
    const simulatedResponse = await player_webSocket();
    console.log("ress ==========   ",simulatedResponse);
    const response = new Promise((resolve) => {
      setTimeout(() => resolve({ json: () => Promise.resolve(simulatedResponse) }), 1000);
  });

    // Check if simulatedResponse and its data property are defined
    const data = await response;
    const notificationsData = await data.json();
    console.log("----------->     " ,notificationsData);
  
    displayNotifications(notificationsData);
} catch (e) {
    console.error('Error fetching notifications:', e);
}

}


function displayNotifications(notifications) {
  notifications = JSON.parse(notifications);
const notifi_display = document.querySelector('.notifi_btn');
function displayNotifications(notifications) {
  const notificationsArray = Array.isArray(notifications) ? notifications : [notifications];

  notifi_display.innerHTML = notificationsArray.map(notifications => `
    <div class="send_request">
      <div class="img_text">
        <img src="${notifications.friend_request.sender_data.user_data.avatar}" alt="">
        <h6>${notifications.friend_request.message}</h6>
      </div>
      <div class="acc_dec">
        <button class="accept">Accept</button>
        <button class="decline">Decline</button>
      </div>
    </div>
  `).join('');

  // Add event listeners for the buttons
  notifi_display.querySelectorAll('.accept').forEach(button => {
    button.addEventListener('click', handleAccept);
  });

  notifi_display.querySelectorAll('.decline').forEach(button => {
    button.addEventListener('click', handleDecline);
  });
}
}








function handleAccept(event) {
  // Add your accept logic here
  const notificationDiv = event.target.closest('.send_request');
  notificationDiv.remove(); // Example action: remove notification
  console.log('Notification accepted');
}

// Handler for decline button
function handleDecline(event) {
  // Add your decline logic here
  const notificationDiv = event.target.closest('.send_request');
  notificationDiv.remove(); // Example action: remove notification
  console.log('Notification declined');
}
// ---------------------------------------------------------------------------------------------







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
    console.log('New tokens:', jsonData);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    // Update local storage with new tokens and new refresh 
    await login(jsonData.access, jsonData.refresh);
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// Define the `checkFirst` function
async function checkFirst() {
  const token = get_localstorage('token');
  
  console.log('Token being checked:', token);
  console.log("--------------------------------------", api);
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
      console.log('Token is invalid. Attempting to refresh...');
      await changeAccess();
      console.log("lkfjkdsjfkljsdlkfjklsdjflkjsdlkf");
      await fetchUserHomeData();
    } else if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    } else {
      const jsonData = await response.json();
      console.log(jsonData);
      console.log('Token verification response:', jsonData);
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


// #262b36
// #e8ebfb
export default Home;







// const serch_butt = document.querySelector('.search-btn');
// const search_btnn = document.querySelector('.search-btn');


// const  seafr = document.querySelector('.seafr');
// serch_butt.addEventListener('click', ()=> {
//   seafr.classList.add('active')
//   search_btnn.classList.add('active');
//   console.log('Hello we are here in search bar');
// });

// document.addEventListener('click', (event) => {
//   if (!serch_butt.contains(event.target) && !seafr.contains(event.target)) {
//     seafr.classList.remove('active');
//     search_btnn.classList.remove('active');
//   }
// });