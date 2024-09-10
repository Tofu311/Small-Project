let actionButtonHTML = 
`<div class="action-button-container">
    <button class="action-button">
        <i class="fa-solid fa-user-pen"></i>
    </button>
    <button class="action-button" id="delete-contact-button">
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
                console.log(xhr.responseText);
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
                    <td id="contact-name">${contact["Name"]}</td>
                    <td id="contact-phone">${contact["Phone"]}</td>
                    <td id="contact-email">${contact["Email"]}</td>
                    <td>${actionButtonHTML}</td>
                </tr>`);
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

function doDeleteContact() {
    const DELTECONTACT_ENDPOINT = API_URL + "/DeleteContact.php"
    if (userId == null) {
        console.log("Error in adding contact: cant find userId");
        return;
    }
    // Gather contact information to delete
    let contactName = document.getElementById("contact-name").textContent;
    let contactPhone = document.getElementById("contact-phone").textContent;
    let contactEmail = document.getElementById("contact-email").textContent;

    // Gather all of the rows in the table
    let table = document.getElementById("contacts-table-body");
    let rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
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
        xhr.onreadystatechange = () => {
            if(this.readyState == 4 && this.status == 200) {
                let response = JSON.parse(xhr.responseText);
                if(response["error"] === "") {
                    // Loop through table to find contact to delete
                    for(let i = 0; i < rows.length; i++) {
                        const nameCell = rows[i].getElementById("contact-name");
                        const phoneCell = rows[i].getElementById("contact-phone");
                        const emailCell = rows[i].getElementById("contact-email");

                        if((nameCell && nameCell.textContent === contactName) && (phoneCell && phoneCell.textContent === contactPhone) && (emailCell && emailCell.textContent === contactEmail)) {
                            table.deleteRow(i + 1); // Adjusted for the header row
                            break;
                        }
                    }
                }
            }
        }
    }
    catch (err) {

    }
}

// Add doDeleteContact() to the button
document.addEventListener("DOMContentLoaded", () => {
    let deleteButton = document.getElementById("delete-contact-button");
    if(deleteButton) {
        deleteButton.addEventListener("click", () => {
            doDeleteContact();
        });
    }
});

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
