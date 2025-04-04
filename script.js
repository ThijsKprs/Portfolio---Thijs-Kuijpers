// Import GSAP (Ensure it's in your HTML if not already included)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

// Create scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

// Improved renderer with anti-aliasing
const renderer = new THREE.WebGLRenderer({ 
  alpha: true,
  antialias: true // Enable anti-aliasing
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for better quality
document.getElementById('three-container').appendChild(renderer.domElement);

// Enhanced lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

const loader = new THREE.GLTFLoader();
const models = [];
let currentModelIndex = 0;

// Function to load a model with improved material handling
function loadModel(path, rotationY, rotationX, position, scale, redirectUrl) {
    return new Promise((resolve, reject) => {
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.position.set(position.x, position.y, position.z);
            model.scale.set(scale.x, scale.y, scale.z);
            model.rotation.set(rotationX, rotationY, 0);
            model.visible = false; // Start hidden

            // Enhance model materials for better quality
            model.traverse((node) => {
                if (node.isMesh && node.material) {
                    // Improve material settings
                    node.material.flatShading = false;
                    
                    // Improve texture quality if textures exist
                    if (node.material.map) {
                        node.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        node.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                        node.material.map.magFilter = THREE.LinearFilter;
                    }
                    
                    // Ensure material updates
                    node.material.needsUpdate = true;
                }
            });

            model.userData = { redirectUrl: redirectUrl };

            models.push({ model, initialRotationY: rotationY, initialRotationX: rotationX });
            scene.add(model); // Add to scene
            resolve(model);
        }, undefined, reject);
    });
}

// Load models and ensure at least one is visible
Promise.all([
    loadModel('./models/model1.gltf', -Math.PI / 4, Math.PI / 8, { x: 0, y: -0.3, z: 0 }, { x: 6, y: 6, z: 6 }, 'model1_page.html'),
]).then(() => {
    if (models.length > 0) {
        models[0].model.visible = true;
    }
    animate();

    // Update the dot state on initial load
    updateActiveDot();

    // Hide the right button if we are on the last model
    if (currentModelIndex === models.length - 1) {
        document.getElementById('right-button').style.display = 'none';
    }
}).catch(console.error);

// Function to set opacity with a transition
function setOpacity(model, value) {
    model.traverse((child) => {
        if (child.isMesh) {
            // Ensure we don't cause material issues when changing opacity
            if (!child.material.transparent && value < 1) {
                child.material.transparent = true;
            }
            gsap.to(child.material, { opacity: value, duration: 0.5, ease: "power2.inOut" });
        }
    });
}

// Hide all models
function hideAllModels() {
    models.forEach(({ model }) => model.visible = false);
}

function updateActiveDot() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentModelIndex].classList.add('active');
}

// Transition between models with sliding and opacity effect
function transitionToModel(newIndex, direction) {
    if (newIndex === currentModelIndex) return;

    const currentModel = models[currentModelIndex]?.model;
    const nextModel = models[newIndex]?.model;

    if (!currentModel || !nextModel) return;

    // Move new model off-screen and make it transparent
    nextModel.position.x = direction === 'left' ? 3 : -3;
    nextModel.visible = true;
    setOpacity(nextModel, 0);

    // Animate current model sliding out and fading out
    gsap.to(currentModel.position, { x: direction === 'left' ? -3 : 3, duration: 0.5, ease: "power2.inOut" });
    setOpacity(currentModel, 0);

    // Animate new model sliding in and fading in
    gsap.to(nextModel.position, { x: 0, duration: 0.5, ease: "power2.inOut" });
    setOpacity(nextModel, 1);

    setTimeout(() => {
        currentModel.visible = false;
    }, 500);

    currentModelIndex = newIndex;

    // Update active dot
    updateActiveDot();
}

function showNextModel() {
    const newIndex = currentModelIndex + 1;
    if (newIndex >= models.length) {
        // Hide the right (next) button when at the last model
        document.getElementById('right-button').style.display = 'none';
    } else {
        // Show the right (next) button if not at the last model
        document.getElementById('right-button').style.display = 'inline-block';
        transitionToModel(newIndex, 'right');
    }
}

// Show previous model
function showPreviousModel() {
    const newIndex = (currentModelIndex - 1 + models.length) % models.length;
    // Always show the left button since it will be useful when moving back
    document.getElementById('right-button').style.display = 'inline-block';
    transitionToModel(newIndex, 'left');
}

// Raycasting for model clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const visibleModel = models[currentModelIndex]?.model;

    if (!visibleModel || !visibleModel.visible) return;

    const intersects = raycaster.intersectObject(visibleModel, true);
    if (intersects.length > 0) {
        switch (currentModelIndex) {
            case 0:
                window.location.href = 'Bureaublad.html';
                break;
        }
    }
}

// Cursor change when hovering over a model
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const visibleModel = models[currentModelIndex]?.model;
    const intersects = visibleModel ? raycaster.intersectObject(visibleModel, true) : [];

    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'auto';
}

// Event listeners
document.getElementById('left-button').addEventListener('click', showPreviousModel);
document.getElementById('right-button').addEventListener('click', showNextModel);
window.addEventListener('click', onMouseClick);
window.addEventListener('mousemove', onMouseMove);

// Mouse movement event to adjust rotation
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Handle window resizing properly
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const currentModel = models[currentModelIndex]?.model;
    if (currentModel) {
        const { initialRotationY, initialRotationX } = models[currentModelIndex];
        currentModel.rotation.y = initialRotationY + (mouseX * Math.PI * 0.2);
        currentModel.rotation.x = initialRotationX + (-mouseY * Math.PI * 0.2);
    }

    renderer.render(scene, camera);
}
