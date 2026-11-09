/**
 * props.js — Scene props: campfires, gifts, candy canes, sled, snowman, fence.
 * Exports createProps(scene) to build all objects and
 * animateProps(time) for flickering campfire animation.
 */

import * as THREE from "three";

// ── Internal arrays for animation ───────────────────────────────────────────
/** Each entry: { cones: Mesh[], light: PointLight } */
const campfires = [];

// ── Shared materials ────────────────────────────────────────────────────────
const snowMat = new THREE.MeshLambertMaterial({ color: 0xe8edf2, flatShading: true });
const blackMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a, flatShading: true });
const warmWoodMat = new THREE.MeshLambertMaterial({ color: 0x8b5e3c, flatShading: true });
const darkWoodMat = new THREE.MeshLambertMaterial({ color: 0x5a3a1c, flatShading: true });
const redMat = new THREE.MeshLambertMaterial({ color: 0xe74c3c, flatShading: true });
const roofRedMat = new THREE.MeshLambertMaterial({ color: 0xc0392b, flatShading: true });
const orangeMat = new THREE.MeshLambertMaterial({ color: 0xe67e22, flatShading: true });
const stoneMat = new THREE.MeshLambertMaterial({ color: 0x777777, flatShading: true });
const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });

// ══════════════════════════════════════════════════════════════════════════════
// CAMPFIRE BUILDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a campfire with criss-cross logs, a stone ring, flame cones, and a point light.
 * @returns {THREE.Group}
 */
function buildCampfire() {
  const group = new THREE.Group();
  const flameCones = [];

  // ── Logs — 3 small cylinders arranged in a criss-cross ────────────────
  const logGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.8, 5);
  const logAngles = [0, Math.PI / 3, -Math.PI / 3];
  logAngles.forEach((angle) => {
    const log = new THREE.Mesh(logGeo, darkWoodMat);
    log.position.y = 0.06;
    log.rotation.z = Math.PI / 2;
    log.rotation.y = angle;
    group.add(log);
  });

  // ── Stone ring — 8 small spheres around the fire ──────────────────────
  const stoneGeo = new THREE.SphereGeometry(0.15, 5, 3);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(Math.cos(angle) * 0.5, 0.08, Math.sin(angle) * 0.5);
    stone.scale.y = 0.6; // Flatten slightly
    group.add(stone);
  }

  // ── Flame cones — 3 overlapping, orange and yellow ────────────────────
  const flameData = [
    { radius: 0.3, height: 1.2, color: 0xe67e22, y: 0.6 },
    { radius: 0.2, height: 0.9, color: 0xf4d03f, y: 0.55 },
    { radius: 0.15, height: 0.8, color: 0xe67e22, y: 0.5 },
  ];
  flameData.forEach((fd, idx) => {
    const geo = new THREE.ConeGeometry(fd.radius, fd.height, 5);
    const mat = new THREE.MeshBasicMaterial({ color: fd.color });
    const cone = new THREE.Mesh(geo, mat);
    // Offset flames slightly for organic feel
    const offsetAngle = (idx / 3) * Math.PI * 2;
    cone.position.set(
      Math.cos(offsetAngle) * 0.06,
      fd.y,
      Math.sin(offsetAngle) * 0.06
    );
    group.add(cone);
    flameCones.push(cone);
  });

  // ── Point light just above the flames ─────────────────────────────────
  const fireLight = new THREE.PointLight(0xe67e22, 1.0, 8);
  fireLight.position.set(0, 1.0, 0);
  group.add(fireLight);

  // Store references for animation
  campfires.push({ cones: flameCones, light: fireLight });

  return group;
}

// ══════════════════════════════════════════════════════════════════════════════
// GIFT BOX BUILDER
// ══════════════════════════════════════════════════════════════════════════════

/** Colors for random gift boxes */
const giftColors = [0xe74c3c, 0x2ecc71, 0x3498db, 0xf4d03f, 0x9c27b0];
/** Contrasting ribbon colors */
const ribbonColors = [0xf4d03f, 0xe74c3c, 0xffffff, 0xe67e22, 0x00bcd4];

/**
 * Builds a single gift box with a ribbon cross on top.
 * @param {number} size — side length
 * @param {number} colorIdx — index into giftColors
 * @returns {THREE.Group}
 */
function buildGiftBox(size, colorIdx) {
  const group = new THREE.Group();

  // ── Box body ──────────────────────────────────────────────────────────
  const boxGeo = new THREE.BoxGeometry(size, size, size);
  const boxMat = new THREE.MeshLambertMaterial({
    color: giftColors[colorIdx % giftColors.length],
    flatShading: true,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = size / 2;
  group.add(box);

  // ── Ribbon cross on top ───────────────────────────────────────────────
  const ribbonColor = ribbonColors[colorIdx % ribbonColors.length];
  const ribbonMat = new THREE.MeshLambertMaterial({ color: ribbonColor, flatShading: true });
  const ribbonH = size * 0.08; // ribbon thickness

  // Ribbon strip along X
  const r1Geo = new THREE.BoxGeometry(size * 1.02, ribbonH, size * 0.15);
  const r1 = new THREE.Mesh(r1Geo, ribbonMat);
  r1.position.y = size + ribbonH / 2;
  group.add(r1);

  // Ribbon strip along Z
  const r2Geo = new THREE.BoxGeometry(size * 0.15, ribbonH, size * 1.02);
  const r2 = new THREE.Mesh(r2Geo, ribbonMat);
  r2.position.y = size + ribbonH / 2;
  group.add(r2);

  return group;
}

// ══════════════════════════════════════════════════════════════════════════════
// CANDY CANE BUILDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Builds a candy cane: straight cylinder + torus hook.
 * @param {boolean} invertColors — swap red/white
 * @returns {THREE.Group}
 */
function buildCandyCane(invertColors = false) {
  const group = new THREE.Group();

  const straightColor = invertColors ? 0xe74c3c : 0xffffff;
  const hookColor = invertColors ? 0xffffff : 0xe74c3c;

  // ── Straight part ─────────────────────────────────────────────────────
  const stickGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6);
  const stickMat = new THREE.MeshLambertMaterial({ color: straightColor, flatShading: true });
  const stick = new THREE.Mesh(stickGeo, stickMat);
  stick.position.y = 0.6;
  group.add(stick);

  // ── Curved hook (half-torus) at the top ───────────────────────────────
  const hookGeo = new THREE.TorusGeometry(0.2, 0.06, 6, 8, Math.PI);
  const hookMat = new THREE.MeshLambertMaterial({ color: hookColor, flatShading: true });
  const hook = new THREE.Mesh(hookGeo, hookMat);
  // Place at top of stick, rotated to form the J-hook shape
  hook.position.set(0.2, 1.2, 0);
  hook.rotation.z = Math.PI / 2;
  hook.rotation.y = Math.PI / 2;
  group.add(hook);

  return group;
}

// ══════════════════════════════════════════════════════════════════════════════
// SLED BUILDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Builds a sled with seat, runners, backrest, and a couple of gifts on top.
 * @returns {THREE.Group}
 */
function buildSled() {
  const group = new THREE.Group();

  // ── Seat / base platform ──────────────────────────────────────────────
  const seatGeo = new THREE.BoxGeometry(2.0, 0.15, 0.8);
  const seat = new THREE.Mesh(seatGeo, roofRedMat);
  seat.position.y = 0.5;
  group.add(seat);

  // ── Runners — two dark-wood rails under the seat ──────────────────────
  const runnerGeo = new THREE.BoxGeometry(2.5, 0.08, 0.3);
  for (let side of [-1, 1]) {
    const runner = new THREE.Mesh(runnerGeo, darkWoodMat);
    runner.position.set(0, 0.15, side * 0.35);
    group.add(runner);

    // Curved front tip of each runner (angled box)
    const tipGeo = new THREE.BoxGeometry(0.4, 0.08, 0.3);
    const tip = new THREE.Mesh(tipGeo, darkWoodMat);
    tip.position.set(1.35, 0.35, side * 0.35);
    tip.rotation.z = 0.6; // Angle upward
    group.add(tip);
  }

  // ── Back rest ─────────────────────────────────────────────────────────
  const backGeo = new THREE.BoxGeometry(0.1, 0.6, 0.8);
  const backRest = new THREE.Mesh(backGeo, roofRedMat);
  backRest.position.set(-0.95, 0.85, 0);
  group.add(backRest);

  // ── A couple of gift boxes sitting on the sled ────────────────────────
  const gift1 = buildGiftBox(0.35, 0);
  gift1.position.set(0.2, 0.57, 0.1);
  group.add(gift1);

  const gift2 = buildGiftBox(0.28, 2);
  gift2.position.set(-0.3, 0.57, -0.1);
  group.add(gift2);

  return group;
}

// ══════════════════════════════════════════════════════════════════════════════
// SNOWMAN BUILDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Builds a snowman with 3 body spheres, carrot nose, coal eyes/mouth,
 * stick arms, top hat, and scarf.
 * @returns {THREE.Group}
 */
function buildSnowman() {
  const group = new THREE.Group();

  // ── Body: 3 stacked spheres ───────────────────────────────────────────
  const bottomGeo = new THREE.SphereGeometry(0.7, 7, 5);
  const bottom = new THREE.Mesh(bottomGeo, snowMat);
  bottom.position.y = 0.7;
  group.add(bottom);

  const middleGeo = new THREE.SphereGeometry(0.5, 7, 5);
  const middle = new THREE.Mesh(middleGeo, snowMat);
  middle.position.y = 1.65;
  group.add(middle);

  const headGeo = new THREE.SphereGeometry(0.35, 7, 5);
  const head = new THREE.Mesh(headGeo, snowMat);
  head.position.y = 2.35;
  group.add(head);

  // ── Carrot nose ───────────────────────────────────────────────────────
  const noseGeo = new THREE.ConeGeometry(0.06, 0.35, 5);
  const nose = new THREE.Mesh(noseGeo, orangeMat);
  nose.position.set(0.35, 2.35, 0);
  nose.rotation.z = -Math.PI / 2; // Point forward
  group.add(nose);

  // ── Coal eyes ─────────────────────────────────────────────────────────
  const eyeGeo = new THREE.SphereGeometry(0.04, 4, 4);
  for (let side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, blackMat);
    eye.position.set(0.3, 2.45, side * 0.12);
    group.add(eye);
  }

  // ── Smile — 5 tiny coal spheres in a curve ────────────────────────────
  const mouthGeo = new THREE.SphereGeometry(0.025, 4, 4);
  for (let i = 0; i < 5; i++) {
    const angle = -0.4 + (i / 4) * 0.8; // Spread across a small arc
    const dot = new THREE.Mesh(mouthGeo, blackMat);
    dot.position.set(
      0.33,
      2.25 - Math.abs(angle) * 0.12, // Dips down at edges for smile
      Math.sin(angle) * 0.18
    );
    group.add(dot);
  }

  // ── Stick arms — 2 thin cylinders angling outward from middle sphere ──
  const armGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4);
  for (let side of [-1, 1]) {
    const arm = new THREE.Mesh(armGeo, darkWoodMat);
    arm.position.set(0, 1.65, side * 0.75);
    arm.rotation.x = side * 0.6;
    arm.rotation.z = 0.3;
    group.add(arm);
  }

  // ── Top hat — cylinder + brim ─────────────────────────────────────────
  const hatBodyGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.35, 6);
  const hatBody = new THREE.Mesh(hatBodyGeo, blackMat);
  hatBody.position.y = 2.85;
  group.add(hatBody);

  const brimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.04, 6);
  const brim = new THREE.Mesh(brimGeo, blackMat);
  brim.position.y = 2.68;
  group.add(brim);

  // ── Scarf around neck area ────────────────────────────────────────────
  const scarfGeo = new THREE.BoxGeometry(0.55, 0.1, 0.55);
  const scarf = new THREE.Mesh(scarfGeo, redMat);
  scarf.position.y = 2.05;
  group.add(scarf);

  // Dangling scarf end
  const scarfEndGeo = new THREE.BoxGeometry(0.12, 0.3, 0.08);
  const scarfEnd = new THREE.Mesh(scarfEndGeo, redMat);
  scarfEnd.position.set(0.2, 1.9, 0.25);
  scarfEnd.rotation.z = 0.2;
  group.add(scarfEnd);

  return group;
}

// ══════════════════════════════════════════════════════════════════════════════
// WOODEN FENCE BUILDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Builds a partial wooden fence (L-shape) around the workshop perimeter.
 * Workshop is at (-12, 0, -8), extends roughly 8 wide and 6 deep.
 * @param {THREE.Scene} scene
 */
function buildFence(scene) {
  const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 5);

  /** Helper: add a fence post at world position (x, z) */
  function addPost(x, z) {
    const post = new THREE.Mesh(postGeo, warmWoodMat);
    post.position.set(x, 0.4, z);
    scene.add(post);
    return post;
  }

  /** Helper: add a horizontal rail between two world positions */
  function addRail(x1, z1, x2, z2, y) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.sqrt(dx * dx + dz * dz);
    const railGeo = new THREE.BoxGeometry(length, 0.06, 0.06);
    const rail = new THREE.Mesh(railGeo, warmWoodMat);
    rail.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    rail.rotation.y = Math.atan2(dz, dx);
    scene.add(rail);
  }

  // ── Fence posts & rails along the front of the workshop (z = -1.5) ────
  // Workshop front face is at z = -8 + 3 = -5 (workshop at -12, 0, -8; body 6 deep)
  // Place fence slightly in front: z = -4
  const frontPosts = [];
  const frontZ = -4;
  for (let i = 0; i < 8; i++) {
    const x = -18 + i * 1.8;
    const post = addPost(x, frontZ);
    frontPosts.push({ x, z: frontZ });
  }
  // Connect front posts with 2 horizontal rails each
  for (let i = 0; i < frontPosts.length - 1; i++) {
    const a = frontPosts[i];
    const b = frontPosts[i + 1];
    addRail(a.x, a.z, b.x, b.z, 0.25);
    addRail(a.x, a.z, b.x, b.z, 0.6);
  }

  // ── Fence posts & rails along the side (x = -18) going back ──────────
  const sidePosts = [];
  const sideX = -18;
  for (let i = 0; i < 6; i++) {
    const z = frontZ - i * 1.8;
    const post = addPost(sideX, z);
    sidePosts.push({ x: sideX, z });
  }
  // Connect side posts with rails
  for (let i = 0; i < sidePosts.length - 1; i++) {
    const a = sidePosts[i];
    const b = sidePosts[i + 1];
    addRail(a.x, a.z, b.x, b.z, 0.25);
    addRail(a.x, a.z, b.x, b.z, 0.6);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Creates all scene props: campfires, gift boxes, candy canes, sled,
 * snowman, and wooden fence. Adds them to the scene.
 */
export function createProps(scene) {
  // ── Campfires ×2 ──────────────────────────────────────────────────────
  const campfirePositions = [
    [8, 0, -8],
    [-5, 0, 8],
  ];
  campfirePositions.forEach(([x, y, z]) => {
    const fire = buildCampfire();
    fire.position.set(x, y, z);
    scene.add(fire);
  });

  // ── Gift boxes ×10 scattered near workshop & trees ────────────────────
  const giftPositions = [
    // Near workshop (-12, -8 area)
    [-10, -6], [-13, -5], [-15, -7], [-11, -10], [-14, -9],
    [-9, -11], [-16, -6],
    // Near trees
    [-5, -3], [6, -5], [3, 11],
  ];
  giftPositions.forEach(([x, z], idx) => {
    const size = 0.3 + Math.random() * 0.4;
    const gift = buildGiftBox(size, idx);
    gift.position.set(x, 0, z);
    gift.rotation.y = Math.random() * Math.PI * 2;
    scene.add(gift);
  });

  // ── Candy canes ×4 ───────────────────────────────────────────────────
  const caneData = [
    { x: -7, z: -3, rotY: 0.2, rotZ: 0.1, invert: false },
    { x: 4, z: -7, rotY: -0.3, rotZ: -0.15, invert: true },
    { x: -3, z: 9, rotY: 1.2, rotZ: 0.12, invert: false },
    { x: 11, z: 2, rotY: -0.8, rotZ: -0.1, invert: true },
  ];
  caneData.forEach((cd) => {
    const cane = buildCandyCane(cd.invert);
    cane.position.set(cd.x, 0, cd.z);
    cane.rotation.y = cd.rotY;
    cane.rotation.z = cd.rotZ; // Slight tilt — stuck in the ground
    scene.add(cane);
  });

  // ── Sled ×1 — near the reindeer herd (10, 0, 5) ──────────────────────
  const sled = buildSled();
  sled.position.set(7, 0, 3);
  sled.rotation.y = -0.3;
  scene.add(sled);

  // ── Snowman ×1 ────────────────────────────────────────────────────────
  const snowman = buildSnowman();
  snowman.position.set(5, 0, -5);
  scene.add(snowman);

  // ── Wooden fence around workshop ──────────────────────────────────────
  buildFence(scene);
}

/**
 * Animates campfire flames and lights with a flickering effect.
 * @param {number} time — elapsed seconds from the clock
 */
export function animateProps(time) {
  campfires.forEach((fire, idx) => {
    // Different frequency per campfire for variety
    const baseFreq = 3.5 + idx * 0.7;

    // Oscillate each flame cone's Y-scale
    fire.cones.forEach((cone, ci) => {
      const freq = baseFreq + ci * 1.1;
      const wave = Math.sin(time * freq + ci * 1.7);
      cone.scale.y = 0.8 + 0.4 * (0.5 + 0.5 * wave); // Range: 0.8 – 1.2
    });

    // Flicker the point light intensity
    const lightWave = Math.sin(time * (baseFreq + 0.5)) * 0.5
                    + Math.sin(time * (baseFreq * 1.3)) * 0.3;
    fire.light.intensity = 0.9 + lightWave * 0.3; // Range: ~0.6 – 1.2
  });
}
