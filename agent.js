import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js';

export class Agent {
  constructor(scene) {
    const geometry = new THREE.IcosahedronGeometry(0.5);

    // colores para los agentes 
    const color = new THREE.Color();
    color.setHSL(Math.random(), 1, 0.5);

    const material = new THREE.MeshBasicMaterial({
    color: color
    });

    this.mesh = new THREE.Mesh(geometry, material);

    // posición inicial aleatoria
    this.mesh.position.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 20
    );

    // velocidad inicial aleatoria
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    );

    scene.add(this.mesh);
  }

  update(bounds = 10) {
    // movimiento
    this.mesh.position.add(this.velocity);

    // rotación ligera (se ve más “vida”)
    this.mesh.rotation.x += 0.01;
    this.mesh.rotation.y += 0.01;

    // rebote
    ['x', 'y', 'z'].forEach(axis => {
      if (this.mesh.position[axis] > bounds) this.mesh.position[axis] = -bounds;
      if (this.mesh.position[axis] < -bounds) this.mesh.position[axis] = bounds;
    });
  }
}