
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while ((m = regex.exec(queryString)) !== null) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}

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

const csrftoken = getCookie('csrftoken');
token  = localStorage.getItem('token');
fetch(api + 'auth/user/', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken, // Include the CSRF token in the headers if needed
        'AUTHORIZATION': 'Token ' + token,
    },
    'X-CSRFToken': csrftoken,
    credentials: 'include'
})
.then(response => {
    console.log(response);
    return response.json();
})
.then(data => {
    console.log(data);
    if (data.message === 'User found') {
        window.location.href = '/index.html';
    }
})

const params = getQueryParams();
const code = params.code;
if (code) {
    fetch(api + 'auth/callback/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        'X-CSRFToken': csrftoken,
        credentials: 'include',
        body: JSON.stringify({code})
    })
    .then(response => {
        console.log(response);
        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.message === 'Login successful') {
            token = data.token;
            localStorage.setItem('token', token);
            window.location.href = '/index.html';
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

}



document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log('cookie = ', document.cookie);
    
    console.log(csrftoken);
    // Serialize form data into JSON
    const formData = new FormData(this);
    const formDataJson = {};
    formData.forEach(function(value, key){
        formDataJson[key] = value;
    });

    // Send JSON data to backend API
    console.log(JSON.stringify(formDataJson)),
    fetch(api + 'auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        'X-CSRFToken': csrftoken,
        credentials: 'include',
        body: JSON.stringify(formDataJson)
    })
    .then(response => {
        // console.log(response.json());
        if (!response.ok) {
            document.getElementById("error").innerHTML = "Invalid username or password";
            // throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Handle successful response from backend
        console.log(data);
        if (data.message === 'Login successful') {
            token = data.token;
            localStorage.setItem('token', token);
            window.location.href = '/index.html';
        }
        // Redirect or perform other actions as needed
    })
    .catch(error => {
        // Handle errors
        console.error('There was a problem with the fetch operation:', error);
    });
});

const login_42_btn = document.getElementById('login-42');
login_42_btn.addEventListener('click', function(event) {
    event.preventDefault();
    fetch(api + 'auth/login_42/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        'X-CSRFToken': csrftoken,
        credentials: 'include'
    })
    .then(response => {
        console.log(response);
        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.message === 'Redirecting to 42 login')
            window.location.href = data.url;
        if (data.message === 'Login successful') {
            window.location.href = '/index.html';
        }
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
})