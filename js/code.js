const API_URL = "http://167.99.3.65/LAMPAPI";
function switchToLogin() {
    window.location.href = "index.html";
}

function switchToSignup() {
    window.location.href = "signup.html";
}

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
    console.log(err);
}

// Contact Table Sorting functionality
function sortTable(columnIndex) {
    let table = document.getElementById("contacts-table");
    let rows = Array.prototype.slice.call(table.querySelectorAll("tbody > tr"));

    rows.sort((rowA, rowB) => {
        cellA = rowA.cells[columnIndex].textContent;
        cellB = rowB.cells[columnIndex].textContent;

        //  Numerical comparison
        if(!isNaN(cellA) && !isNaN(cellB)) {
            return cellA - cellB;
        }

        // String comparison
        return cellA.localeCompare(cellB);
    });

    rows.forEach((row)=> {
        table.querySelector("tbody").appendChild(row);
    });
}

// Add event listeners to table headers
document.getElementById("nameSort").addEventListener("click", () => {
    sortTable(0);
});

document.getElementById("phoneSort").addEventListener("click", () => {
    sortTable(1);
});

document.getElementById("emailSort").addEventListener("click", () => {
    sortTable(2);
});

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

function getAllContactsMOCK() {
    return [
            {
                "Name": "Arup Updated",
                "Phone": "123-456-7890",
                "Email": "TBrady12@ucf.edu"
            },
            {
                "Name": "Tanvir",
                "Phone": "407-823-5043",
                "Email": "Tanvir.Ahmed@ucf.edu"
            },
            {
                "Name": "Andrew",
                "Phone": "407-823-2844",
                "Email": "Andrew.Steinberg@ucf.edu"
            },
            {
                "Name": "Paul",
                "Phone": "407-823-5239",
                "Email": "Paul.Gazzillo@ucf.edu"
            },
            {
                "Name": "Chris Coopa",
                "Phone": "386-299-0300",
                "Email": "dasDofen@ucf.edu"
            }
        ]
}

function loadAllContacts() {
    const SEARCH_ENDPOINT = API_URL + "/SearchContact.php";
    let request = {
        "Name": "",
        "Phone": "",
        "Email": ""
    }
    console.log(request);
    let xhr = new XMLHttpRequest();
    xhr.open("POST", SEARCH_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                contacts = response["results"];
                contacts.forEach((contact) => document.getElementById("contacts-table-body").innerHTML += `<tr><td>${contact["Name"]}</td><td>${contact["Phone"]}</td><td>${contact["Email"]}</td></tr>`);
            }
        };
        xhr.send(JSON.stringify(request));
    }
    catch (err) {
        console.log(err.message);
    }
}