import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

RectAreaLightUniformsLib.init();

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 3, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

//Lights
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 5, 2);
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xffaa00, 1, 100);
pointLight.position.set(-3, 2, 3);
scene.add(pointLight);

const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x404040, 1);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const rectLight = new THREE.RectAreaLight(0xffcc88, 4, 4, 2);
rectLight.position.set(5, 5, 0);
rectLight.lookAt(0, 0, 0);
scene.add(rectLight);


const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x228822 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
scene.add(ground);
scene.remove(ground);


const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('assets/textures/grassblock.jpg');

const cubes = [];
const grassMaterial = new THREE.MeshBasicMaterial({ map: grassTexture });

for (let i = 0; i < 5; i++) {
  const cube = new THREE.Mesh(new THREE.BoxGeometry(), grassMaterial);
  cube.position.set((i - 2) * 2, 3, -5);
  cubes.push(cube);
  scene.add(cube);
}


const mtlLoader = new MTLLoader();
mtlLoader.setPath('assets/models/');
mtlLoader.load('plane.obj.mtl', (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('assets/models/');
  objLoader.load('plane.obj', (root) => {
    root.scale.set(5, 5, 5);
    root.position.set(0, 0, 0);
    scene.add(root);
  });
});

const pilotLoader = new MTLLoader();
pilotLoader.setPath('assets/models/');
pilotLoader.load('pilot.obj.mtl', (pilotMaterials) => {
  pilotMaterials.preload();

  const objLoader = new OBJLoader();
  objLoader.setMaterials(pilotMaterials);
  objLoader.setPath('assets/models/');
  objLoader.load('pilot.obj', (pilot) => {
    pilot.scale.set(1, 1, 1);
    pilot.position.set(2, 0, 3);

    const pilotTexture = textureLoader.load('assets/models/pilot.png');
    pilotTexture.colorSpace = THREE.SRGBColorSpace;

    pilot.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Force texture
        child.material.map = pilotTexture;

        // Fix lighting issues
        child.material.metalness = 0;
        child.material.roughness = 1;

        if (child.material.specular) {
          child.material.specular.set(0x000000);
        }

        child.material.needsUpdate = true;
      }
    });

    scene.add(pilot);
  });
});


const materialArray = [
  new THREE.MeshBasicMaterial({ map: textureLoader.load('assets/skybox/px.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('assets/skybox/nx.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('assets/skybox/py.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('assets/skybox/ny.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('assets/skybox/pz.png'), side: THREE.BackSide }),
  new THREE.MeshBasicMaterial({ map: textureLoader.load('assets/skybox/nz.png'), side: THREE.BackSide }),
];

const skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
const skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);


window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function createTree(x, z) {
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 2),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  trunk.position.set(x, 1, z);
  scene.add(trunk);

  const leaf = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x228B22 }) 
  );
  leaf.position.set(x, 3, z);
  scene.add(leaf);
}

const bushMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

function createBushCluster(baseX, baseZ, count = 3) {
  for (let i = 0; i < count; i++) {
    const xOffset = (Math.random() - 0.5) * 1.5;
    const zOffset = (Math.random() - 0.5) * 1.5;
    const scale = 0.8 + Math.random() * 0.5;

    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.5 * scale, 12, 12),
      bushMaterial
    );
    bush.position.set(baseX + xOffset, 0.25 * scale, baseZ + zOffset);
    scene.add(bush);
  }
}

function animate() {
  requestAnimationFrame(animate);
  cubes.forEach((cube, i) => {
    cube.rotation.x += 0.01 + i * 0.001;
    cube.rotation.y += 0.02 + i * 0.001;
  });
  controls.update();
  renderer.render(scene, camera);
}


createBushCluster(5, -5, 4);
createBushCluster(5, 6, 3);
createBushCluster(-4, 2, 5);
createTree(8, 4);
createTree(-6, -5);
createTree(-10, 10);
createTree(4, -8);
createTree(0, 12);
animate();
