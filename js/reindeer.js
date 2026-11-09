/**
 * reindeer.js — Low-poly reindeer herd with Rudolph's glowing nose.
 */

import * as THREE from "three";

// ── Shared materials ────────────────────────────────────────────────────────
const brownMat = new THREE.MeshLambertMaterial({ color: 0x8b5e3c, flatShading: true });
const lightBrownMat = new THREE.MeshLambertMaterial({ color: 0xa87b5a, flatShading: true });
const darkBrownMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1c, flatShading: true });
const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, flatShading: true });
const antlerMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1c, flatShading: true });

/**
 * Build a single low-poly reindeer from primitives.
 * @param {boolean} isRudolph — if true, adds a glowing red nose + point light
 * @returns {THREE.Group} reindeer group
 */
function buildReindeer(isRudolph = false) {
  const deer = new THREE.Group();

  // ── Body ──────────────────────────────────────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(1.8, 1.0, 0.8);
  const body = new THREE.Mesh(bodyGeo, brownMat);
  body.position.y = 1.5;
  deer.add(body);

  // ── Head ──────────────────────────────────────────────────────────────
  const headGeo = new THREE.BoxGeometry(0.6, 0.5, 0.5);
  const head = new THREE.Mesh(headGeo, lightBrownMat);
  head.position.set(1.2, 1.8, 0);
  deer.add(head);

  // ── Snout ─────────────────────────────────────────────────────────────
  const snoutGeo = new THREE.BoxGeometry(0.35, 0.3, 0.35);
  const snout = new THREE.Mesh(snoutGeo, lightBrownMat);
  snout.position.set(1.55, 1.7, 0);
  deer.add(snout);

  // ── Nose (Rudolph gets a glowing red one) ─────────────────────────────
  if (isRudolph) {
    const noseGeo = new THREE.SphereGeometry(0.1, 6, 4);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0xe74c3c });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(1.75, 1.7, 0);
    deer.add(nose);

    // Red point light at nose position
    const noseLight = new THREE.PointLight(0xe74c3c, 0.5, 3);
    noseLight.position.set(1.75, 1.7, 0);
    deer.add(noseLight);
  }

  // ── Ears ──────────────────────────────────────────────────────────────
  const earGeo = new THREE.ConeGeometry(0.08, 0.22, 4);
  for (let side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, brownMat);
    ear.position.set(1.1, 2.15, side * 0.25);
    ear.rotation.x = side * 0.3; // Angle outward
    deer.add(ear);
  }

  // ── Eyes ──────────────────────────────────────────────────────────────
  const eyeGeo = new THREE.SphereGeometry(0.04, 6, 4);
  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, blackMat);
    eye.position.set(1.35, 1.88, side * 0.2);
    deer.add(eye);
  }

  // ── Legs (4 at corners of the body) ───────────────────────────────────
  const legPositions = [
    [0.6, 0, 0.25],   // Front-right
    [0.6, 0, -0.25],  // Front-left
    [-0.6, 0, 0.25],  // Back-right
    [-0.6, 0, -0.25], // Back-left
  ];
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6);
  const hoofGeo = new THREE.BoxGeometry(0.14, 0.1, 0.14);

  for (const [lx, , lz] of legPositions) {
    // Leg cylinder
    const leg = new THREE.Mesh(legGeo, brownMat);
    leg.position.set(lx, 0.6, lz);
    deer.add(leg);

    // Hoof at bottom of leg
    const hoof = new THREE.Mesh(hoofGeo, darkBrownMat);
    hoof.position.set(lx, 0.03, lz);
    deer.add(hoof);
  }

  // ── Tail ──────────────────────────────────────────────────────────────
  const tailGeo = new THREE.ConeGeometry(0.08, 0.3, 4);
  const tail = new THREE.Mesh(tailGeo, brownMat);
  tail.position.set(-1.05, 1.7, 0);
  tail.rotation.z = Math.PI / 4; // Angle upward
  deer.add(tail);

  // ── Antlers ───────────────────────────────────────────────────────────
  // Build simple branching antlers on each side
  for (let side of [-1, 1]) {
    const antlerGroup = new THREE.Group();

    // Main trunk going up
    const trunkGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.6, 4);
    const trunk = new THREE.Mesh(trunkGeo, antlerMat);
    trunk.position.y = 0.3;
    antlerGroup.add(trunk);

    // First branch angled outward
    const branch1Geo = new THREE.CylinderGeometry(0.025, 0.03, 0.35, 4);
    const branch1 = new THREE.Mesh(branch1Geo, antlerMat);
    branch1.position.set(side * 0.12, 0.35, 0);
    branch1.rotation.z = side * -0.6;
    antlerGroup.add(branch1);

    // Second branch (higher, shorter)
    const branch2Geo = new THREE.CylinderGeometry(0.02, 0.025, 0.25, 4);
    const branch2 = new THREE.Mesh(branch2Geo, antlerMat);
    branch2.position.set(side * 0.08, 0.52, 0.05);
    branch2.rotation.z = side * -0.8;
    antlerGroup.add(branch2);

    // Third small tine at top
    const branch3Geo = new THREE.CylinderGeometry(0.015, 0.02, 0.18, 4);
    const branch3 = new THREE.Mesh(branch3Geo, antlerMat);
    branch3.position.set(side * 0.05, 0.6, -0.04);
    branch3.rotation.z = side * -0.4;
    antlerGroup.add(branch3);

    // Position the whole antler group on the head
    antlerGroup.position.set(1.1, 2.1, side * 0.15);
    deer.add(antlerGroup);
  }

  return deer;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════════════

/**
 * Creates 3 reindeer (Rudolph in front) and adds them to the scene.
 */
export function createReindeer(scene) {
  // Reindeer herd positioned to the right side of the scene
  const herdGroup = new THREE.Group();

  // ── Rudolph — front of the group ──────────────────────────────────────
  const rudolph = buildReindeer(true);
  rudolph.position.set(1.5, 0, 0);
  rudolph.rotation.y = -0.2; // Slight angle
  herdGroup.add(rudolph);

  // ── Second reindeer — behind and to the left ──────────────────────────
  const deer2 = buildReindeer(false);
  deer2.position.set(-1.0, 0, -1.5);
  deer2.rotation.y = 0.15;
  herdGroup.add(deer2);

  // ── Third reindeer — behind and to the right ──────────────────────────
  const deer3 = buildReindeer(false);
  deer3.position.set(-1.5, 0, 1.8);
  deer3.rotation.y = -0.1;
  herdGroup.add(deer3);

  // Position the entire herd in the scene
  herdGroup.position.set(10, 0, 5);
  scene.add(herdGroup);
}
