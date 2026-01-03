// main.js

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();

// Fog for depth
scene.fog = new THREE.FogExp2(0x050505, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// --- OBJECTS ---

// 1. Starfield
function addStar() {
    const geometry = new THREE.SphereGeometry(0.15, 24, 24);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
}
// Create 250 stars
Array(250).fill().forEach(addStar);

// 2. Main Hero Object (Icosahedron with Wireframe)
const geometry = new THREE.IcosahedronGeometry(10, 1);

// Material 1: The solid inner shape
const materialSolid = new THREE.MeshPhongMaterial({ 
    color: 0x000000, 
    shininess: 100,
    flatShading: true
});

// Material 2: The wireframe outer
const materialWire = new THREE.MeshBasicMaterial({ 
    color: 0x00f3ff, 
    wireframe: true,
    transparent: true,
    opacity: 0.3
});

const heroMesh = new THREE.Mesh(geometry, materialSolid);
const heroWire = new THREE.Mesh(geometry, materialWire);

// Group them to rotate together
const heroGroup = new THREE.Group();
heroGroup.add(heroMesh);
heroGroup.add(heroWire);

scene.add(heroGroup);

// Position slightly to the right
if(window.innerWidth > 768) {
    heroGroup.position.set(15, 0, -10);
} else {
    heroGroup.position.set(0, 0, -20);
}

// 3. Floating Particles (Toruses)
const particleGroup = new THREE.Group();
for(let i=0; i<20; i++) {
    const geo = new THREE.TorusGeometry(2, 0.2, 8, 20);
    const mat = new THREE.MeshBasicMaterial({ color: 0xbd00ff, wireframe: true, transparent: true, opacity: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    
    mesh.position.x = (Math.random() - 0.5) * 80;
    mesh.position.y = (Math.random() - 0.5) * 80;
    mesh.position.z = (Math.random() - 0.5) * 80;
    
    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;
    
    particleGroup.add(mesh);
}
scene.add(particleGroup);

// --- LIGHTS ---
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

// Blue ambient light for mood
const spotLight = new THREE.SpotLight(0x00f3ff, 1);
spotLight.position.set(-20, 20, 10);

scene.add(pointLight, ambientLight, spotLight);


// --- INTERACTION ---

// Scroll Animation
function moveCamera() {
    const t = document.body.getBoundingClientRect().top;
    
    // Rotate hero object based on scroll
    heroGroup.rotation.x += 0.01;
    heroGroup.rotation.y += 0.01;
    heroGroup.rotation.z += 0.01;

    // Move camera slightly
    camera.position.z = t * -0.01 + 30;
    camera.position.y = t * -0.0002;
    camera.position.x = t * -0.0002;
    
    // Parallax effect for particles
    particleGroup.rotation.y = t * 0.0005;
}
document.body.onscroll = moveCamera;

// Mouse Movement Interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse follow
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;

    heroGroup.rotation.y += 0.005;
    heroGroup.rotation.x += (targetY - heroGroup.rotation.x) * 0.05;
    heroGroup.rotation.y += (targetX - heroGroup.rotation.y) * 0.05;

    // Animate Particles floating
    particleGroup.children.forEach((child, i) => {
        child.rotation.x += 0.01;
        child.rotation.y += 0.01;
        // Bobbing motion
        child.position.y += Math.sin(elapsedTime + i) * 0.02;
    });

    renderer.render(scene, camera);
}

animate();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Reposition hero based on screen size
    if(window.innerWidth > 768) {
        heroGroup.position.set(15, 0, -10);
    } else {
        heroGroup.position.set(0, 0, -20);
    }
});