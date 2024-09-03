const API_URL = "http://167.99.3.65/LAMPAPI";
function switchToLogin() {
    window.location.href = "index.html";
}

function switchToSignup() {
    window.location.href = "signup.html";
}

function showPassword() {
    let password_input = document.getElementById("password");
    if (password_input.type === "password") {
        password_input.type = "text";
    }
    else {
        password_input.type = "password";
    }
}

function doLogin() {
    const LOGIN_ENDPOINT = API_URL + "/Login.php";
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let request = {
        "login": username,
        "password": password
    };
    console.log(request);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", LOGIN_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                console.log(response);
                if (response["id"] < 1) {
                    document.getElementById("login-or-signup-result").innerHTML = "Username and/or Password not found. Please try again.";
                    return;
                }
                else {
                    window.location.href = "contacts.html";
                }
            }
        };
        xhr.send(JSON.stringify(request));
    }
    catch (err) {
        document.getElementById("login-or-signup-result").innerHTML = err.message;
    }
}

function doSignup() {
    const SIGNUP_ENDPOINT = API_URL + "/RegisterUser.php";
    
    let firstName = document.getElementById('firstName').value;
    let lastName = document.getElementById('lastName').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    if (firstName === '' || lastName === '' || username === '' || password === '') {
        document.getElementById("login-or-signup-result").innerHTML = "Please enter a value for all fields.";
        return;
    }
    let request = {
        "FirstName": firstName,
        "LastName": lastName,
        "Login": username,
        "Password": password
    };
    console.log(request);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", SIGNUP_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                console.log(response);
                if (response["result"] === "User registered successfully.") {
                    window.location.href = "contacts.html";
                }
                else {
                    document.getElementById("login-or-signup-result").innerHTML = "Username is already taken. Please try a different one.";
                    return;
                }
            }
        };
        xhr.send(JSON.stringify(request));
    }
    catch (err) {
        document.getElementById("login-or-signup-result").innerHTML = err.message;
    }
}

function getAllContacts() {
    const SEARCH_ENDPOINT = API_URL + "/SearchContact.php";

    let request = {
        "Name": "",
        "Phone": "",
        "Email": ""
    }
}