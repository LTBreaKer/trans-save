
import { loadHTML, loadCSS } from '../../utils.js';
import { login ,log_out_func, logoutf, get_localstorage, getCookie } from '../../auth.js';




var api = "https://127.0.0.1:9004/api/";
async function Home() {
  const html = await loadHTML('./components/home/home.html');
  loadCSS('./components/home/home.css');

  const app = document.getElementById('app');
  app.innerHTML = html;
  

  var csrftoken = getCookie('csrftoken');

await checkFirst();
// -------------------------------------------

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

}


async function changeAccess() {
  const data = {
    refresh: get_localstorage('refresh')
  };
  

  // const response = await fetch(api + 'auth/token/refresh/', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       credentials: 'include',
  //       body: JSON.stringify(data)
  //     });

  //     const jsonData = await response.json();
  //     console.log('New tokens:', jsonData);

  //     if (response === 200) {
  //       await login(jsonData.access, jsonData.refresh);
  //     }

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
    
    // Update local storage with new tokens
    await login(jsonData.access, jsonData.refresh);
    
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// Define the `checkFirst` function
async function checkFirst() {
  const token = get_localstorage('token');
  
  console.log('Token being checked:', token); // Debugging statement
  console.log("--------------------------------------", api);
  try {
    const response = await fetch(api + 'auth/verify-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrftoken, // Uncomment if needed
      },
      credentials: 'include',
      body: JSON.stringify({ token }) // Sending token in the body
    });
    console.log(response);
    if (response.status !== 200) {
      console.log('Token is invalid. Attempting to refresh...');
      await changeAccess();
      // After refreshing, retry fetching user data
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
    
    change_imge.src = userData.user_data.avatar;
    change_user.innerHTML = userData.user_data.username;
  } catch(error)  {
    console.error('There was a problem with the fetch operation:', error);
  }
  
}


// #262b36
// #e8ebfb
export default Home;
