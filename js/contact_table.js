const ACTION_BUTTON_HTML = 
`<div class="action-button-container">
    <button class="action-button update-button">
        <i class="fa-solid fa-user-pen"></i>
    </button>
    <button class="action-button delete-button">
        <i class="fa-regular fa-trash-can"></i>
    </button>
</div>`;

//update contact popup variables and event listener
const updateContactPopup = document.querySelector('#update-contact-popup');
const closeUpdateContactPopup = document.querySelector('#close-update-contact-popup-button');
closeUpdateContactPopup.addEventListener('click', () => {
    updateContactPopup.close();
    document.getElementById("updated-firstname").value = '';
    document.getElementById("updated-lastname").value = '';
    document.getElementById("updated-phone").value = '';
    document.getElementById("updated-email").value = '';
    document.getElementById("update-contact-result").innerHTML = '';
})

function loadAllContacts() {
    const SEARCH_ENDPOINT = API_URL + "/SearchContact.php";
    // Cannot load the contacts if we cannot find the user's ID
    if (userId == null) {
        console.log("error: userId undefined");
        return;
    }
    // General search request to return all contacts for the user
    let request = {
        "Name": "",
        "Phone": "",
        "Email": "",
        "userID": userId
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", SEARCH_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                if (response["error"] === "No Records Found") {
                    console.log("Found no contacts for user");
                    return;
                }
                // Clear the current table first to account for table reloads that aren't on page loads
                document.getElementById("contacts-table-body").innerHTML = "";
                // Parse the returned contacts and each to the contacts table body
                let contacts = response["results"];
                contacts.forEach((contact) => document.getElementById("contacts-table-body").innerHTML += 
                `<tr>
                    <td>${contact["Name"]}</td>
                    <td>${contact["Phone"]}</td>
                    <td>${contact["Email"]}</td>
                    <td>${ACTION_BUTTON_HTML}</td>
                </tr>`);

                // Add event listeners for delete buttons
                let deleteButtons = document.querySelectorAll('.delete-button');
                deleteButtons.forEach((button, index) => {
                    button.addEventListener("click", () => {
                        // Extract the content of the contact/row the user wants to delete
                        let row = button.closest('tr');
                        let contactName = row.cells[0].textContent;
                        let contactPhone = row.cells[1].textContent;
                        let contactEmail = row.cells[2].textContent;

                        // Ask for user confirmation before deleting contact
                        if(window.confirm("Are you sure you want to delete this contact?")) {
                            // If OK, delete the contact.
                            doDeleteContact(contactName, contactPhone, contactEmail, row);
                        }
                    });
                });
                //Add event listeners for update buttons
                let updateButtons = document.querySelectorAll('.update-button');
                updateButtons.forEach((button) => {
                    button.addEventListener("click", () => {
                        //get cur information in order to prepopulate
                        let row = button.closest('tr');
                        let curName = row.cells[0].textContent.split(' ');
                        let curFirstName = curName[0];
                        let curLastName = curName[1];
                        let curPhone = row.cells[1].textContent;
                        let curEmail = row.cells[2].textContent;
                        //open update contacts pop up
                        updateContactPopup.showModal();
                        //prepopulate fields w/current first and last name
                        document.getElementById('updated-firstname').value = curFirstName;
                        document.getElementById('updated-lastname').value = curLastName;
                        document.getElementById('updated-phone').value = curPhone;
                        document.getElementById('updated-email').value = curEmail;

                    })
                });
            }
        };
        xhr.send(JSON.stringify(request));
    }
    catch (err) {
        console.log(err.message);
    }
}

function doAddContact() {
    const ADDCONTACT_ENDPOINT = API_URL + "/AddContact.php";
    // Cannot add a contact for a user if we cannot find their userID
    if (userId == null) {
        console.log("Error in adding contact: cant find userId");
        return;
    }
    // Grab the information from the Add Contact form fields
    let newFirstName = document.getElementById('new-firstname').value;
    let newLastName = document.getElementById('new-lastname').value;
    let newPhone = document.getElementById('new-phone').value;
    let newEmail = document.getElementById('new-email').value;
    // If the user has not entered a value for all fields
    if (newFirstName === '' || newLastName === '' || newPhone === '' || newEmail === '') {
        // Prompt them to fill all values, and exit
        document.getElementById("add-contact-result").innerHTML = "Please enter a value for all fields";
        return;
    }
    // Formulate Add Contact request
    let newName = newFirstName + ' ' + newLastName;
    let request = {
        "firstname": newFirstName,
        "lastname": newLastName,
        "name": newName,
        "phone": newPhone,
        "email": newEmail,
        "userID": userId
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", ADDCONTACT_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                // If Add Contact was successful
                if (response["error"] === "") {
                    document.getElementById("add-contact-result").innerHTML = "Contact added successfully";
                    // Reload the contact table to show the new contact
                    loadAllContacts();
                }
                else {
                    document.getElementById("add-contact-result").innerHTML = response["error"];
                }
            }
        };
        xhr.send(JSON.stringify(request));
    }
    catch (err) {
        document.getElementById("add-contact-result").innerHTML = err.message;
    }
}

// Contact info to delete is passed in as an argument and is then searched through the entire contact table
function doDeleteContact(contactName, contactPhone, contactEmail, row) {
    const DELTECONTACT_ENDPOINT = API_URL + "/DeleteContact.php"
    // Cannot delete a contact for a user if we cannot find their ID
    if (userId == null) {
        console.log("Error in deleting contact: cant find userId");
        return;
    }
    // Send a delete request with all the info of the contact to be deleted by exact match (SHOULD BE CHANGED TO DELETE BY CONTACT ID)
    let request = {
        "name": contactName,
        "phone": contactPhone,
        "email": contactEmail,
        "userID": userId
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", DELTECONTACT_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                // If successful deletion
                if(response["error"] === "") {
                    // Remove the row directly from the table without having to reload the entire contact table
                    row.parentNode.removeChild(row);
                } else {
                    console.log(response["error"]);
                }
            }
        }
        xhr.send(JSON.stringify(request));
    }
    catch (err) {

    }
}

//update contact
function doUpdateContact(contactId, userId){
    const UPDATECONTACT_ENDPOINT = API_URL + "/UpdateContact.php";

    //cannot update contact if we cannot find userId
    if (userId == null) {
        console.log("Error in updating contact: cant find userId");
        return;
    }
    //Grab the contactID
    let xhr2 = XMLHttpRequest();
    //gotta figure out how to get from api
    xhr2.open("GET");
    let contactId = xhr2.responseText;
    // Grab the information from the Add Contact form fields
    let updatedFirstName = document.getElementById('updated-firstname').value;
    let updatedLastName = document.getElementById('updated-lastname').value;
    let updatedPhone = document.getElementById('updated-phone').value;
    let updatedEmail = document.getElementById('updated-email').value;
    // If the user has not entered a value for all fields
    if (updatedFirstName === '' || updatedLastName === '' || updatedPhone === '' || updatedEmail === '') {
        // Prompt them to fill all values, and exit
        document.getElementById("update-contact-result").innerHTML = "Please enter a value for all fields";
        return;
    }
    //send request with all the info of the contact to be updated by contact id and user id
    let request = {
        "phone": updatedPhone,
        "email": updatedEmail,
        "userID": userId,
        "contactID": contactId,
        "firstname": updatedFirstName,
        "lastname": updatedLastName
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", UPDATECONTACT_ENDPOINT, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function() {
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let response = JSON.parse(xhr.responseText);
                    // If update Contact was successful
                    if (response["error"] === "") {
                        document.getElementById("update-contact-result").innerHTML = "Contact updated successfully";
                        // Reload the contact table to show the new contact
                        loadAllContacts();
                    }
                    else {
                        document.getElementById("update-contact-result").innerHTML = response["error"];
                    }
                }
            };
            xhr.send(JSON.stringify(request));
        }
    }
    catch(err){
        document.getElementById("update-contact-result").innerHTML = err.message;
    }
    

}
// Load all contacts initially
window.onload = () => {
    loadAllContacts();
}

// Contact Table Sorting functionality
let sortDirections = [true, true, true]; // True = Ascending, False = Descending
let tableHeaders = ["nameSort", "phoneSort", "emailSort"];
let tableHeaderButtonIds = ["name-alpha-sort", "phone-number-sort", "email-alpha-sort"];

function sortTable(columnIndex) {
    let table = document.getElementById("contacts-table");
    let rows = Array.prototype.slice.call(table.querySelectorAll("tbody > tr"));

    // Toggle sort direction
    sortDirections[columnIndex] = !sortDirections[columnIndex];

    rows.sort((rowA, rowB) => {
        cellA = rowA.cells[columnIndex].textContent;
        cellB = rowB.cells[columnIndex].textContent;

        //  Numerical comparison
        if (!isNaN(cellA) && !isNaN(cellB)) {
            return sortDirections[columnIndex] ? cellA - cellB : cellB - cellA;
        }

        // String comparison
        return sortDirections[columnIndex] ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });

    rows.forEach((row)=> {
        table.querySelector("tbody").appendChild(row);
    });

    // Toggle the header button appearance based on the sorting direction
    tableHeaderButtonIds.forEach((id, index) => {
        let headerButton = document.getElementById(id);
        
        if (index === columnIndex) {
            if (id !== "phone-number-sort") {
                // Alphabetical sorting
                if (sortDirections[columnIndex]) {
                    headerButton.classList.add("fa-arrow-up-a-z");
                    headerButton.classList.remove("fa-arrow-down-z-a");
                } else {
                    headerButton.classList.add("fa-arrow-down-z-a");
                    headerButton.classList.remove("fa-arrow-up-a-z");
                }
            } else {
                // Numerical sorting
                if (sortDirections[columnIndex]) {
                    headerButton.classList.add("fa-arrow-up-1-9");
                    headerButton.classList.remove("fa-arrow-down-9-1");
                } else {
                    headerButton.classList.add("fa-arrow-down-9-1");
                    headerButton.classList.remove("fa-arrow-up-1-9");
                }
            }
        }
    });
}

// Add event listeners to table header buttons
document.addEventListener("DOMContentLoaded", () => {
    tableHeaders.forEach((header, index) => {
        document.getElementById(header).addEventListener("click", () => {
            sortTable(index);
        });
    });
});

const addContactPopup = document.querySelector('#add-contact-popup');
const openAddContactPopup = document.querySelector('#open-add-contact-popup-button');
const closeAddContactPopup = document.querySelector('#close-add-contact-popup-button');

// Open the add contact popup when the "Add Contact" button is clicked
openAddContactPopup.addEventListener('click', () => {
    addContactPopup.showModal();
})

// Close the add contact popup when the "Close" button is clicked
// and reset the fields inside the popup
closeAddContactPopup.addEventListener('click', () => {
    addContactPopup.close();
    document.getElementById("new-firstname").value = '';
    document.getElementById("new-lastname").value = '';
    document.getElementById("new-phone").value = '';
    document.getElementById("new-email").value = '';
    document.getElementById("add-contact-result").innerHTML = '';
})
