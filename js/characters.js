/**
 * characters.js — Low-poly Santa, Mrs. Claus, and Elves built from primitives.
 */

import * as THREE from "three";

// ── Shared materials ────────────────────────────────────────────────────────
const skinMat = new THREE.MeshLambertMaterial({ color: 0xfdd9b5, flatShading: true });
const redMat = new THREE.MeshLambertMaterial({ color: 0xc0392b, flatShading: true });
const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, flatShading: true });
const whiteMat = new THREE.MeshLambertMaterial({ color: 0xe8edf2, flatShading: true });
const yellowMat = new THREE.MeshLambertMaterial({ color: 0xf4d03f, flatShading: true });
const greenMat = new THREE.MeshLambertMaterial({ color: 0x2d5a3d, flatShading: true });
const darkPineMat = new THREE.MeshLambertMaterial({ color: 0x1a3a28, flatShading: true });
const pinkMat = new THREE.MeshLambertMaterial({ color: 0xf0a0a0, flatShading: true });
const grayMat = new THREE.MeshLambertMaterial({ color: 0x999999, flatShading: true });

// ════════════════════════════════════════════════════════════════════════════
// HELPER — build a humanoid character group
// ════════════════════════════════════════════════════════════════════════════

/**
 * Build Santa and add him to the scene.
 * @returns {THREE.Group} Santa's group
 */
function buildSanta() {
  const santa = new THREE.Group();

  // ── Body ───────────────────────────────────────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(1.2, 1.5, 0.8);
  const body = new THREE.Mesh(bodyGeo, redMat);
  body.position.y = 1.55;
  santa.add(body);

  // ── Belt ───────────────────────────────────────────────────────────────
  const beltGeo = new THREE.BoxGeometry(1.22, 0.15, 0.82);
  const belt = new THREE.Mesh(beltGeo, blackMat);
  belt.position.y = 1.35;
  santa.add(belt);

  // Belt buckle
  const buckleGeo = new THREE.BoxGeometry(0.18, 0.14, 0.1);
  const buckle = new THREE.Mesh(buckleGeo, yellowMat);
  buckle.position.set(0, 1.35, 0.42);
  santa.add(buckle);

  // ── Legs ───────────────────────────────────────────────────────────────
  for (let side of [-1, 1]) {
    const legGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 6);
    const leg = new THREE.Mesh(legGeo, redMat);
    leg.position.set(side * 0.28, 0.4, 0);
    santa.add(leg);

    // Boot
    const bootGeo = new THREE.BoxGeometry(0.3, 0.25, 0.45);
    const boot = new THREE.Mesh(bootGeo, blackMat);
    boot.position.set(side * 0.28, 0.12, 0.05);
    santa.add(boot);
  }

  // ── Arms ───────────────────────────────────────────────────────────────
  for (let side of [-1, 1]) {
    const armGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 6);
    const arm = new THREE.Mesh(armGeo, redMat);
    arm.position.set(side * 0.72, 1.6, 0);
    arm.rotation.z = side * -0.25; // Angle slightly outward
    santa.add(arm);

    // Mitten
    const mittenGeo = new THREE.SphereGeometry(0.14, 6, 4);
    const mitten = new THREE.Mesh(mittenGeo, whiteMat);
    mitten.position.set(side * 0.82, 1.18, 0);
    santa.add(mitten);
  }

  // ── Head ───────────────────────────────────────────────────────────────
  const headGeo = new THREE.SphereGeometry(0.45, 8, 6);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 2.7;
  santa.add(head);

  // ── Eyes ───────────────────────────────────────────────────────────────
  const eyeGeo = new THREE.SphereGeometry(0.05, 6, 4);
  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, blackMat);
    eye.position.set(side * 0.15, 2.78, 0.38);
    santa.add(eye);
  }

  // ── Nose ──────────────────────────────────────────────────────────────
  const noseGeo = new THREE.SphereGeometry(0.07, 6, 4);
  const nose = new THREE.Mesh(noseGeo, pinkMat);
  nose.position.set(0, 2.68, 0.42);
  santa.add(nose);

  // ── Beard ─────────────────────────────────────────────────────────────
  // Cluster of white spheres below the face
  const beardPositions = [
    [0, 2.4, 0.35],
    [-0.12, 2.45, 0.33],
    [0.12, 2.45, 0.33],
    [0, 2.32, 0.3],
  ];
  const beardGeo = new THREE.SphereGeometry(0.14, 6, 4);
  for (const pos of beardPositions) {
    const bead = new THREE.Mesh(beardGeo, whiteMat);
    bead.position.set(...pos);
    santa.add(bead);
  }

  // ── Hat ────────────────────────────────────────────────────────────────
  const hatGeo = new THREE.ConeGeometry(0.4, 0.6, 8);
  const hat = new THREE.Mesh(hatGeo, redMat);
  hat.position.y = 3.3;
  hat.rotation.z = 0.15; // Slight tilt for charm
  santa.add(hat);

  // Hat brim (cylinder ring at base of hat)
  const brimGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.12, 8);
  const brim = new THREE.Mesh(brimGeo, whiteMat);
  brim.position.y = 3.0;
  santa.add(brim);

  // Pompom on hat tip
  const pomGeo = new THREE.SphereGeometry(0.12, 6, 4);
  const pom = new THREE.Mesh(pomGeo, whiteMat);
  pom.position.set(0.08, 3.6, 0);
  santa.add(pom);

  return santa;
}

/**
 * Build Mrs. Claus and add her to the scene.
 * @returns {THREE.Group} Mrs. Claus's group
 */
function buildMrsClaus() {
  const mrs = new THREE.Group();

  // ── Dress / body — a wider-bottom shape using truncated cone ───────────
  const dressGeo = new THREE.CylinderGeometry(0.4, 0.7, 1.6, 8);
  const dressMat = new THREE.MeshLambertMaterial({ color: 0xc0392b, flatShading: true });
  const dress = new THREE.Mesh(dressGeo, dressMat);
  dress.position.y = 1.3;
  mrs.add(dress);

  // ── White apron on front ──────────────────────────────────────────────
  const apronGeo = new THREE.BoxGeometry(0.5, 0.9, 0.05);
  const apron = new THREE.Mesh(apronGeo, whiteMat);
  apron.position.set(0, 1.2, 0.55);
  mrs.add(apron);

  // ── Legs (hidden mostly under dress) ──────────────────────────────────
  for (let side of [-1, 1]) {
    const bootGeo = new THREE.BoxGeometry(0.26, 0.2, 0.38);
    const boot = new THREE.Mesh(bootGeo, blackMat);
    boot.position.set(side * 0.22, 0.1, 0.05);
    mrs.add(boot);
  }

  // ── Arms ──────────────────────────────────────────────────────────────
  for (let side of [-1, 1]) {
    const armGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.65, 6);
    const arm = new THREE.Mesh(armGeo, dressMat);
    arm.position.set(side * 0.6, 1.6, 0);
    arm.rotation.z = side * -0.3;
    mrs.add(arm);

    // Hand
    const handGeo = new THREE.SphereGeometry(0.12, 6, 4);
    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.set(side * 0.72, 1.2, 0);
    mrs.add(hand);
  }

  // ── Head ──────────────────────────────────────────────────────────────
  const headGeo = new THREE.SphereGeometry(0.42, 8, 6);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 2.5;
  mrs.add(head);

  // ── White hair bun ────────────────────────────────────────────────────
  const bunGeo = new THREE.SphereGeometry(0.3, 6, 4);
  const bun = new THREE.Mesh(bunGeo, whiteMat);
  bun.position.set(0, 2.7, -0.25);
  mrs.add(bun);

  // Side hair puffs
  for (let side of [-1, 1]) {
    const puffGeo = new THREE.SphereGeometry(0.18, 6, 4);
    const puff = new THREE.Mesh(puffGeo, whiteMat);
    puff.position.set(side * 0.32, 2.55, -0.1);
    mrs.add(puff);
  }

  // ── Eyes ──────────────────────────────────────────────────────────────
  const eyeGeo = new THREE.SphereGeometry(0.04, 6, 4);
  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, blackMat);
    eye.position.set(side * 0.14, 2.55, 0.36);
    mrs.add(eye);
  }

  // ── Nose ──────────────────────────────────────────────────────────────
  const noseGeo = new THREE.SphereGeometry(0.05, 6, 4);
  const nose = new THREE.Mesh(noseGeo, pinkMat);
  nose.position.set(0, 2.46, 0.4);
  mrs.add(nose);

  // ── Glasses ───────────────────────────────────────────────────────────
  // Two small torus rings + bridge cylinder
  for (let side of [-1, 1]) {
    const lensGeo = new THREE.TorusGeometry(0.12, 0.02, 6, 8);
    const lens = new THREE.Mesh(lensGeo, grayMat);
    lens.position.set(side * 0.14, 2.55, 0.4);
    mrs.add(lens);
  }
  // Bridge
  const bridgeGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.12, 4);
  const bridge = new THREE.Mesh(bridgeGeo, grayMat);
  bridge.position.set(0, 2.55, 0.4);
  bridge.rotation.z = Math.PI / 2;
  mrs.add(bridge);

  return mrs;
}

/**
 * Build a low-poly elf.
 * @param {number} hatColor - Hat hex color for variety
 * @returns {THREE.Group} Elf group
 */
function buildElf(hatColor = 0x2d5a3d) {
  const elf = new THREE.Group();
  const scale = 0.65; // Elves are smaller than Santa

  // ── Body ──────────────────────────────────────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(0.8, 1.0, 0.55);
  const body = new THREE.Mesh(bodyGeo, greenMat);
  body.position.y = 1.1;
  elf.add(body);

  // ── Belt ──────────────────────────────────────────────────────────────
  const beltGeo = new THREE.BoxGeometry(0.82, 0.1, 0.57);
  const belt = new THREE.Mesh(beltGeo, blackMat);
  belt.position.y = 0.9;
  elf.add(belt);

  // ── Legs ──────────────────────────────────────────────────────────────
  for (let side of [-1, 1]) {
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.55, 6);
    const leg = new THREE.Mesh(legGeo, greenMat);
    leg.position.set(side * 0.18, 0.32, 0);
    elf.add(leg);

    // Pointy elf boot
    const bootGeo = new THREE.BoxGeometry(0.2, 0.15, 0.35);
    const boot = new THREE.Mesh(bootGeo, darkPineMat);
    boot.position.set(side * 0.18, 0.06, 0.05);
    elf.add(boot);
  }

  // ── Arms ──────────────────────────────────────────────────────────────
  for (let side of [-1, 1]) {
    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
    const arm = new THREE.Mesh(armGeo, greenMat);
    arm.position.set(side * 0.5, 1.15, 0);
    arm.rotation.z = side * -0.3;
    elf.add(arm);

    // Hand
    const handGeo = new THREE.SphereGeometry(0.09, 6, 4);
    const hand = new THREE.Mesh(handGeo, skinMat);
    hand.position.set(side * 0.58, 0.84, 0);
    elf.add(hand);
  }

  // ── Head ──────────────────────────────────────────────────────────────
  const headGeo = new THREE.SphereGeometry(0.32, 8, 6);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.9;
  elf.add(head);

  // ── Eyes ──────────────────────────────────────────────────────────────
  const eyeGeo = new THREE.SphereGeometry(0.04, 6, 4);
  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, blackMat);
    eye.position.set(side * 0.11, 1.95, 0.28);
    elf.add(eye);
  }

  // ── Rosy cheeks ───────────────────────────────────────────────────────
  const cheekGeo = new THREE.SphereGeometry(0.06, 6, 4);
  for (let side of [-1, 1]) {
    const cheek = new THREE.Mesh(cheekGeo, pinkMat);
    cheek.position.set(side * 0.18, 1.88, 0.24);
    elf.add(cheek);
  }

  // ── Pointed ears ──────────────────────────────────────────────────────
  const earGeo = new THREE.ConeGeometry(0.06, 0.2, 4);
  for (let side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.position.set(side * 0.32, 1.95, 0);
    ear.rotation.z = side * -Math.PI / 3; // Point outward
    elf.add(ear);
  }

  // ── Pointed hat ───────────────────────────────────────────────────────
  const hatMat = new THREE.MeshLambertMaterial({ color: hatColor, flatShading: true });
  const hatGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
  const hat = new THREE.Mesh(hatGeo, hatMat);
  hat.position.y = 2.55;
  hat.rotation.z = 0.2; // Jaunty tilt
  elf.add(hat);

  // Yellow tip on hat
  const tipGeo = new THREE.SphereGeometry(0.08, 6, 4);
  const tip = new THREE.Mesh(tipGeo, yellowMat);
  tip.position.set(0.12, 2.92, 0);
  elf.add(tip);

  // Apply overall scale to the elf
  elf.scale.set(scale, scale, scale);

  return elf;
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════════════

/**
 * Creates all characters (Santa, Mrs. Claus, 3 Elves) and adds them to the scene.
 */
export function createCharacters(scene) {
  // ── Santa — near the workshop door ────────────────────────────────────
  const santa = buildSanta();
  santa.position.set(-8, 0, -5);
  scene.add(santa);

  // ── Mrs. Claus — next to Santa ────────────────────────────────────────
  const mrsClaus = buildMrsClaus();
  mrsClaus.position.set(-6, 0, -5);
  mrsClaus.rotation.y = -0.3; // Turned slightly toward Santa
  scene.add(mrsClaus);

  // ── Elves — scattered near the workshop ───────────────────────────────
  const elfPositions = [
    { pos: [-14, 0, -5], rotY: 0.4, hat: 0x2d5a3d },  // Green hat
    { pos: [-10, 0, -10], rotY: -0.3, hat: 0xc0392b }, // Red hat
    { pos: [-15, 0, -8], rotY: 0.8, hat: 0xf4d03f },   // Yellow hat
  ];

  for (const cfg of elfPositions) {
    const elf = buildElf(cfg.hat);
    elf.position.set(...cfg.pos);
    elf.rotation.y = cfg.rotY;
    scene.add(elf);
  }
}
