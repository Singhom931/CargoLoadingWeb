// Get table body reference
const tableBody = document.querySelector('#cargoTable tbody');

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to add a new row
function addRow() {
    // Create a new row element
    const row = document.createElement('tr');

    // Create cells for each input field with additional fields
    row.innerHTML = `
        <td><input type="text" placeholder="Name" size="12" required></td>
        <td><input type="text" placeholder="Length (cm)" oninput="calculateRow(this);number_only(this)" size="12" required></td>
        <td><input type="text" placeholder="Width (cm)" oninput="calculateRow(this);number_only(this)" size="12" required></td>
        <td><input type="text" placeholder="Height (cm)" oninput="calculateRow(this);number_only(this)" size="12" required></td>
        <td><input type="text" placeholder="Weight (kg)" oninput="calculateRow(this);number_only(this)" size="12" required></td>
        <td><input type="text" placeholder="Quantity" oninput="calculateRow(this);number_only(this)" size="12" required></td>
        <td><input type="text" placeholder="Total Weight" size="12" readonly></td>
        <td><input type="text" placeholder="Volume" size="12" readonly></td>
        <td><input type="color" value="${getRandomColor()}" size="12"></td>
        <td><label>Rotate <input type="checkbox" checked></label><br></td>
        <td>load bearing capacity<input type="text" number_only(this)" size="14" required></td>
        <td><span class="delete-btn" onclick="deleteRow(this)">‎ ‎ ‎ ❌</span></td>
    `;

    // Append the new row to the table body
    tableBody.appendChild(row);
}

// Function to delete a specific row
function deleteRow(deleteBtn) {
    // Find the row containing the delete button and remove it
    const row = deleteBtn.parentNode.parentNode;
    tableBody.removeChild(row);
}

// Function to calculate Total Weight and Volume
function calculateRow(input) {
    const row = input.parentElement.parentElement;
    const length = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const width = parseFloat(row.cells[2].querySelector('input').value) || 0;
    const height = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const weight = parseFloat(row.cells[4].querySelector('input').value) || 0;
    const quantity = parseFloat(row.cells[5].querySelector('input').value) || 0;

    // Calculate Total Weight and Volume
    const totalWeight = weight * quantity;
    const volume = length * width * height;

    // Update the cells for Total Weight and Volume
    row.cells[6].querySelector('input').value = totalWeight.toFixed(2);
    row.cells[7].querySelector('input').value = volume.toFixed(2);
}

function number_only(){
    this.value = this.value.replace(/[^0-9.]/g, '')
}

function submitCargo() {
    const cargoData = Array.from(document.querySelectorAll('#cargoTable tbody tr')).map(row => {
        const rotation = row.cells[9].querySelectorAll('input[type="checkbox"]');
        const stacking = row.cells[10].querySelectorAll('input[type="checkbox"]');
        return {
            name: row.cells[0].querySelector('input').value,
            length: parseFloat(row.cells[1].querySelector('input').value) || 0,
            width: parseFloat(row.cells[2].querySelector('input').value) || 0,
            height: parseFloat(row.cells[3].querySelector('input').value) || 0,
            weight: parseFloat(row.cells[4].querySelector('input').value) || 0,
            quantity: parseInt(row.cells[5].querySelector('input').value) || 0,
            color: row.cells[8].querySelector('input[type="color"]').value || "#000000",
            rotate: rotation[0].checked,
            loadbearing: parseFloat(row.cells[10].querySelector('input').value) || 0,
        }; 
    });

    fetch('/submit_cargo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({cargo: cargoData})
    }).then(response => response.json())
      .then(data => alert(data.message))
      .catch(error => console.error('Error:', error));
}


async function fetchCargoData() {
    try {
        const response = await fetch(`/fetch_cargo`);
        const data = await response.json();

        if (data.cargo && data.cargo.length > 0) {
            populateCargoTable(data.cargo);
        }
    } catch (error) {
        console.error('Error fetching cargo data:', error);
    }
}

function populateCargoTable(cargoItems) {
    const tableBody = document.querySelector('#cargoTable tbody');
    tableBody.innerHTML = '';  // Clear existing rows
    
    cargoItems.forEach((cargo) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><input type="text" value="${cargo.name}" size="12" required></td>
            <td><input type="text" value="${cargo.length}" oninput="calculateRow(this);number_only(this)" size="12" required></td>
            <td><input type="text" value="${cargo.width}" oninput="calculateRow(this);number_only(this)" size="12" required></td>
            <td><input type="text" value="${cargo.height}" oninput="calculateRow(this);number_only(this)" size="12" required></td>
            <td><input type="text" value="${cargo.weight}" oninput="calculateRow(this);number_only(this)" size="12" required></td>
            <td><input type="text" value="${cargo.quantity}" oninput="calculateRow(this);number_only(this)" size="12" required></td>
            <td><input type="text" value="${cargo.total_weight}" size="12" readonly></td>
            <td><input type="text" value="${cargo.volume}" size="12" readonly></td>
            <td><input type="color" value="${cargo.color}" size="12"></td>
            <td><label>Rotate <input type="checkbox" ${cargo.rotate ? 'checked' : ''}></label><br></td>
            <td>load bearing capacity<input type="text" value="${cargo.loadbearing}" number_only(this)" size="14" required></td>
            <td><span class="delete-btn" onclick="deleteRow(this)">‎ ‎ ‎ ❌</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

