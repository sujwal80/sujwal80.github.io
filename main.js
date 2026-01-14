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
if (window.innerWidth > 768) {
    heroGroup.position.set(15, 0, -10);
} else {
    heroGroup.position.set(0, 0, -20);
}

// 3. Floating Particles (Toruses)
const particleGroup = new THREE.Group();
for (let i = 0; i < 20; i++) {
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
    if (window.innerWidth > 768) {
        heroGroup.position.set(15, 0, -10);
    } else {
        heroGroup.position.set(0, 0, -20);
    }
});

class Portfolio3D {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.currentSection = 0;
        this.isAnimating = false;

        // Navigation Coordinates (Position, LookAt)
        this.stops = [
            { pos: { x: 0, y: 0, z: 5 }, lookAt: { x: 5, y: 0, z: -10 } },
            { pos: { x: 30, y: 0, z: -30 }, lookAt: { x: 40, y: -5, z: -40 } },
            { pos: { x: 5, y: 10, z: -60 }, lookAt: { x: 5, y: 10, z: -80 } },
            { pos: { x: -20, y: 0, z: -40 }, lookAt: { x: -30, y: 0, z: -50 } }
        ];

        // Interaction State
        this.mouseX = 0;
        this.mouseY = 0;

        // Dynamic Objects for Animation
        this.animatedObjects = {
            stars: null,
            core: null,
            innerCore: null,
            rings: [],
            projects: [],
            beacon: null,
            beaconParts: null
        };

        this.focusPoint = new THREE.Vector3(
            this.stops[0].lookAt.x,
            this.stops[0].lookAt.y,
            this.stops[0].lookAt.z
        );
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.createObjects();
        this.setupEvents();
        this.startLoader();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050505, 0.002);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(this.stops[0].pos.x, this.stops[0].pos.y, this.stops[0].pos.z);
        this.camera.lookAt(this.focusPoint);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00ffcc, 1, 100);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    }

    createObjects() {
        // 1. Starfield
        const starGeo = new THREE.BufferGeometry();
        const starCount = 5000;
        const posArray = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 200;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.15, color: 0xffffff, transparent: true, opacity: 0.8 });
        this.animatedObjects.stars = new THREE.Points(starGeo, starMat);
        this.scene.add(this.animatedObjects.stars);

        // 2. The Core (Section 1)
        const coreGeo = new THREE.IcosahedronGeometry(2, 1);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true, transparent: true, opacity: 0.3 });
        this.animatedObjects.core = new THREE.Mesh(coreGeo, coreMat);
        this.animatedObjects.core.position.set(5, 0, -10);
        this.scene.add(this.animatedObjects.core);

        const innerCoreGeo = new THREE.IcosahedronGeometry(1, 0);
        const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        this.animatedObjects.innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
        this.animatedObjects.core.add(this.animatedObjects.innerCore);

        // 3. The Rings (Section 2)
        const ringsGroup = new THREE.Group();
        ringsGroup.position.set(40, -5, -40);
        for (let i = 0; i < 5; i++) {
            const ringGeo = new THREE.TorusGeometry(3 + (i * 1.5), 0.05, 16, 100);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x4444ff, transparent: true, opacity: 0.4 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.random() * Math.PI;
            ring.rotation.y = Math.random() * Math.PI;
            ringsGroup.add(ring);
            this.animatedObjects.rings.push(ring);
        }
        this.scene.add(ringsGroup);

        // 4. Projects Gallery (Section 3)
        const projectsGroup = new THREE.Group();
        projectsGroup.position.set(5, 10, -80);
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
            this.animatedObjects.projects.push(mesh);
        }
        this.scene.add(projectsGroup);

        // 5. Beacon (Section 4)
        const contactGroup = new THREE.Group();
        contactGroup.position.set(-30, 0, -50);
        const sphereGeo = new THREE.SphereGeometry(2, 32, 32);
        const sphereMat = new THREE.MeshPhongMaterial({ color: 0x00ffcc, emissive: 0x004433, wireframe: true });
        this.animatedObjects.beacon = new THREE.Mesh(sphereGeo, sphereMat);
        contactGroup.add(this.animatedObjects.beacon);

        const partGeo = new THREE.BufferGeometry();
        const pArr = new Float32Array(600);
        for (let i = 0; i < 600; i++) pArr[i] = (Math.random() - 0.5) * 10;
        partGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
        const partMat = new THREE.PointsMaterial({ size: 0.1, color: 0xffffff });
        this.animatedObjects.beaconParts = new THREE.Points(partGeo, partMat);
        contactGroup.add(this.animatedObjects.beaconParts);
        this.scene.add(contactGroup);
    }

    setupEvents() {
        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Mouse Move
        window.addEventListener('mousemove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) - 0.5;
            this.mouseY = (e.clientY / window.innerHeight) - 0.5;
        });

        // Wheel Navigation
        window.addEventListener('wheel', (e) => {
            if (this.isAnimating) return;
            if (e.deltaY > 0) {
                if (this.currentSection < this.stops.length - 1) this.goToSection(this.currentSection + 1);
            } else {
                if (this.currentSection > 0) this.goToSection(this.currentSection - 1);
            }
        });

        // Dot Navigation
        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                this.goToSection(idx);
            });
        });

        // Buttons in UI
        document.querySelectorAll('.nav-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.target);
                this.goToSection(idx);
            });
        });
    }

    goToSection(index) {
        if (this.isAnimating || index === this.currentSection) return;
        this.isAnimating = true;
        this.currentSection = index;

        // UI Updates
        document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
        document.querySelector(`.nav-dot[data-index="${index}"]`).classList.add('active');

        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        document.getElementById(`sec-${index}`).classList.add('active');

        // GSAP Animations
        const target = this.stops[index];

        // 1. Move Camera Position
        gsap.to(this.camera.position, {
            x: target.pos.x,
            y: target.pos.y,
            z: target.pos.z,
            duration: 2,
            ease: "power3.inOut"
        });

        // 2. Move Focus Point (Looking direction)
        gsap.to(this.focusPoint, {
            x: target.lookAt.x,
            y: target.lookAt.y,
            z: target.lookAt.z,
            duration: 2,
            ease: "power3.inOut",
            onUpdate: () => {
                this.camera.lookAt(this.focusPoint);
            },
            onComplete: () => {
                this.isAnimating = false;
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // 1. Object Animations
        if (this.animatedObjects.stars) this.animatedObjects.stars.rotation.y = time * 0.02;

        if (this.animatedObjects.core) {
            this.animatedObjects.core.rotation.x = time * 0.2;
            this.animatedObjects.core.rotation.y = time * 0.3;
            this.animatedObjects.innerCore.rotation.x -= 0.02;
        }

        this.animatedObjects.rings.forEach((ring, i) => {
            ring.rotation.x += 0.005 * (i + 1);
            ring.rotation.y += 0.01;
        });

        this.animatedObjects.projects.forEach((mesh, i) => {
            mesh.rotation.x += 0.01;
            mesh.rotation.y += 0.01;
            mesh.position.y += Math.sin(time + i) * 0.01;
        });

        if (this.animatedObjects.beacon) {
            this.animatedObjects.beacon.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
            this.animatedObjects.beaconParts.rotation.y = time * 0.1;
        }

        // 2. Parallax (when not transitioning)
        if (!this.isAnimating) {
            const targetPos = this.stops[this.currentSection].pos;
            this.camera.position.x += (this.mouseX * 0.5 - (this.camera.position.x - targetPos.x)) * 0.05;
            this.camera.position.y += (-this.mouseY * 0.5 - (this.camera.position.y - targetPos.y)) * 0.05;
            this.camera.lookAt(this.focusPoint);
        }

        this.renderer.render(this.scene, this.camera);
    }

    startLoader() {
        // Simulate loading process
        setTimeout(() => {
            document.getElementById('progress').style.width = "100%";
            setTimeout(() => {
                const loader = document.getElementById('loader');
                loader.style.opacity = 0;
                setTimeout(() => {
                    loader.style.display = 'none';
                    this.animate(); // Start animation loop
                }, 500);
            }, 500);
        }, 100);
    }
}