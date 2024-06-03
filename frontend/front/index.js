function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
document.addEventListener('DOMContentLoaded', function(event) {
    // Get CSRF token from a cookie or meta tag
    event.preventDefault();
    console.log(getCookie('token'))
    
    const token = localStorage.getItem('token');
    console.log(token);
    const csrftoken = getCookie('csrftoken'); // Replace with your method of retrieving the CSRF token
    fetch(api + 'auth/user/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken, // Include the CSRF token in the headers if needed
            'AUTHORIZATION': 'Token ' + token,
        },
        'X-CSRFToken': csrftoken,
        withCredentials: true,
        credentials: 'include' // Include credentials (cookies) with the request
    })
    .then(response => {
        console.log(response);
        if (!response.ok) {
            console.log('Not logged in');
            window.location.href = '/login.html';
        }
        return response.json();
    })
    .then(data => {
        // Handle successful response with user data
        console.log('User Info:', data);
        // You can now use the user data to personalize the page
        document.getElementById('username').innerText = data.user.username;
        if (data.user.first_name !== null)
            document.getElementById('first_name').innerText = data.user.first_name;
        console.log(data.user.avatar);
        if (data.user.avatar !== null)
            document.getElementById('profile-image').src = data.user.avatar;
        // And so on for other user info
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', function(event) {
    event.preventDefault();
    const csrftoken = getCookie('csrftoken');
    // console.log(csrftoken);
    const token = localStorage.getItem('token');
    console.log(token);
    fetch(api + 'auth/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
            'AUTHORIZATION': 'Token ' + token,
        },
        'X-CSRFToken': csrftoken,
        credentials: 'include'
    })
    .then(response => {
        console.log(response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        localStorage.removeItem('token');
        if (data.message === 'Logout successful') {
            window.location.href = '/login.html';
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
});