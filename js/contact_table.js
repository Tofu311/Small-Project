let actionButtonHTML = 
`<div class="action-button-container">
    <button class="action-button">
        <i class="fa-solid fa-user-pen"></i>
    </button>
    <button class="action-button delete-button">
        <i class="fa-regular fa-trash-can"></i>
    </button>
</div>`;

function loadAllContacts() {
    const SEARCH_ENDPOINT = API_URL + "/SearchContact.php";
    if (userId == null) {
        console.log("error: userId undefined");
        return;
    }
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
                //console.log(xhr.responseText);
                let response = JSON.parse(xhr.responseText);
                if (response["error"] === "No Records Found") {
                    console.log("Found no contacts for user");
                    return;
                }
                // Clear the current table first
                document.getElementById("contacts-table-body").innerHTML = "";
                let contacts = response["results"];
                contacts.forEach((contact) => document.getElementById("contacts-table-body").innerHTML += 
                `<tr>
                    <td>${contact["Name"]}</td>
                    <td>${contact["Phone"]}</td>
                    <td>${contact["Email"]}</td>
                    <td>${actionButtonHTML}</td>
                </tr>`);

                // Add event listeners for delete buttons
                let deleteButtons = document.querySelectorAll('.delete-button');
                deleteButtons.forEach((button, index) => {
                    button.addEventListener("click", () => {
                        let row = button.closest('tr');
                        let contactName = row.cells[0].textContent;
                        let contactPhone = row.cells[1].textContent;
                        let contactEmail = row.cells[2].textContent;

                        doDeleteContact(contactName, contactPhone, contactEmail, row);
                    });
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
    if (userId == null) {
        console.log("Error in adding contact: cant find userId");
        return;
    }
    let newFirstName = document.getElementById('new-firstname').value;
    let newLastName = document.getElementById('new-lastname').value;
    let newPhone = document.getElementById('new-phone').value;
    let newEmail = document.getElementById('new-email').value;
    if (newFirstName === '' || newLastName === '' || newPhone === '' || newEmail === '') {
        document.getElementById("add-contact-result").innerHTML = "Please enter a value for all fields";
        return;
    }
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
                if (response["error"] === "") {
                    document.getElementById("add-contact-result").innerHTML = "Contact added successfully";
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
    if (userId == null) {
        console.log("Error in adding contact: cant find userId");
        return;
    }

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

// $(document).ready(function() {
//     $("#contacts-table-body tr").click(function() {
//         $(this).addClass('selected').siblings().removeClass('selected');
//         // var value = $(this).find('td:first').html();
//         // console.log(value);
//         $("#contacts-table-body tr .action-buttons").remove();

//         var buttons = `
//             <span class="action-buttons">
//             <button class="edit-btn">Edit</button>
//             <button class="delete-btn">Delete</button>
//             </span>`;
//         this.innerHTML += buttons;

//         // Handle Edit button click
//         $(".edit-btn").click(function(e){
//             e.stopPropagation(); // Prevent triggering the row click event
//             alert('Edit button clicked for row: ' + $(this).closest('tr').find('td:first').html());
//             // Add your custom functionality for Edit here
//         });

//         $(".delete-btn").click(function(e){
//             e.stopPropagation(); // Prevent triggering the row click event
//             choice = confirm('Are you sure you want to delete contact ' + $(this).closest('tr').find('td:first').html() + '?');
//             // Add your custom functionality for Delete here
//          });
//     });
// });

const addContactPopup = document.querySelector('#add-contact-popup');
const openAddContactPopup = document.querySelector('#open-add-contact-popup-button');
const closeAddContactPopup = document.querySelector('#close-add-contact-popup-button');

console.log(openAddContactPopup);

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
