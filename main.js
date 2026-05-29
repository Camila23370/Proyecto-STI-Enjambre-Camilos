import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';
import { Agent } from './agent.js';

// creación de la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// creación de la cámara
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 15;

// renderizado
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// luz
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

// enjambre
const agents = [];

for (let i = 0; i < 8; i++) {
  agents.push(new Agent(scene));
}

// dirección del enjambre
function getAverageVelocity() {
  const avg = new THREE.Vector3();

  agents.forEach(a => {
    avg.add(a.velocity);
  });

  avg.divideScalar(agents.length);

  return avg;
}

// animación
function animate() {
  requestAnimationFrame(animate);

  const avgVelocity = getAverageVelocity();

  agents.forEach(a => {
    // alineación de enjambre
    a.velocity.lerp(avgVelocity, 0.02);

    a.update(10);
  });

  renderer.render(scene, camera);
}

animate();

// responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight; // se ajusta al alto y ancho de la ventana
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight); // se ajusta al alto y ancho de la ventana
});