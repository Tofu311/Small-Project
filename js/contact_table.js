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