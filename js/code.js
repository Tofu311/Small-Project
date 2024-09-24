const API_URL = "http://team6.xyz/LAMPAPI";
function switchToLogin() {
    window.location.href = "login.html";
}

function switchToSignup() {
    window.location.href = "signup.html";
}

let userId = 0;
let firstName = "";
let lastName = "";

// Show/Hide password functionality
let show_button = document.getElementById("show-password-button");
let password_input = document.getElementById("password");
try {
    show_button.addEventListener("click", function() {
        if(password_input.type === "password") {
            password_input.type = "text";
            show_button.innerHTML = "Hide password";
        } else {
            password_input.type = "password";
            show_button.innerHTML = "Show password";
        }
    });
} catch (err) {
    
}

function handleLoginKeyDown(event) {
    if (event.key === "Enter") {
        doLogin();
    }
}

function handleSignupKeyDown(event) {
    if (event.key === "Enter") {
        doSignup();
    }
}

function doLogin() {
    const LOGIN_ENDPOINT = API_URL + "/Login.php";
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    if (username === '' || password === '') {
        document.getElementById("login-or-signup-result").innerHTML = "Please enter a value for both username and password.";
        return;
    }
    let request = {
        "login": username,
        "password": password
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", LOGIN_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                if (response["id"] < 1) {
                    document.getElementById("login-or-signup-result").innerHTML = "Username and/or Password not found. Please try again.";
                    return;
                }
                else {
                    userId = response["id"]
                    firstName = response["firstName"]
                    lastName = response["lastName"]
                    saveCookie();
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

    // Check for blank fields
    if (firstName === '' || lastName === '' || username === '' || password === '') {
        document.getElementById("login-or-signup-result").innerHTML = "Please enter a value for all fields.";
        return;
    }

    // Define password criteria
    const lengthCriteria = password.length >= 8;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const numberCriteria = /\d/.test(password);
    const specialCharCriteria = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Check for password validity. Passwords are at least 8 characters in length, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
    if(!(lengthCriteria && uppercaseCriteria && lowercaseCriteria && numberCriteria && specialCharCriteria)) {
        document.getElementById("login-or-signup-result").innerHTML = "Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character";
        return;
    }
    let request = {
        "FirstName": firstName,
        "LastName": lastName,
        "Login": username,
        "Password": password
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", SIGNUP_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                if (response["result"] === "User registered successfully.") {
                    doLogin();
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

// Save the user's login to cookies but have it expire in 20 minutes
function saveCookie() {
    let minutes = 20;
    let date = new Date();
    date.setTime(date.getTime()+(minutes*60*1000));
    document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

// Read any saved cookies.
// If they are valid, log the user in and bring them to contacts page.
// If they are invalid or do not exist, bring them to login page.
function readCookie() {
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) {
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if(tokens[0] == "firstName") {
			firstName = tokens[1];
		}
		else if(tokens[0] == "lastName") {
			lastName = tokens[1];
		}
		else if(tokens[0] == "userId") {
			userId = parseInt(tokens[1].trim());
		}
	}
	
	if(userId < 0) {
		window.location.href = "login.html";
	}
	else {
        console.log(`Welcome ${firstName} ${lastName}`);
        // document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout() {
    userId = 0;
    firstName = "";
    lastName = "";
    document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}