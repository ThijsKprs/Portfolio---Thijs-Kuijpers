import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';



// Instead of imports, use the global THREE object


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ 
  alpha: true,
  antialias: true // Enable anti-aliasing
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for better quality

// Check if container exists
const container = document.getElementById('three-container');
if (!container) {
  console.error('Container element #three-container not found!');
  // Create container if missing
  const newContainer = document.createElement('div');
  newContainer.id = 'three-container';
  document.body.appendChild(newContainer);
  newContainer.appendChild(renderer.domElement);
} else {
  container.appendChild(renderer.domElement);
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
directionalLight.position.set(10, 10, 20);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

const loader = new GLTFLoader();
const models = [];
let currentModelIndex = 0;

// Add loading indicator
const loadingElement = document.createElement('div');
loadingElement.style.position = 'absolute';
loadingElement.style.top = '50%';
loadingElement.style.left = '50%';
loadingElement.style.transform = 'translate(-50%, -50%)';
loadingElement.style.fontSize = '24px';
loadingElement.textContent = 'Loading model...';
document.body.appendChild(loadingElement);

// Get the base URL for the current page to handle relative paths properly
const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
console.log('Base URL for resources:', baseUrl);

function loadModel(path, rotationY, rotationX, position, scale, redirectUrl) {
    // Convert relative path to absolute path for public hosting
    const absolutePath = new URL(path, baseUrl).href;
    console.log('Attempting to load model from:', absolutePath);
    
    return new Promise((resolve, reject) => {
        loader.load(
            absolutePath, 
            (gltf) => {
                console.log('Model loaded successfully:', gltf);
                const model = gltf.scene;
                model.position.set(position.x, position.y, position.z);
                model.scale.set(scale.x, scale.y, scale.z);
                model.rotation.set(rotationX, rotationY, 0);
                model.visible = true;

                model.traverse((node) => {
                    if (node.isMesh && node.material) {
                        // Make sure materials are visible
                        node.material.flatShading = false;
                        
                        if (node.material.map) {
                            node.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                            node.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                            node.material.map.magFilter = THREE.LinearFilter;
                        }
                        
                        node.material.needsUpdate = true;
                    }
                });

                model.userData = { redirectUrl: redirectUrl };

                models.push({ model, initialRotationY: rotationY, initialRotationX: rotationX });
                scene.add(model); // Add to scene
                resolve(model);
            }, 
            (xhr) => {
                // Add progress tracking
                if (xhr.lengthComputable) {
                    const percentComplete = (xhr.loaded / xhr.total) * 100;
                    console.log(`${Math.round(percentComplete)}% loaded`);
                    loadingElement.textContent = `Loading model... ${Math.round(percentComplete)}%`;
                } else {
                    console.log(`Loaded ${xhr.loaded} bytes`);
                    loadingElement.textContent = `Loading model... ${Math.round(xhr.loaded / 1024)} KB loaded`;
                }
            },
            (error) => {
                console.error('Error loading model:', error);
                loadingElement.textContent = 'Error loading model. Check console for details.';
                reject(error);
            }
        );
    });
}

// Check if model path is accessible
// Try multiple possible paths
const possiblePaths = [
    './models/model1.gltf',
    '/models/model1.gltf',
    '../models/model1.gltf',
    'models/model1.gltf'
];

let modelPathFound = false;

// Try each path and use the first one that works
Promise.all(possiblePaths.map(path => {
    const absolutePath = new URL(path, baseUrl).href;
    return fetch(absolutePath)
        .then(response => {
            if (response.ok) {
                console.log(`Found model at: ${absolutePath}`);
                return path;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        })
        .catch(() => null);
}))
.then(results => {
    // Filter out null results
    const validPaths = results.filter(path => path !== null);
    
    if (validPaths.length > 0) {
        console.log(`Using model path: ${validPaths[0]}`);
        return loadModel(validPaths[0], -Math.PI / 4, Math.PI / 8, { x: 0, y: -0.3, z: 0 }, { x: 6, y: 6, z: 6 }, 'model1_page.html');
    } else {
        // If no valid paths, try the original path anyway
        console.warn('Could not verify model path. Attempting original path as fallback.');
        return loadModel('./models/model1.gltf', -Math.PI / 4, Math.PI / 8, { x: 0, y: -0.3, z: 0 }, { x: 6, y: 6, z: 6 }, 'model1_page.html');
    }
})
.then((loadedModel) => {
    // Remove loading indicator
    document.body.removeChild(loadingElement);
    
    console.log('Model loaded:', loadedModel);
    if (models.length > 0) {
        models[0].model.visible = true;
        console.log('First model is now visible');
    }
    animate();

    updateActiveDot();

    const rightButton = document.getElementById('right-button');
    if (rightButton && currentModelIndex === models.length - 1) {
        rightButton.style.display = 'none';
    }
})
.catch(error => {
    console.error('Error in model loading process:', error);
    loadingElement.textContent = 'Failed to load models. Check console for details.';
});

function setOpacity(model, value) {
    model.traverse((child) => {
        if (child.isMesh) {
            if (!child.material.transparent && value < 1) {
                child.material.transparent = true;
            }
            // Check if gsap is available
            if (typeof gsap !== 'undefined') {
                gsap.to(child.material, { opacity: value, duration: 0.5, ease: "power2.inOut" });
            } else {
                child.material.opacity = value;
            }
        }
    });
}

function hideAllModels() {
    models.forEach(({ model }) => model.visible = false);
}

function updateActiveDot() {
    const dots = document.querySelectorAll('.dot');
    if (dots.length > 0) {
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[currentModelIndex]) {
            dots[currentModelIndex].classList.add('active');
        }
    }
}

function transitionToModel(newIndex, direction) {
    if (newIndex === currentModelIndex) return;

    const currentModel = models[currentModelIndex]?.model;
    const nextModel = models[newIndex]?.model;

    if (!currentModel || !nextModel) return;

    nextModel.position.x = direction === 'left' ? 3 : -3;
    nextModel.visible = true;
    setOpacity(nextModel, 0);

    if (typeof gsap !== 'undefined') {
        gsap.to(currentModel.position, { x: direction === 'left' ? -3 : 3, duration: 0.5, ease: "power2.inOut" });
        gsap.to(nextModel.position, { x: 0, duration: 0.5, ease: "power2.inOut" });
    } else {
        currentModel.position.x = direction === 'left' ? -3 : 3;
        nextModel.position.x = 0;
    }
    
    setOpacity(currentModel, 0);
    setOpacity(nextModel, 1);

    setTimeout(() => {
        currentModel.visible = false;
    }, 500);

    currentModelIndex = newIndex;

    updateActiveDot();
}

function showNextModel() {
    const newIndex = currentModelIndex + 1;
    if (newIndex >= models.length) {
        const rightButton = document.getElementById('right-button');
        if (rightButton) rightButton.style.display = 'none';
    } else {
        const rightButton = document.getElementById('right-button');
        if (rightButton) rightButton.style.display = 'inline-block';
        transitionToModel(newIndex, 'right');
    }
}

function showPreviousModel() {
    const newIndex = (currentModelIndex - 1 + models.length) % models.length;
    const rightButton = document.getElementById('right-button');
    if (rightButton) rightButton.style.display = 'inline-block';
    transitionToModel(newIndex, 'left');
}

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

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const visibleModel = models[currentModelIndex]?.model;
    const intersects = visibleModel ? raycaster.intersectObject(visibleModel, true) : [];

    document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'auto';
}

// Check if buttons exist before adding event listeners
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
if (leftButton) leftButton.addEventListener('click', showPreviousModel);
if (rightButton) rightButton.addEventListener('click', showNextModel);

window.addEventListener('click', onMouseClick);
window.addEventListener('mousemove', onMouseMove);

let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});

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

animate();
