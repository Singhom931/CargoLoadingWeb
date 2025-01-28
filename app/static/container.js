// Get table body reference
const tableBody = document.querySelector('#containerTable tbody');

// Function to generate a random color (optional for container)
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

    // Create cells for each input field (Container Name, Dimensions, Weight Capacity)
    row.innerHTML = `
        <td><input type="text" placeholder="Container Name" size="20" required></td>
        <td><input type="text" placeholder="Length (cm)" oninput="calculateRow(this);" size="20" required></td>
        <td><input type="text" placeholder="Width (cm)" oninput="calculateRow(this);" size="20" required></td>
        <td><input type="text" placeholder="Height (cm)" oninput="calculateRow(this);" size="20" required></td>
        <td><input type="text" placeholder="Volume" size="20" readonly></td>
        <td><input type="text" placeholder="Weight\nCapacity (kg)" oninput="calculateRow(this);" size="20" required></td>
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

// Function to calculate Volume (Length x Width x Height) for each container
function calculateRow(input) {
    const row = input.parentElement.parentElement;
    const length = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const width = parseFloat(row.cells[2].querySelector('input').value) || 0;
    const height = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const weight = parseFloat(row.cells[4].querySelector('input').value) || 0;

    // Calculate Volume
    const volume = length * width * height;

    // Update the cell for Volume (not required, but helpful to show)
    row.cells[4].querySelector('input').value = volume.toFixed(2);
}

// Ensure only numbers and dots can be entered in fields (use similar logic as the previous page)
function number_only(input) {
    input.value = input.value.replace(/[^0-9.]/g, '')
}

function submitContainer() {
    const containerData = Array.from(document.querySelectorAll('#containerTable tbody tr')).map(row => {
        return {
            name: row.cells[0].querySelector('input').value,
            length: parseFloat(row.cells[1].querySelector('input').value) || 0,
            width: parseFloat(row.cells[2].querySelector('input').value) || 0,
            height: parseFloat(row.cells[3].querySelector('input').value) || 0,
            max_weight: parseFloat(row.cells[5].querySelector('input').value) || 0
        };
    });

    fetch('/submit_container', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({container: containerData})
    }).then(response => response.json())
      .then(data => alert(data.message))
      .catch(error => console.error('Error:', error));
}


async function fetchContainerData() {
    try {
        const response = await fetch(`/fetch_container`);
        const data = await response.json();

        if (data.containers && data.containers.length > 0) {
            populateContainerTable(data.containers);
        }
    } catch (error) {
        console.error('Error fetching container data:', error);
    }
}

function populateContainerTable(containerItems) {
    const tableBody = document.querySelector('#containerTable tbody');
    tableBody.innerHTML = '';  // Clear existing rows
    
    containerItems.forEach((container) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><input type="text" value="${container.name}" size="13" required></td>
            <td><input type="text" value="${container.length}" size="13" required></td>
            <td><input type="text" value="${container.width}" size="13" required></td>
            <td><input type="text" value="${container.height}" size="13"required></td>
            <td><input type="text" value="${(container.length * container.width * container.height).toFixed(2)}" size="13" readonly></td>
            <td><input type="text" value="${container.max_weight}" size="13" required></td>
            <td><span class="delete-btn" onclick="deleteRow(this)">‎ ‎ ‎ ‎ ‎ ‎ ❌</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}
