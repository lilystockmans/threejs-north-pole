/**
 * terrain.js — Snowy ground plane and perimeter mountains.
 */

import * as THREE from "three";

/**
 * Creates a circular snow-covered ground with gentle vertex displacement
 * and ring of low-poly mountains around the perimeter.
 */
export function createTerrain(scene) {
  // ── Ground plane ────────────────────────────────────────────────────────
  const groundGeo = new THREE.CircleGeometry(60, 64);

  // Rotate geometry to lie flat (XZ plane)
  groundGeo.rotateX(-Math.PI / 2);

  // Displace vertices for a bumpy snow surface
  const pos = groundGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    // Only displace Y (up); keep center vertex (i === 0) flat
    if (i > 0) {
      pos.setY(i, pos.getY(i) + Math.random() * 0.3);
    }
  }
  pos.needsUpdate = true;
  groundGeo.computeVertexNormals(); // Recalc normals after displacement

  const groundMat = new THREE.MeshLambertMaterial({
    color: 0xe8edf2, // Snow White
    flatShading: true,
  });

  const ground = new THREE.Mesh(groundGeo, groundMat);
  scene.add(ground);

  // ── Mountains around the perimeter ──────────────────────────────────────
  const mountainCount = 12; // 10-14 range

  for (let i = 0; i < mountainCount; i++) {
    // Spread mountains evenly around a circle, with slight angle jitter
    const angle =
      (i / mountainCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;

    // Distance from center (40-55)
    const dist = 40 + Math.random() * 15;

    // Random dimensions
    const radius = 3 + Math.random() * 4; // 3-7
    const height = 8 + Math.random() * 10; // 8-18

    // Mountain body — arctic blue
    const bodyGeo = new THREE.ConeGeometry(radius, height, 6 + Math.floor(Math.random() * 3));
    const bodyMat = new THREE.MeshLambertMaterial({
      color: 0x1a3a5c, // Arctic Blue
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);

    // Position on the perimeter ring
    body.position.set(
      Math.cos(angle) * dist,
      height / 2, // Sit on ground
      Math.sin(angle) * dist
    );
    body.rotation.y = Math.random() * Math.PI * 2;
    scene.add(body);

    // Snow cap — top 40% (smaller cone on top)
    const capHeight = height * 0.4;
    const capRadius = radius * 0.45;
    const capGeo = new THREE.ConeGeometry(capRadius, capHeight, 6);
    const capMat = new THREE.MeshLambertMaterial({
      color: 0xe8edf2, // Snow White
      flatShading: true,
    });
    const cap = new THREE.Mesh(capGeo, capMat);

    // Place cap on top of mountain body
    cap.position.set(
      body.position.x,
      height * 0.6 + capHeight / 2, // Sits on top 60% of body
      body.position.z
    );
    cap.rotation.y = body.rotation.y;
    scene.add(cap);
  }
}
