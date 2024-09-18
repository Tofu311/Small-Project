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
const closeUpdateContactPopup = document.querySelector('#cancel-update-contact-button');
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
        "firstname": "",
        "lastname": "",
        "phone": "",
        "email": "",
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
                    <td id="hidden-contactID">${contact["ID"]}</td>
                    <td>${contact["FirstName"]}</td>
                    <td>${contact["LastName"]}</td>
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
                        let contactID = row.cells[0].textContent;

                        // Ask for user confirmation before deleting contact
                        if(window.confirm("Are you sure you want to delete this contact?")) {
                            // If OK, delete the contact.
                            doDeleteContact(contactID, row);
                        }
                    });
                });
                //Add event listeners for update buttons
                let updateButtons = document.querySelectorAll('.update-button');
                updateButtons.forEach((button) => {
                    button.addEventListener("click", () => {
                        //get cur information in order to prepopulate
                        let row = button.closest('tr');
                        let contactID = row.cells[0].textContent;
                        let curFirstName = row.cells[1].textContent;
                        let curLastName = row.cells[2].textContent;
                        let curPhone = row.cells[3].textContent;
                        let curEmail = row.cells[4].textContent;
                        //open update contacts pop up
                        updateContactPopup.showModal();
                        //prepopulate fields w/current first and last name
                        document.getElementById('updated-firstname').value = curFirstName;
                        document.getElementById('updated-lastname').value = curLastName;
                        document.getElementById('updated-phone').value = curPhone;
                        document.getElementById('updated-email').value = curEmail;
                        document.getElementById('contactID').value = contactID;
                        

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
    let request = {
        "firstname": newFirstName,
        "lastname": newLastName,
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
                    // Close the modal dialog box
                    addContactPopup.close();
                    clearAddContactDialog();
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
function doDeleteContact(contactID, row) {
    const DELTECONTACT_ENDPOINT = API_URL + "/DeleteContact.php"
    // Cannot delete a contact for a user if we cannot find their ID
    if (userId == null) {
        console.log("Error in deleting contact: cant find userId");
        return;
    }
    // Send a delete request with all the info of the contact to be deleted by exact match (SHOULD BE CHANGED TO DELETE BY CONTACT ID)
    let request = {
        "contactID": contactID,
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
function doUpdateContact(){
    const UPDATECONTACT_ENDPOINT = API_URL + "/UpdateContact.php";

    //cannot update contact if we cannot find userId
    if (userId == null) {
        console.log("error: userId undefined");
        return;
    }
    //Grab the contactID
    
    
    // Grab the information from the Add Contact form fields
    let updatedFirstName = document.getElementById('updated-firstname').value;
    let updatedLastName = document.getElementById('updated-lastname').value;
    let updatedPhone = document.getElementById('updated-phone').value;
    let updatedEmail = document.getElementById('updated-email').value;
    let contactID = document.getElementById('contactID').value;
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
        "contactID": contactID,
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

function doSearchContact() {
    const SEARCH_ENDPOINT = API_URL + "/SearchContact.php";
    // Cannot load the contacts if we cannot find the user's ID
    if (userId == null) {
        console.log("error: userId undefined");
        return;
    }
    let search_criteria = document.getElementById("search-bar").value;
    // Cannot search for empty value
    if (search_criteria == null) {
        return;
    }
    // Search request to return all contacts for user that fit the search criteria
    let request = {
        "firstname": search_criteria,
        "lastname": search_criteria,
        "phone": search_criteria,
        "email": search_criteria,
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
                    // Put empty table
                    document.getElementById("contacts-table-body").innerHTML = "";
                    return;
                }
                let filterBox = document.getElementById("filter-box");
                if (filterBox) {
                    filterBox.remove();
                }
                document.getElementById("search-bar-container").innerHTML += `
                <div id="filter-box">
                    <h id="showing-results-for-text">Showing results for</h>
                    <h id="filter-criteria-text">${search_criteria}</h>
                    <button id="clear-filter-button" onclick="clearSearchFilter();">
                        <i class="fa-solid fa-xmark fa-2xl" style="color: white;"></i>
                    </button>
                </div>
                `;
                // Clear the current table first to account for table reloads that aren't on page loads
                document.getElementById("contacts-table-body").innerHTML = "";
                // Parse the returned contacts and add each to the contacts table body
                let contacts = response["results"];
                contacts.forEach((contact) => document.getElementById("contacts-table-body").innerHTML += 
                `<tr>
                    <td id="hidden-contactID">${contact["ID"]}</td>
                    <td>${contact["FirstName"]}</td>
                    <td>${contact["LastName"]}</td>
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
                        let contactID = row.cells[0].textContent;

                        // Ask for user confirmation before deleting contact
                        if(window.confirm("Are you sure you want to delete this contact?")) {
                            // If OK, delete the contact.
                            doDeleteContact(contactID, row);
                        }
                    });
                });
                //Add event listeners for update buttons
                let updateButtons = document.querySelectorAll('.update-button');
                updateButtons.forEach((button) => {
                    button.addEventListener("click", () => {
                       //get cur information in order to prepopulate
                       let row = button.closest('tr');
                       let contactID = row.cells[0].textContent;
                       let curFirstName = row.cells[1].textContent;
                       let curLastName = row.cells[2].textContent;
                       let curPhone = row.cells[3].textContent;
                       let curEmail = row.cells[4].textContent;
                       //open update contacts pop up
                       updateContactPopup.showModal();
                       //prepopulate fields w/current first and last name
                       document.getElementById('updated-firstname').value = curFirstName;
                       document.getElementById('updated-lastname').value = curLastName;
                       document.getElementById('updated-phone').value = curPhone;
                       document.getElementById('updated-email').value = curEmail;
                       document.getElementById('contactID').value = contactID;

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


function clearSearchFilter() {
    let filterBox = document.getElementById("filter-box");
    filterBox.remove();
    loadAllContacts();
}

// Load all contacts initially
window.onload = () => {
    loadAllContacts();
}

// Contact Table Sorting functionality
let sortDirections = [true, true, true, true]; // True = Ascending, False = Descending
let tableHeaders = ["firstNameSort", "lastNameSort", "phoneSort", "emailSort"];
let tableHeaderButtonIds = ["first-name-alpha-sort", "last-name-alpha-sort", "phone-number-sort", "email-alpha-sort"];

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

function clearAddContactDialog() {
    document.getElementById("new-firstname").value = '';
    document.getElementById("new-lastname").value = '';
    document.getElementById("new-phone").value = '';
    document.getElementById("new-email").value = '';
    document.getElementById("add-contact-result").innerHTML = '';
}

// Close the add contact popup when the "Cancel" button is clicked
// and reset the fields inside the popup
const cancelAddContactButton = document.getElementById("cancel-add-contact-button");
cancelAddContactButton.addEventListener('click', () => {
    addContactPopup.close();
    clearAddContactDialog();
});