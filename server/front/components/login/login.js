import { loadHTML, loadCSS, getQueryParams } from '../../utils.js';
import {login } from '../../auth.js';


async function Login() {
    const api = "https://127.0.0.1:9004/api/";
    const token  = localStorage.getItem('token');
    const csrftoken = getCookie('csrftoken');


    const html = await loadHTML('./components/login/login.html');
    loadCSS('./components/login/login.css');
    
    const app = document.getElementById('app');
    app.innerHTML = html;


    //  fix login display signup and signin 

    const signup_btt = document.querySelector('.signup_btt');
    const signin_btt = document.querySelector('.signin_btt');
    const form = document.querySelector('.form');

    signin_btt.addEventListener('click', () => {
        form.classList.add('active');
    })

    signup_btt.addEventListener('click', () => {
        form.classList.remove('active');
    })

// fix input user check and save information 

    const sin_btn = document.getElementById('sin_btn');
    const sup_btn = document.getElementById('sup_btn');
    const sup_email = document.getElementById('sup_email');
    const sup_username = document.getElementById('sup_username');
    const sup_password = document.getElementById('sup_password');
    const password = document.getElementById('password');
    const username = document.getElementById('username');

    sin_btn.addEventListener('click', e =>{
        e.preventDefault();
        validDataInput();
        //console.log("hello it's workng right 9999");
        //console.log("hello it's workng right 88888");
        signindata();
        //console.log("89898989898989898988989898889");
    });

    sup_btn.addEventListener('click', e => {
        e.preventDefault();
        validDataInput1();
        sign_up_data();
    });
    
    const params = getQueryParams();
    const code = params.code;
    if (code) {
        fetch(api + 'auth/callback-42/', {
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
            //console.log(response);
            return response.json();
        })
        .then(data => {
            //console.log(data);
            if (data.message === 'Login successful') {
                login(data.token.access, data.token.refresh);
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

        document.querySelectorAll('.intra-login').forEach(intraLogin => {
            intraLogin.addEventListener('click', e => {
                e.preventDefault();
        fetch(api + 'auth/login-42/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            'X-CSRFToken': csrftoken,
            credentials: 'include'
        })
        .then(response => {
            //console.log(response);
            return response.json();
        })
        .then(data => {
            //console.log(data);
            if (data.message === 'Redirecting to 42 login')
                window.location.href = data.url;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    })
});
    const validDataInput = () => {
        const usernameValue = username.value;
        const passwordValue = password.value;

        if (usernameValue === ''){
            setError(username, "UserName  is required")
        } 
        else {
            setSuccess(username);
        }
        if (passwordValue === '') {
            setError(password, "Password is required");
        } else if (passwordValue.length < 8){
            setError(password, "Password must be at least 8 characters");
        } else {
            setSuccess(password);
        }
    }


    const validDataInput1 = () => {
        const emailValue = sup_email.value;
        const passwordValue = sup_password.value;
        const usernameValue = sup_username.value;

        if (emailValue === ''){
            setError(sup_email, "Email is required")
        } else if (!isValidEmail(emailValue)) {
            setError(sup_email, "Provide a Vallid email address");
        } else {
            setSuccess(sup_email);
        }
        
        
        if (passwordValue === '') {
            setError(sup_password, "Password is required");
        } else if (passwordValue.length < 8){
            setError(sup_password, "Password must be at least 8 characters");
        } else {
            setSuccess(sup_password);
        }
        
        if (usernameValue === ''){
            setError(sup_username, "UserName is required");
        } else{
            setSuccess(sup_username);
        }
    }

    const isValidEmail = signupemail => {
        const re =  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return (re.test(String(signupemail).toLowerCase()));
    }

    const setError = (element, message) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    }

    const setSuccess = element => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
        errorDisplay.innerText = '';
        inputControl.classList.add('success');
        inputControl.classList.remove('error');
    }

// here i will work with login and regester and other things 

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

const sign_up_data = () => {
    //console.log("ana hna ana hna ana hna ana hna ana hna hhhhh");
    const data = {
        username: sup_username.value,
        password: sup_password.value,
        email: sup_email.value
    };
    const jsonData = JSON.stringify(data);
    fetch(api + 'auth/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        'X-CSRFToken': csrftoken,
        credentials: 'include',
        body: jsonData
    })
    .then(response=> {
        if (!response.ok) 
            throw new Error('Network response was not ok');
        //console.log(response);
        return response.json();
    })
    .then(data => {
        if (data.message === "User created"){
            login(data.token.access, data.token.refresh)
            window.location.hash = '/'
        }
    })
    .catch(error => {
        console.error('there is error from here');
    });
}

const signindata = () => {
    let name = 0;
    const data = {
        username: username.value,
        password: password.value
    };    
    //console.log(JSON.stringify(data))
    fetch(api + 'auth/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        'X-CSRFToken': csrftoken,
        credentials: 'include',
        body: JSON.stringify(data)
    })
    .then(response => {
        //console.log(response);
        if (!response.ok){
            //console.log("Eroor");
        }
        else if (response.status === 200)
            name = 1;
        return response.json();
    })
    .then(data => {
        //console.log(data)
        //console.log(data.access)
        if (name === 1){
            login(data.access ,data.refresh)
            window.location.hash = '/';
        }
    })
    .catch(error => {
        console.error('there is error', error);
    });

}


}
// ------------------------------------------- home here ========== 
 
export default Login;
