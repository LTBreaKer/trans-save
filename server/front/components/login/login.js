import { loadHTML, loadCSS, getQueryParams, player_webSocket} from '../../utils.js';
import {get_localstorage, login } from '../../auth.js';
import { host } from '../../config.js';

let tokenn;
let error_nbr = 0;
let refrech;

// const host = "127.0.0.1";

const api = `https://${host}:9004/api/`;
async function Login() {
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
        console.log("hello it's workng right 9999");
        console.log("hello it's workng right 88888");
        if (error_nbr === 0)
            signindata();
        error_nbr = 0;
        console.log("89898989898989898988989898889");
    });

    sup_btn.addEventListener('click', e => {
        e.preventDefault();
        validDataInput1();
        if (error_nbr === 0)
            sign_up_data();
        error_nbr = 0;
    });
    
    const params = getQueryParams();
    const code = params.code;
    const intra_errors = document.querySelectorAll('.intra_errors');
    if (code) {
        let response = await fetch(api + 'auth/callback-42/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            'X-CSRFToken': csrftoken,
            credentials: 'include',
            body: JSON.stringify({code})
        })
        let data = await response.json()
        console.log(data)
        // if (response.status === 200) {
            if (data.message === 'Waiting for otp verification'){
                console.log(data.token);
                console.log(data.token.access);
                tokenn = data.token.access;
                refrech = data.token.refresh;
                    handle_otp();
                console.log('hello we are here waiting for verification give me the code ');
            }
    
            if (data.message === 'Login successful') {
                console.log("+-------------------");
                login(data.token.access, data.token.refresh, data.session_id);                
                console.log("+-++++++++++++++++++++++==");
                window.location.href = '/';
            }
        // }
        else {
            if (data.message !== 'Failed to get access token') {

                intra_errors.forEach(element=> {
                    element.innerHTML = data.message;
                })
                console.log(response.message);
            }
        }
        // .then(response => {
        //     if (response.message !== 'Failed to get access token') {

        //         intra_errors.forEach(element=> {
        //             element.innerHTML = "username or email already exists";
        //         })
        //         console.log(response.message);
        //     } else {
        //         element.innerHTML = "";
        //     }
        //     return response.json();
        // })
        //  .then(data => {
        //     console.log(data);
        //     if (data.message === 'Waiting for otp verification'){
        //         console.log(data.token);
        //         console.log(data.token.access);
        //         tokenn = data.token.access;
        //         refrech = data.token.refresh;
        //          handle_otp();
        //         console.log('hello we are here waiting for verification give me the code ');
        //     }
        //     if (data.message === 'user already logged in') {
        //         const ama = document.querySelector('#backerror');
        //         ama.innerText = data.message;
        //     }
    
        //     if (data.message === 'Login successful') {
        //         console.log("+-------------------");
        //         login(data.token.access, data.token.refresh, data.session_id);                
        //         console.log("+-++++++++++++++++++++++==");
        //         window.location.href = '/';
        //     }
        // })
        // .catch(error => {
        //     console.error('There was a problem with the fetch operation:', error);
        // });
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
            console.log(response);
            return response.json();
        })
        .then(data => {
            console.log(data);
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
        } else if (usernameValue.length < 4 ) {
            setError(sup_username, "UserName must be 4 characters at last ");
        } else {
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
        } else if (usernameValue.length < 4) {
            setError(sup_username, "UserName must be 4 characters at last ");
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
        error_nbr = 1;
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

const sign_up_data = async () => {
    console.log("ana hna ana hna ana hna ana hna ana hna hhhhh");
    const data = {
        username: sup_username.value,
        password: sup_password.value,
        email: sup_email.value
    };
    const jsonData = JSON.stringify(data);
    let response = await fetch(api + 'auth/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        'X-CSRFToken': csrftoken,
        credentials: 'include',
        body: jsonData
    })
    let response_data = await response.json()
    console.log(response_data)
    if (response.status === 201){
        if (response_data.message === "User created"){
            login(response_data.token.access, response_data.token.refresh, response_data.session_id)
            player_webSocket();
            window.location.hash = '/'
        }
    }
    else {
        if (response_data.message.username || response_data.message.email) {
            if (response_data.message.username)
                setError(sup_username, response_data.message.username[0]);
            if (response_data.message.email)
                setError(sup_email, response_data.message.email[0]);
        } else {
            setError(sup_password, response_data.message[0]);

        }
        // if (response_data.message.username)
        //     setError(sup_username, response_data.message.username[0]);

    }
    // .then(response=>{
    //     data = await response.json()
    //     console.log(response.json());
    //     if (!response.ok) 
    //         throw new Error('Network response was not ok');
    //     return response.json();
    // })

    // .then(data => {
    //     if (data.message === "User created"){
    //         login(data.token.access, data.token.refresh, data.session_id)
    //         player_webSocket();
    //         window.location.hash = '/'
    //     }
    // })
    // .catch(error => {
    //     console.error('there is error from here');
    // });
}

const signindata = () => {
    let name = 0;
    const data = {
        username: username.value,
        password: password.value
    };    
    console.log(JSON.stringify(data))
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
        console.log(response);
        if (!response.ok){
            console.log("Eroor");
        }

        return response.json();
    })
    .then(data => {
        console.log(data.message)
        console.log(data)
        // console.log(data.detail)
        
        if (data.message && data.message === 'Waiting for otp verification')
        {
            tokenn = data.token.access;
            refrech = data.token.refresh;
            handle_otp();
        }
        else if (data.message && data.message === "user logged in"){
            login(data.access ,data.refresh, data.session_id)
            player_webSocket();
            window.location.hash = '/';
        }
        else if (data.message && data.message === 'user already logged in') {
            console.log("hello we ae hhhdfjdkjfkd djfkdjkf =======> ")
            const ama = document.querySelector('#backerror');
            ama.innerText = data.message;
        }
        else if (data.message && data.message.startsWith('try again')) {
            const ama = document.querySelectorAll('.intra_errors');
            ama.forEach(element => {

                element.innerText = data.message;
            })
        }
        else if (data.detail){
            const ama = document.querySelector('#backerror');
            ama.innerText = "username or password invalid";
        }
    })
    .catch(error => {
        console.error('there is error', error);
    });
}
}


 async function handle_otp() {
    console.log('token === >  ', tokenn);
    
    document.querySelector('.otp').style.display = 'flex';
    const otp_cancel = document.getElementById('otp_cancel');
    otp_cancel.addEventListener('click', () => {
        document.querySelector('.otp').style.display = 'none';
    })
    const otp_input = document.getElementById('otp_input');
    const otp_submit = document.getElementById('otp_submit');
    otp_submit.addEventListener('click', () => {
        console.log("====otp input >:   ", otp_input.value);
        // document.querySelector('.otp').style.display = 'none';
        const data = {
            otp: otp_input.value
        };
        const jsonData = JSON.stringify(data);
    
        fetch(api + 'auth/verify-otp/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'AUTHORIZATION': 'Bearer ' + tokenn,
                // 'Session-ID': get_localstorage('session_id')
            },
            credentials: 'include',
            body: jsonData
        })
        .then(response=> {
            // console.log(response.json());
            console.log(response);
            if (!response.ok) 
                console.log('Failed')
                // throw new Error('Network response was not ok');
            console.log(response);
            return response.json();
        })
        .then(data => {
            const otp_error = document.getElementById('otp_error');
            console.log('========= ',data);
            if (data.message === "otp verified successfully"){
                login(tokenn, refrech, data.session_id);
                window.location.hash = '/'
            }
            else {
                otp_error.innerHTML = data.message; 
            }
        })
        .catch(error => {
            console.error('there is error from here');
        });
    
    })


    console.log('hello we are here.. ');
}
// ------------------------------------------- home here ========== 
 
export default Login;
