// --- 1. SETUP THREE.JS SCENE ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.002); // Distance fog for depth

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// --- 2. LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ffcc, 1, 100);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);

// --- 3. OBJECTS (THE HINTS) ---

// GLOBAL: Starfield
const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const posArray = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 200; // Spread stars
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starMaterial = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
});
const starMesh = new THREE.Points(starGeometry, starMaterial);
scene.add(starMesh);

// SECTION 1 OBJECT: The Core (Introduction)
// A complex wireframe geometry
const coreGeo = new THREE.IcosahedronGeometry(2, 1);
const coreMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const coreMesh = new THREE.Mesh(coreGeo, coreMat);
coreMesh.position.set(5, 0, -10); // Position relative to camera stop 1
scene.add(coreMesh);

// Inner core
const innerCoreGeo = new THREE.IcosahedronGeometry(1, 0);
const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
coreMesh.add(innerCoreMesh); // Child of outer core

// SECTION 2 OBJECT: The Timeline (Experience)
// A series of rings
const ringsGroup = new THREE.Group();
ringsGroup.position.set(40, -5, -40); // Location of Section 2

for (let i = 0; i < 5; i++) {
    const ringGeo = new THREE.TorusGeometry(3 + (i * 1.5), 0.05, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x4444ff, transparent: true, opacity: 0.4 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    ringsGroup.add(ring);
}
scene.add(ringsGroup);

// SECTION 3 OBJECT: The Gallery (Projects)
// Floating geometric shapes
const projectsGroup = new THREE.Group();
projectsGroup.position.set(5, 10, -80); // Location of Section 3

const geometries = [
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.ConeGeometry(1, 2, 4),
    new THREE.OctahedronGeometry(1)
];

for (let i = 0; i < 10; i++) {
    const mat = new THREE.MeshPhongMaterial({
        color: Math.random() > 0.5 ? 0x00ffcc : 0xff00ff,
        flatShading: true,
        shininess: 100
    });
    const mesh = new THREE.Mesh(geometries[Math.floor(Math.random() * geometries.length)], mat);

    mesh.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
    );

    projectsGroup.add(mesh);
}
scene.add(projectsGroup);

// SECTION 4 OBJECT: The Beacon (Contact)
const contactGroup = new THREE.Group();
contactGroup.position.set(-30, 0, -50);

const sphereGeo = new THREE.SphereGeometry(2, 32, 32);
const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x00ffcc,
    emissive: 0x004433,
    shininess: 50,
    wireframe: true
});
const beaconSphere = new THREE.Mesh(sphereGeo, sphereMat);
contactGroup.add(beaconSphere);

// Particles around beacon
const partGeo = new THREE.BufferGeometry();
const partCount = 200;
const pArr = new Float32Array(partCount * 3);
for (let i = 0; i < partCount * 3; i++) {
    pArr[i] = (Math.random() - 0.5) * 10;
}
partGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
const partMat = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
const beaconParts = new THREE.Points(partGeo, partMat);
contactGroup.add(beaconParts);

scene.add(contactGroup);

// --- 4. NAVIGATION STATE & LOGIC ---

// Define Camera "Stops" (x, y, z) and LookAt targets for each section
const stops = [
    { pos: { x: 0, y: 0, z: 5 }, lookAt: { x: 5, y: 0, z: -10 } },   // Intro (Looking at Core)
    { pos: { x: 30, y: 0, z: -30 }, lookAt: { x: 40, y: -5, z: -40 } }, // Experience (Looking at Rings)
    { pos: { x: 5, y: 10, z: -60 }, lookAt: { x: 5, y: 10, z: -80 } },  // Projects (Looking at Gallery)
    { pos: { x: -20, y: 0, z: -40 }, lookAt: { x: -30, y: 0, z: -50 } } // Contact (Looking at Beacon)
];

let currentSection = 0;
let isAnimating = false;

// Initial Camera Position
camera.position.set(stops[0].pos.x, stops[0].pos.y, stops[0].pos.z);
camera.lookAt(stops[0].lookAt.x, stops[0].lookAt.y, stops[0].lookAt.z);

// --- 5. INTERACTION HANDLING ---

function updateUI(index) {
    // Update Dots
    document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
    document.querySelector(`.nav-dot[data-index="${index}"]`).classList.add('active');

    // Update Sections
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`sec-${index}`).classList.add('active');
}

window.goToSection = function (index) {
    if (isAnimating || index === currentSection) return;
    isAnimating = true;
    currentSection = index;

    const target = stops[index];

    // Update UI immediately (or delay slightly for effect)
    updateUI(index);

    // Animate Camera Position
    gsap.to(camera.position, {
        x: target.pos.x,
        y: target.pos.y,
        z: target.pos.z,
        duration: 2,
        ease: "power3.inOut"
    });

    // Animate Camera Rotation (using a dummy object to lerp LookAt)
    // We tween a temporary object's position, and in the update loop make camera look at it
    const currentLook = { x: 0, y: 0, z: 0 }; // Value doesn't matter, we need start/end logic

    // Simple way: Animate the controls or manually tween a target vector
    // Let's tween a "focusPoint" vector
    gsap.to(focusPoint, {
        x: target.lookAt.x,
        y: target.lookAt.y,
        z: target.lookAt.z,
        duration: 2,
        ease: "power3.inOut",
        onUpdate: () => {
            camera.lookAt(focusPoint.x, focusPoint.y, focusPoint.z);
        },
        onComplete: () => {
            isAnimating = false;
        }
    });
}

// Initialize focus point based on start
const focusPoint = { x: stops[0].lookAt.x, y: stops[0].lookAt.y, z: stops[0].lookAt.z };

// Click listeners for dots
document.querySelectorAll('.nav-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        goToSection(idx);
    });
});

// Wheel Scroll Navigation
window.addEventListener('wheel', (e) => {
    if (isAnimating) return;
    if (e.deltaY > 0) {
        // Next
        if (currentSection < stops.length - 1) goToSection(currentSection + 1);
    } else {
        // Prev
        if (currentSection > 0) goToSection(currentSection - 1);
    }
});

// Mouse Movement Parallax
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

// --- 6. ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // 1. Rotate Starfield slowly
    starMesh.rotation.y = time * 0.02;

    // 2. Animate Section 1 Object (Core)
    coreMesh.rotation.x = time * 0.2;
    coreMesh.rotation.y = time * 0.3;
    innerCoreMesh.rotation.x -= 0.02;

    // 3. Animate Section 2 Object (Rings)
    ringsGroup.children.forEach((ring, i) => {
        ring.rotation.x += 0.005 * (i + 1);
        ring.rotation.y += 0.01;
    });

    // 4. Animate Section 3 Object (Projects)
    projectsGroup.children.forEach((mesh, i) => {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
        mesh.position.y += Math.sin(time + i) * 0.01; // Float
    });

    // 5. Animate Section 4 Object (Beacon)
    beaconSphere.scale.setScalar(1 + Math.sin(time * 2) * 0.05); // Pulse
    beaconParts.rotation.y = time * 0.1;

    // 6. Subtle Camera Parallax (only if not moving sections)
    if (!isAnimating) {
        camera.position.x += (mouseX * 0.5 - (camera.position.x - stops[currentSection].pos.x)) * 0.05;
        camera.position.y += (-mouseY * 0.5 - (camera.position.y - stops[currentSection].pos.y)) * 0.05;
        // Force lookAt update to keep focus steady during parallax
        camera.lookAt(focusPoint.x, focusPoint.y, focusPoint.z);
    }

    renderer.render(scene, camera);
}

// --- 7. HANDLE RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
// Fake loading time to show off loader
setTimeout(() => {
    document.getElementById('progress').style.width = "100%";
    setTimeout(() => {
        document.getElementById('loader').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
            animate();
        }, 500);
    }, 500);
}, 100);