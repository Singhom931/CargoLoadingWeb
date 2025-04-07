let isPlaying = false
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

function addRowtoTable(el) {
    const row = el.closest('tr');
    const values = Array.from(row.querySelectorAll('input')).map(input => input.value);

    const main_row = document.createElement('tr');
    main_row.innerHTML = `
        <td><input type="text" placeholder="Container Name" value="${values[0]}" size="20" required></td>
        <td><input type="text" placeholder="Length (cm)" oninput="calculateRow(this);" value=${values[1]} size="20" required></td>
        <td><input type="text" placeholder="Width (cm)" oninput="calculateRow(this);" value=${values[2]} size="20" required></td>
        <td><input type="text" placeholder="Height (cm)" oninput="calculateRow(this);" value=${values[3]} size="20" required></td>
        <td><input type="text" placeholder="Volume" value=${values[4]} size="20" readonly></td>
        <td><input type="text" placeholder="Weight\nCapacity (kg)" oninput="calculateRow(this);" value=${values[5]} size="20" required></td>
        <td><span class="delete-btn" onclick="deleteRow(this)">‎ ‎ ‎ ❌</span></td>
    `;
    
    // document.getElementById('main-table').innerHTML += newRowHTML;
    document.getElementById('main-table').appendChild(main_row);

    console.log(values);
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

function populateContainerTable(containerItems,clear=true) {
    const tableBody = document.querySelector('#containerTable tbody');
    if(clear){tableBody.innerHTML = '';}  // Clear existing rows
    
    containerItems.forEach((container) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><input type="text" value="${container.name}" size="13" required></td>
            <td><input type="text" value="${container.length}" size="13" required></td>
            <td><input type="text" value="${container.width}" size="13" required></td>
            <td><input type="text" value="${container.height}" size="13"required></td>
            <td><input type="text" value="${(container.length * container.width * container.height).toFixed(2)}" size="13" readonly></td>
            <td><input type="text" value="${container.max_weight}" size="13" required></td>
            <td><span class="delete-btn" onclick="deleteRow(this)">‎ ‎ ‎ ❌</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}




//OLD CODE ABOVE
//3D CODE BELOW




// Reset form after adding container
function clearcontainerForm() {
    document.getElementById("container-name").value = "";
    document.getElementById("container-length").value = 1;
    document.getElementById("container-width").value = 1;
    document.getElementById("container-height").value = 1;
    document.getElementById("container-weight-capacity").value = 1;

}
clearcontainerForm()

// Create the truck model
function createTruck() {
    const truckGroup = new THREE.Group();

    // Truck body (rectangular box)
    const bodyGeometry = new THREE.BoxGeometry(8, 0.25, 2);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4e5d6c, roughness: 0.5, metalness: 0.3,}); // gray
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.7, 0); // Position it in the center
    truckGroup.add(body);

    // Wheels (cylinders)
    const wheelGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.7, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 ,roughness: 0.5, metalness: 0.3}); // black

    const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel1.position.set(-2.5, 0, 1); // Position for front-left wheel
    wheel1.rotation.x = Math.PI / 2; // Rotate to make it a proper wheel

    const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel2.position.set(2.5, 0, 1); // Position for front-right wheel
    wheel2.rotation.x = Math.PI / 2;

    const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel3.position.set(-2.5, 0, -1); // Position for back-left wheel
    wheel3.rotation.x = Math.PI / 2;

    const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel4.position.set(2.5, 0, -1); // Position for back-right wheel
    wheel4.rotation.x = Math.PI / 2;

    truckGroup.add(wheel1, wheel2, wheel3, wheel4);

    const guardGeometry = new THREE.CylinderGeometry(0.65, 0.9, 1, 32, 1, true, 0, Math.PI); // Semi-circle slice
    const guardMaterial = new THREE.MeshStandardMaterial({ color: 0x4e5d6c, roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide }); // Black material
    const wheelGuard1 = new THREE.Mesh(guardGeometry, guardMaterial);
    const wheelGuard2 = new THREE.Mesh(guardGeometry, guardMaterial);
    const wheelGuard3 = new THREE.Mesh(guardGeometry, guardMaterial);
    const wheelGuard4 = new THREE.Mesh(guardGeometry, guardMaterial);

    // Positioning the wheel guard
    wheelGuard1.rotation.y = wheelGuard1.rotation.z = Math.PI / 2;
    wheelGuard1.position.set(-2.5, 0.15, 1);

    wheelGuard2.rotation.y = wheelGuard2.rotation.z = Math.PI / 2;
    wheelGuard2.rotation.y = -Math.PI/2;
    wheelGuard2.position.set(-2.5, 0.15, -1);

    wheelGuard3.rotation.y = wheelGuard3.rotation.z = Math.PI / 2;
    wheelGuard3.position.set(2.5, 0.15, 1);

    wheelGuard4.rotation.y = wheelGuard4.rotation.z = Math.PI / 2;
    wheelGuard4.rotation.y = -Math.PI/2;
    wheelGuard4.position.set(2.5, 0.15, -1);

    truckGroup.add(wheelGuard1,wheelGuard2,wheelGuard3,wheelGuard4)

    // Truck cabin (box for the cabin)
    const cabinGeometry = new THREE.BoxGeometry(1, 1.5, 2);
    const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x4e5d6c , roughness: 0.5, metalness: 0.3}); // dark gray
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(3, 1.25, 0); // Positioned above the body
    truckGroup.add(cabin);

    // Truck Container (box for the Container)
    const containerGeometry = new THREE.BoxGeometry(6.75, 2.3, 2);
    const containerMaterial = new THREE.MeshStandardMaterial({ color: 0xcc5d6c, roughness: 1, metalness: 1, envMapIntensity: 1,  }); // dark gray
    const container = new THREE.Mesh(containerGeometry, containerMaterial);
    container.position.set(-1, 2, 0); // Positioned above the body
    container.name = "truckContainer";
    truckGroup.add(container);

    function createRamp(width, height, length, angle) {
        // Create a geometry with 4 vertices for a ramp
        const geometry = new THREE.BufferGeometry();
        
        // Calculate the top and bottom face length based on the angle
        const bottomLength = length;
        const topLength = length - height * Math.tan(angle);  // Adjust length based on the height and angle
        
        // Define the four corners of the ramp
        const vertices = new Float32Array([
            // Bottom face (larger base)
            -bottomLength / 2, 0, -length / 2,  // Bottom left
            bottomLength / 2, 0, -length / 2,   // Bottom right
            bottomLength / 2, 0, length / 2,    // Top right
            -bottomLength / 2, 0, length / 2,   // Top left
    
            // Top face (smaller base)
            -topLength / 2, height, -length / 2, // Top left
            topLength / 2, height, -length / 2,  // Top right
            topLength / 2, height, length / 2,   // Bottom right
            -topLength / 2, height, length / 2   // Bottom left

        ]);
        
        // Set the vertices in the geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        
        // Define the faces of the ramp using the vertices (2 triangles per side)
        const indices = [
            0, 1, 4,  4, 1, 5,  // bottom-left side
            1, 2, 5,  5, 2, 6,  // bottom-right side
            2, 3, 6,  6, 3, 7,  // top-right side
            3, 0, 7,  7, 0, 4,  // top-left side
    
            0, 1, 2,  2, 3, 0,  // bottom face
            4, 5, 6,  6, 7, 4,  // top face

        ];
    
        geometry.setIndex(indices);
    
        // Create the material for the ramp
        const material = new THREE.MeshStandardMaterial({ color: 0x4e5d6c, roughness: 0.5, metalness: 0.3 });
    
        // Create the mesh and return it
        const ramp = new THREE.Mesh(geometry, material);

            // Create window geometry for each side (adjusted to half height of the ramp)
        const windowGeometry = new THREE.PlaneGeometry(topLength, height / 2);  // Window height is half of the ramp height
        const windowMaterial = new THREE.MeshPhysicalMaterial({ color: 0x87CEEB, side: THREE.DoubleSide });  // Light blue windows
        
        const windowrightGeometry = new THREE.PlaneGeometry(topLength+topLength/3, height / 2);

        // Front side window
        const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
        windowFront.position.set(0, height / 2, (-length / 2)-0.01);  // Front side, at half the height of the ramp

        // Back side window
        const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
        windowBack.position.set(0, height / 2, (length / 2)+0.01);  // Back side
        windowBack.rotation.y = Math.PI;  // Rotate for back face

        // Left side window
        //const windowLeft = new THREE.Mesh(windowGeometry, windowMaterial);
        //windowLeft.position.set(-bottomLength / 2, height / 2, 0);  // Left side
        //windowLeft.rotation.y = Math.PI / 2;

        // Right side window
        const windowRight = new THREE.Mesh(windowrightGeometry, windowMaterial);
        windowRight.position.set((bottomLength / 2)-0.15, height / 2, 0);  // Right side
        //windowRight.rotation.y = -Math.PI / 2;
        windowRight.rotation.set(Math.PI / 2, -Math.PI / 2.5, Math.PI /2)

        // Add windows to the ramp group
        ramp.add(windowFront, windowBack, windowRight);
        return ramp;
    }
    

    // Cabin front
    const cfront = createRamp(1, 1.25, 2, Math.PI / 6);
    cfront.position.set(3, 0.9, 0); // Positioned above the body
    truckGroup.add(cfront);

    return truckGroup;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create the sun-like directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // white light, intensity 1
directionalLight.position.set(100, 100, 100);  // position it in the sky, pointing down
directionalLight.castShadow = true;
scene.add(directionalLight);
directionalLight.target.position.set(-100, -100, -100); // for example, point to the center of the scene
scene.add(directionalLight.target);

const groundGeometry = new THREE.PlaneGeometry(1000, 1000);  // Large enough plane
//const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x00FF00 });  // Green color
const groundMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color1: { value: new THREE.Color(0x00FF00) }, // Bottom gradient color (green)
        color2: { value: new THREE.Color(0x00aa00) }, // Top gradient color (darker green)
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        void main() {
            gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
        }
    `,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = - Math.PI / 2;  // Rotate the plane to make it horizontal
ground.position.y = -1;  // Position it slightly below the scene

scene.add(ground);

const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

// Create a vertical gradient
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, '#00aaff'); // Sky blue
gradient.addColorStop(1, '#004488'); // Dark blue

// Fill the canvas with the gradient
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Create a texture from the canvas
const texture = new THREE.CanvasTexture(canvas);
const white = new THREE.Color(0xeeeeee);
scene.background = texture;

// Enable shadow map in renderer (if not already enabled)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Smooth shadows


let containerItem;

const truck = createTruck();
scene.add(truck);
truck.scale.set(3,3,3)
truck.position.y = 1
truck.position.x = 50
truck.castShadow = true
truck.receiveShadow = true
let truck_speed = -0.75

const smokeMaterial = new THREE.PointsMaterial({
    color: 0x888888,
    size: 1,
    transparent: true,
    opacity: 0.5
});
const smokeGeometry = new THREE.BufferGeometry();
const smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);

let containerItems = [];
let isTruckMoving = false;

camera.position.z = 10;
camera.position.y = 4;
// Save initial position and rotation
const defaultCameraState = {
    position: camera.position.clone(),
    rotation: camera.rotation.clone(),
    fov: camera.fov,
    aspect: camera.aspect,
    near: camera.near,
    far: camera.far
};
function resetCamera() {
    camera.position.copy(defaultCameraState.position);
    camera.rotation.copy(defaultCameraState.rotation);
    camera.fov = defaultCameraState.fov;
    camera.aspect = defaultCameraState.aspect;
    camera.near = defaultCameraState.near;
    camera.far = defaultCameraState.far;
    camera.updateProjectionMatrix(); // Important!
}
// Function to create and update container model
function updatecontainer() {
    const name = document.getElementById("container-name").value;
    const length = parseFloat(document.getElementById("container-length").value);
    const width = parseFloat(document.getElementById("container-width").value);
    const height = parseFloat(document.getElementById("container-height").value);
    const weight_capacity = parseFloat(document.getElementById("container-weight-capacity").value);
    const color = "#cc5f6e"

    if (name && length > 0 && width > 0 && height > 0) {
        // If container already exists, remove it
        if (containerItem) {
            scene.remove(containerItem);
        }

        // Create a new container with updated data
        const containerMaterial = new THREE.MeshStandardMaterial({ color: color });
        
        const containerGeometry = new THREE.BoxGeometry(length/10, height/10, width/10);
        containerItem = new THREE.Mesh(containerGeometry, containerMaterial);

        // Set initial position for the container (e.g., in front of the truck)
        containerItem.position.set(0, 2, 0);
        scene.add(containerItem);
        //containerItems.push(containerItem)
        camera.position.set(0, 2, 0.1+ Math.max(length,width,height)/8);
    }
}

// Event listeners for form changes to update container
document.getElementById("container-name").addEventListener("input", updatecontainer);
document.getElementById("container-length").addEventListener("input", updatecontainer);
document.getElementById("container-width").addEventListener("input", updatecontainer);
document.getElementById("container-height").addEventListener("input", updatecontainer);
document.getElementById("container-weight-capacity").addEventListener("input", updatecontainer);

// Animate the container's rotation
function animatecontainer() {
    if (containerItem) {
        //containerItem.rotation.x += 0.01;
        containerItem.rotation.y -= 0.01;
        //containerItem.rotation.z += 0.01;
    }
}

function animate_truck(){
    if(!isPlaying){
        truck.rotation.y -= 0.01;
    }
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    animatecontainer();
    animate_truck();
    renderer.render(scene, camera);

    // If truck is moving
    if (isTruckMoving) {
        truck.position.x += truck_speed; // Move the truck
        if (truck.position.x < 10 || truck.position.x >100) {
            // After truck leaves, reset the scene for new container
            isTruckMoving = false;
            //document.getElementById("container-form").reset();
            //clearcontainerForm();
        }
    }
    if (!isTruckMoving && truck_speed === -0.75 && truck.position.x < 10){
        truck_container = truck.getObjectByName("truckContainer");
        truck_container.visible = true
        console.log(containerItems)
        containerItems.forEach((container, index) => {
            //container.position.x = truck.position.x;
            //container.position.y = truck.position.y + 1;
            //container.position.z = truck.position.z;
            scene.remove(container)
        });
        containerItems = [];
        truck_speed = 0.75
        isTruckMoving = true
        clearcontainerForm();

    }

    // Render smoke
    if (isTruckMoving) {
        let particleCount = 10;
        let positions = new Float32Array(particleCount * 3);
        for (let i = 1; i < particleCount; i++) {
            positions[i * 3] = truck.position.x - 15 + Math.random() * 3;
            positions[i * 3 + 1] = 1 + Math.random() * 2 ;
            positions[i * 3 + 2] = Math.random() * 3;
        }
        smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        scene.add(smokeParticles);
        
    }
    else{scene.remove(smokeParticles)}

    renderer.render(scene, camera);
}

animate();

document.getElementById("add-container").addEventListener("click", function() {
    const name = document.getElementById("container-name").value;
    const length = parseFloat(document.getElementById("container-length").value);
    const width = parseFloat(document.getElementById("container-width").value);
    const height = parseFloat(document.getElementById("container-height").value);
    const weight_capacity = parseFloat(document.getElementById("container-weight-capacity").value);
    const color = "#cc5f6e"

    container = {name:name,length:length,width:width,height:height,weight_capacity:weight_capacity,volume:length*width*height,max_weight:weight_capacity};

    populateContainerTable([container],false);

    if (name && length > 0 && width > 0 && height > 0 && weight_capacity > 0) {
        const containerMaterial = new THREE.MeshStandardMaterial({ color: color });
        const containerGeometry = new THREE.BoxGeometry(length, height, width);
        const container = new THREE.Mesh(containerGeometry, containerMaterial);

        // Center container in the scene
        //container.position.set(0, 2, 0);
        camera.position.set(0, 2, 50)
        scene.remove(containerItem)

        // Move truck into view and animate
        truck.position.set(50, 1, 0);  // Start position off-screen
        truck_container = truck.getObjectByName("truckContainer");
        truck_container.visible = false
        
        truck_speed = -0.75
        isTruckMoving = true;
        
    }
});

// Render items based on form data
function renderItemFromForm() {
    const name = document.getElementById("container-name").value;
    const length = parseFloat(document.getElementById("container-length").value);
    const width = parseFloat(document.getElementById("container-width").value);
    const height = parseFloat(document.getElementById("container-height").value);
    const weight_capacity = parseInt(document.getElementById("container-weight-capacity").value);
    const color = "#cc5f6e";

    if (name && length > 0 && width > 0 && height > 0 && weight_capacity > 0) {
        //const containerMaterial = new THREE.MeshStandardMaterial({ color: color });
        //const containerGeometry = new THREE.BoxGeometry(length, height, width);
        //const container = new THREE.Mesh(containerGeometry, containerMaterial);


        container = containerItems[0]
        containerItems = []

        // Center container in the scene
        container.position.set(0, 2, 0);

        // Add multiple container if quantity > 1
        for (let i = 0; i < quantity; i++) {
            const containerClone = container.clone();
            containerClone.position.x += (i + 1) * 2;  // Space between container items
            scene.add(containerClone);
            containerItems.push(containerClone);
        }
        scene.remove(container)
    }
}

// Initially render any items based on form input (if available)
renderItemFromForm();

// Handle screen resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add a scroll event listener
window.addEventListener('wheel', (event) => {
    if(isPlaying){
    // Adjust camera position based on scroll
    const scrollSpeed = 0.01; // Adjust this value for sensitivity
    camera.position.z += event.deltaY * scrollSpeed;

    // Limit the camera position to a range (optional)
    camera.position.y = Math.max(2, Math.min(camera.position.z, 4));
    camera.position.z = Math.max(1, Math.min(camera.position.z, 50));

    // Render the scene after updating the camera
    renderer.render(scene, camera);
    }
});

document.getElementById("containertitle").style.display = "none";
document.getElementById("container-form").style.display = "none";
document.getElementById("containertitle").style.display = "block";

document.getElementById("playBtn").addEventListener("click", function() {
    if (!isPlaying) {
        isPlaying = true;
        speed = 100;
        document.getElementById("playBtn").textContent = "Stop";
        document.getElementById("containerTable").style.display = "none";
        document.getElementById("defaultcontainersTable").style.display = "none";
        document.getElementById("addBtn").style.display = "none";
        document.getElementById("nextBtn").style.display = "none";
        document.getElementById("backBtn").style.display = "none";
        document.getElementById("containertitle").style.display = "none";
        document.getElementById("container-form").style.display = "block";
        truck.position.set(50, 1, 0);
        truck.rotation.set(0,-0.01,0)
        scene.background = texture;
        ground.visible = true
        updatecontainer()

    } else {
        isPlaying = false;
        speed = 10;
        document.getElementById("playBtn").textContent = "Play";
        document.getElementById("containerTable").style.display = "block";
        document.getElementById("defaultcontainersTable").style.display = "block";
        document.getElementById("addBtn").style.display = "block";
        document.getElementById("nextBtn").style.display = "block";
        document.getElementById("backBtn").style.display = "block";
        document.getElementById("containertitle").style.display = "block";
        document.getElementById("container-form").style.display = "none";
        truck.position.set(0, -3, -12.5);
        // camera.position.set(0,4,10)
        scene.background = white;
        ground.visible = false
        document.getElementById("containerTable").style.display = "table";
        document.getElementById("defaultcontainersTable").style.display = "table";
        scene.remove(containerItem);
        resetCamera();
    }
});
truck.position.set(0, -3, -12.5);
ground.visible = false
scene.background = white;
fetchContainerData();

function handleSplitClick(event, button) {
    // const button = event.g;
    const clickX = event.offsetX;
    const width = button.offsetWidth;

    // // Flash overlay
    const flash = document.createElement("div");
    flash.className = "click-flash";
    flash.style.left = (clickX < width / 2) ? "0" : "50%";
    button.appendChild(flash);
    setTimeout(() => button.removeChild(flash), 200);

    // console.log(clickX)
    // console.log(width)
    if (clickX < width / 2) {
        show_hide_default_table();
    } else {
        addRow();
    }
}

var default_table_state = "show"
function show_hide_default_table(){
    if (default_table_state==="show"){document.getElementById("defaultcontainersTable").style.display = "none";default_table_state = "hide"}
    else if (default_table_state==="hide"){document.getElementById("defaultcontainersTable").style.display = "block";default_table_state = "show";document.getElementById("defaultcontainersTable").style.display = "table";}
}
