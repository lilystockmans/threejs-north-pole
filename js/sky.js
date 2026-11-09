/**
 * sky.js — Inverted sky dome and twinkling star field.
 */

import * as THREE from "three";

/** Reference to the star Points object and its base sizes for twinkling */
let starPoints = null;
let baseSizes = null;

/**
 * Creates an inverted sphere sky dome and a star field of 600 points.
 */
export function createSky(scene) {
  // ── Sky dome ────────────────────────────────────────────────────────────
  const domeGeo = new THREE.SphereGeometry(200, 32, 32);
  const domeMat = new THREE.MeshBasicMaterial({
    color: 0x0f2038, // Deep Atmospheric Night Sky (matches scene.background)
    side: THREE.BackSide, // Render inside faces
  });
  const dome = new THREE.Mesh(domeGeo, domeMat);
  scene.add(dome);

  // ── Stars ───────────────────────────────────────────────────────────────
  const starCount = 600;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const phases = new Float32Array(starCount); // Random phase offsets for twinkling

  for (let i = 0; i < starCount; i++) {
    // Random point on a sphere shell (radius 180-195)
    const radius = 180 + Math.random() * 15;
    const theta = Math.random() * Math.PI * 2; // Azimuth
    const phi = Math.acos(2 * Math.random() - 1); // Polar — uniform distribution

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Random base size (0.4 – 0.8)
    sizes[i] = 0.4 + Math.random() * 0.4;

    // Random phase so stars twinkle at different times
    phases[i] = Math.random() * Math.PI * 2;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  // Store original sizes for twinkling reference
  baseSizes = sizes.slice();

  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.6,
    sizeAttenuation: true,
  });

  starPoints = new THREE.Points(starGeo, starMat);
  // Store phases on the geometry for the animation callback
  starPoints.userData.phases = phases;
  scene.add(starPoints);
}

/**
 * Twinkle animation — oscillates each star's size with a sin wave.
 * @param {number} time — elapsed seconds from the clock
 */
export function animateStars(time) {
  if (!starPoints || !baseSizes) return;

  const sizeAttr = starPoints.geometry.getAttribute("size");
  const phases = starPoints.userData.phases;

  for (let i = 0; i < sizeAttr.count; i++) {
    // Each star oscillates between 60%-100% of its base size
    const wave = Math.sin(time * 1.5 + phases[i]);
    sizeAttr.array[i] = baseSizes[i] * (0.8 + 0.2 * wave);
  }
  sizeAttr.needsUpdate = true;
}
