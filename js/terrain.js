/**
 * terrain.js — Smooth snowy ground with gentle snow powder bumps, perimeter mountains,
 * calm glacial stream, low-poly wooden bridge, and drifting ice floes.
 */

import * as THREE from "three";

// ── River curve definition ──────────────────────────────────────────────────
// Control points guide the river from western hills across to southeastern plains
const RIVER_CONTROL_PTS = [
  [-48, -6],
  [-34, -3],
  [-20, -0.5],
  [-8, 1.2],
  [1, 5.0],
  [15, 12.0],
  [26, 21.0],
  [37, 30.0],
  [48, 38.0],
];

/**
 * Evaluates Catmull-Rom spline at parameter t in [0, 1]
 */
export function getRiverPoint(t) {
  const p = (RIVER_CONTROL_PTS.length - 1) * Math.max(0, Math.min(1, t));
  const i = Math.min(Math.floor(p), RIVER_CONTROL_PTS.length - 2);
  const u = p - i;
  const p0 = RIVER_CONTROL_PTS[Math.max(0, i - 1)];
  const p1 = RIVER_CONTROL_PTS[i];
  const p2 = RIVER_CONTROL_PTS[i + 1];
  const p3 = RIVER_CONTROL_PTS[Math.min(RIVER_CONTROL_PTS.length - 1, i + 2)];

  const u2 = u * u;
  const u3 = u2 * u;
  const f0 = -0.5 * u3 + u2 - 0.5 * u;
  const f1 = 1.5 * u3 - 2.5 * u2 + 1.0;
  const f2 = -1.5 * u3 + 2.0 * u2 + 0.5 * u;
  const f3 = 0.5 * u3 - 0.5 * u2;

  return [
    p0[0] * f0 + p1[0] * f1 + p2[0] * f2 + p3[0] * f3,
    p0[1] * f0 + p1[1] * f1 + p2[1] * f2 + p3[1] * f3,
  ];
}

// Pre-sample river points for fast distance calculation
const SAMPLE_COUNT = 100;
const RIVER_SAMPLES = [];
for (let i = 0; i <= SAMPLE_COUNT; i++) {
  RIVER_SAMPLES.push(getRiverPoint(i / SAMPLE_COUNT));
}

/**
 * Calculates minimum distance from (px, pz) to the river curve
 */
export function distToRiver(px, pz) {
  let minDist = Infinity;
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const a = RIVER_SAMPLES[i];
    const b = RIVER_SAMPLES[i + 1];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const lenSq = dx * dx + dz * dz;
    const u = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / lenSq));
    const nx = a[0] + u * dx;
    const nz = a[1] + u * dz;
    const d = Math.hypot(px - nx, pz - nz);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Height function for real snow surface:
 * Slight, soft bumps across the snowdrifts (amplitude ~0.15 to 0.3),
 * keeping landmarks level and smoothly nestling the calm glacial stream.
 */
export function getTerrainHeight(x, z) {
  const r = Math.hypot(x, z);
  if (r > 62) return 0;

  // Gentle, soft bumps like real powdery snow drifts
  let h = Math.sin(x * 0.12) * Math.cos(z * 0.12) * 0.22;
  h += Math.sin(x * 0.25 + 1.4) * Math.cos(z * 0.22 + 0.8) * 0.14;
  h += (Math.cos(x * 0.4 - z * 0.35) * 0.5 + 0.5) * 0.08;

  // Soft perimeter rise towards mountains
  if (r > 32) {
    const rim = Math.min(1, (r - 32) / 26);
    h += Math.pow(rim, 2) * 1.1;
  }

  // Smooth flat clearings for landmarks
  const dCenter = Math.hypot(x, z);
  const centerDamp = Math.min(1, Math.max(0, (dCenter - 2.5) / 2.5));

  const dWorkshop = Math.hypot(x - (-11), z - (-7));
  const workshopDamp = Math.min(1, Math.max(0, (dWorkshop - 7.0) / 3.0));

  const dReindeer = Math.hypot(x - 9, z - 4.5);
  const reindeerDamp = Math.min(1, Math.max(0, (dReindeer - 4.5) / 2.5));

  const dFire1 = Math.hypot(x - 8, z - (-8));
  const fire1Damp = Math.min(1, Math.max(0, (dFire1 - 2.5) / 2.0));

  const dFire2 = Math.hypot(x - (-5), z - 8);
  const fire2Damp = Math.min(1, Math.max(0, (dFire2 - 2.5) / 2.0));

  const dSnowman = Math.hypot(x - 5, z - (-5));
  const snowmanDamp = Math.min(1, Math.max(0, (dSnowman - 2.5) / 2.0));

  const damp = Math.min(centerDamp, workshopDamp, reindeerDamp, fire1Damp, fire2Damp, snowmanDamp);
  const baseRoughness = h * damp;

  // Gentle, shallow river channel
  const halfWidth = 1.7;
  const bankWidth = 3.6;
  const dRiver = distToRiver(x, z);

  const waterLevel = -0.10;
  const riverBedFloor = -0.36;

  if (dRiver < halfWidth) {
    // Under river water
    return riverBedFloor - (1 - dRiver / halfWidth) * 0.10;
  } else if (dRiver < bankWidth) {
    // Smooth bank slope meeting water edge continuously
    const t = (dRiver - halfWidth) / (bankWidth - halfWidth);
    const blend = t * t * (3 - 2 * t);
    return waterLevel * (1 - blend) + baseRoughness * blend;
  }
  return baseRoughness;
}

// ── Animation state ─────────────────────────────────────────────────────────
let waterMesh = null;
let baseWaterY = null;
const iceFloes = [];

/**
 * Creates the soft snow terrain diorama base:
 * 1. Subdivided snow disc with gentle bumps like real powdery snow
 * 2. Calm glacial stream with reflective arctic water
 * 3. Low-poly wooden arch bridge
 * 4. Drifting low-poly ice floes
 * 5. Perimeter mountains
 */
export function createTerrain(scene) {
  // ── 1. Soft snowy ground plane ───────────────────────────────────────────
  const radius = 60;
  const rings = 48;
  const segments = 64;

  const positions = [];
  const uvs = [];
  const indices = [];

  // Center vertex
  positions.push(0, 0, 0);
  uvs.push(0.5, 0.5);

  // Concentric rings
  for (let r = 1; r <= rings; r++) {
    const rad = (r / rings) * radius;
    for (let s = 0; s < segments; s++) {
      const theta = (s / segments) * Math.PI * 2;
      const x = Math.cos(theta) * rad;
      const z = Math.sin(theta) * rad;
      positions.push(x, 0, z);
      uvs.push((x / radius) * 0.5 + 0.5, (z / radius) * 0.5 + 0.5);
    }
  }

  // Indices for center fan
  for (let s = 0; s < segments; s++) {
    const next = (s + 1) % segments;
    indices.push(0, next + 1, s + 1);
  }

  // Indices for concentric quad strips — counter-clockwise winding (normals UP +Y)
  for (let r = 1; r < rings; r++) {
    const ringStart = 1 + (r - 1) * segments;
    const nextRingStart = 1 + r * segments;
    for (let s = 0; s < segments; s++) {
      const next = (s + 1) % segments;
      const current = ringStart + s;
      const currentNext = ringStart + next;
      const outer = nextRingStart + s;
      const outerNext = nextRingStart + next;

      indices.push(current, currentNext, outerNext);
      indices.push(current, outerNext, outer);
    }
  }

  const groundGeo = new THREE.BufferGeometry();
  groundGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  groundGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  groundGeo.setIndex(indices);

  // Apply heights & subtle low-poly snow micro-jitter
  const posAttr = groundGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);
    const y = getTerrainHeight(x, z);

    // Very gentle micro-jitter for powdery snow facets
    const jitter = ((Math.sin(x * 37.1 + z * 19.3) * 12345.67) % 1) * 0.06;
    posAttr.setY(i, y + jitter);
  }
  posAttr.needsUpdate = true;
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshLambertMaterial({
    color: 0xf2f6fa, // Crisp Powdery Snow White
    flatShading: true,
    side: THREE.DoubleSide,
  });

  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.receiveShadow = true;
  ground.name = "ground";
  scene.add(ground);

  // ── 2. River water mesh ───────────────────────────────────────────────────
  const riverSteps = 80;
  const riverWaterHalfWidth = 1.7;
  const ribbonPositions = [];
  const ribbonUvs = [];
  const ribbonIndices = [];

  for (let i = 0; i <= riverSteps; i++) {
    const t = i / riverSteps;
    const curr = getRiverPoint(t);
    const prev = getRiverPoint(Math.max(0, t - 0.015));
    const next = getRiverPoint(Math.min(1, t + 0.015));

    const dx = next[0] - prev[0];
    const dz = next[1] - prev[1];
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;

    const waterY = -0.10;
    ribbonPositions.push(curr[0] - nx * riverWaterHalfWidth, waterY, curr[1] - nz * riverWaterHalfWidth);
    ribbonUvs.push(0, t);

    ribbonPositions.push(curr[0] + nx * riverWaterHalfWidth, waterY, curr[1] + nz * riverWaterHalfWidth);
    ribbonUvs.push(1, t);

    // Counter-clockwise winding so normals point UP (+Y)
    if (i < riverSteps) {
      const v0 = i * 2;
      const v1 = i * 2 + 1;
      const v2 = (i + 1) * 2;
      const v3 = (i + 1) * 2 + 1;

      ribbonIndices.push(v0, v2, v1);
      ribbonIndices.push(v1, v2, v3);
    }
  }

  const riverGeo = new THREE.BufferGeometry();
  riverGeo.setAttribute("position", new THREE.Float32BufferAttribute(ribbonPositions, 3));
  riverGeo.setAttribute("uv", new THREE.Float32BufferAttribute(ribbonUvs, 2));
  riverGeo.setIndex(ribbonIndices);
  riverGeo.computeVertexNormals();

  // Store base water heights for ripple animation
  baseWaterY = new Float32Array(riverGeo.attributes.position.count);
  for (let i = 0; i < baseWaterY.length; i++) {
    baseWaterY[i] = riverGeo.attributes.position.getY(i);
  }

  const riverMat = new THREE.MeshPhongMaterial({
    color: 0x3898dc,      // Arctic Blue
    emissive: 0x09304e,   // Deep blue luminous glow
    specular: 0xffffff,   // Bright moonlight shine
    shininess: 90,
    transparent: true,
    opacity: 0.85,
    flatShading: true,
    side: THREE.DoubleSide,
  });

  waterMesh = new THREE.Mesh(riverGeo, riverMat);
  waterMesh.receiveShadow = true;
  waterMesh.name = "riverWater";
  scene.add(waterMesh);

  // ── 3. Low-poly wooden bridge across river ────────────────────────────────
  buildWoodenBridge(scene);

  // ── 4. Drifting low-poly ice floes ────────────────────────────────────────
  createIceFloes(scene);

  // ── 5. Mountains around the perimeter ────────────────────────────────────
  const mountainCount = 13;
  for (let i = 0; i < mountainCount; i++) {
    const angle = (i / mountainCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const dist = 42 + Math.random() * 14;

    const mx = Math.cos(angle) * dist;
    const mz = Math.sin(angle) * dist;

    // Avoid blocking the river mouth
    if (distToRiver(mx, mz) < 6.5) continue;

    const radius = 3.5 + Math.random() * 4.5;
    const height = 9 + Math.random() * 11;
    const groundY = getTerrainHeight(mx, mz);

    // Mountain body
    const bodyGeo = new THREE.ConeGeometry(radius, height, 6 + Math.floor(Math.random() * 3));
    const bodyMat = new THREE.MeshLambertMaterial({
      color: 0x1a3a5c, // Arctic Blue
      flatShading: true,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(mx, groundY + height / 2, mz);
    body.rotation.y = Math.random() * Math.PI * 2;
    scene.add(body);

    // Snow cap — top 40%
    const capHeight = height * 0.4;
    const capRadius = radius * 0.45;
    const capGeo = new THREE.ConeGeometry(capRadius, capHeight, 6);
    const capMat = new THREE.MeshLambertMaterial({
      color: 0xf2f6fa,
      flatShading: true,
    });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(mx, groundY + height * 0.6 + capHeight / 2, mz);
    cap.rotation.y = body.rotation.y;
    scene.add(cap);
  }
}

/**
 * Builds a low-poly arched wooden bridge spanning across the river
 */
function buildWoodenBridge(scene) {
  const bridge = new THREE.Group();

  // Bridge position at river midpoint (t = 0.5 -> [1, 5.0])
  const centerPoint = getRiverPoint(0.5);
  const pPrev = getRiverPoint(0.48);
  const pNext = getRiverPoint(0.52);

  const dx = pNext[0] - pPrev[0];
  const dz = pNext[1] - pPrev[1];
  const riverAngle = Math.atan2(dz, dx);
  // Bridge crosses perpendicular to flow
  const bridgeAngle = riverAngle + Math.PI / 2;

  bridge.position.set(centerPoint[0], 0, centerPoint[1]);
  bridge.rotation.y = bridgeAngle;

  const woodMat = new THREE.MeshLambertMaterial({
    color: 0x6e4320, // Warm weathered timber
    flatShading: true,
  });

  const snowMat = new THREE.MeshLambertMaterial({
    color: 0xf2f6fa,
    flatShading: true,
  });

  const spanLength = 4.8;
  const bridgeWidth = 1.4;
  const plankCount = 11;

  // Deck planks along the gentle arch
  for (let i = 0; i < plankCount; i++) {
    const u = (i / (plankCount - 1)) * 2 - 1; // -1 to +1
    const s = u * (spanLength / 2);
    const archH = 0.42;
    const y = 0.03 + (1 - u * u) * archH;

    const plankGeo = new THREE.BoxGeometry(0.36, 0.08, bridgeWidth);
    const plank = new THREE.Mesh(plankGeo, woodMat);

    // Tilt plank to follow arch slope
    const slope = -2 * u * (archH / (spanLength / 2));
    plank.position.set(s, y, 0);
    plank.rotation.z = Math.atan(slope);
    bridge.add(plank);
  }

  // Side support stringer beams (left & right)
  [-bridgeWidth / 2 + 0.08, bridgeWidth / 2 - 0.08].forEach((zOffset) => {
    const segCount = 4;
    for (let i = 0; i < segCount; i++) {
      const u1 = (i / segCount) * 2 - 1;
      const u2 = ((i + 1) / segCount) * 2 - 1;
      const s1 = u1 * (spanLength / 2);
      const s2 = u2 * (spanLength / 2);
      const y1 = -0.02 + (1 - u1 * u1) * 0.42;
      const y2 = -0.02 + (1 - u2 * u2) * 0.42;

      const segLen = Math.hypot(s2 - s1, y2 - y1);
      const beamGeo = new THREE.BoxGeometry(segLen, 0.1, 0.1);
      const beam = new THREE.Mesh(beamGeo, woodMat);
      beam.position.set((s1 + s2) / 2, (y1 + y2) / 2, zOffset);
      beam.rotation.z = Math.atan2(y2 - y1, s2 - s1);
      bridge.add(beam);
    }

    // Railing posts
    const postPositions = [-1.8, 0, 1.8];
    postPositions.forEach((px) => {
      const u = px / (spanLength / 2);
      const baseY = 0.03 + (1 - u * u) * 0.42;

      const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 5);
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(px, baseY + 0.3, zOffset);
      bridge.add(post);
    });

    // Top handrail beam
    const handrailGeo = new THREE.BoxGeometry(spanLength * 0.95, 0.08, 0.08);
    const handrail = new THREE.Mesh(handrailGeo, woodMat);
    handrail.position.set(0, 0.85, zOffset);
    bridge.add(handrail);

    // Snow topping on handrail
    const snowRailGeo = new THREE.BoxGeometry(spanLength * 0.96, 0.04, 0.1);
    const snowRail = new THREE.Mesh(snowRailGeo, snowMat);
    snowRail.position.set(0, 0.90, zOffset);
    bridge.add(snowRail);
  });

  bridge.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  scene.add(bridge);
}

/**
 * Creates low-poly ice floes that drift along the river
 */
function createIceFloes(scene) {
  const iceMat = new THREE.MeshLambertMaterial({
    color: 0xeef7fc, // Glacial Ice White
    flatShading: true,
  });

  const count = 7;
  for (let i = 0; i < count; i++) {
    const rad = 0.4 + Math.random() * 0.35;
    const sides = 5 + Math.floor(Math.random() * 3);
    const iceGeo = new THREE.CylinderGeometry(rad * 0.85, rad, 0.08, sides);
    const ice = new THREE.Mesh(iceGeo, iceMat);

    ice.rotation.y = Math.random() * Math.PI * 2;
    ice.rotation.z = (Math.random() - 0.5) * 0.06;

    ice.userData = {
      t: (i / count) + Math.random() * 0.08,
      speed: 0.012 + Math.random() * 0.008,
      rotSpeed: (Math.random() - 0.5) * 0.3,
      bobPhase: Math.random() * Math.PI * 2,
    };

    scene.add(ice);
    iceFloes.push(ice);
  }
}

/**
 * Animates the water surface and drifting ice floes
 */
export function animateTerrain(time, delta = 0.016) {
  // Animate gentle water ripples
  if (waterMesh && baseWaterY) {
    const pos = waterMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const wave = Math.sin(time * 2.0 + x * 0.35 + z * 0.35) * 0.015;
      pos.setY(i, baseWaterY[i] + wave);
    }
    pos.needsUpdate = true;
  }

  // Animate drifting ice floes
  for (const ice of iceFloes) {
    ice.userData.t = (ice.userData.t + ice.userData.speed * delta) % 1.0;
    const pt = getRiverPoint(ice.userData.t);
    const bob = Math.sin(time * 2.5 + ice.userData.bobPhase) * 0.018;

    ice.position.set(pt[0], -0.07 + bob, pt[1]);
    ice.rotation.y += ice.userData.rotSpeed * delta;
  }
}
