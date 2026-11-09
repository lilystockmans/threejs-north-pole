/**
 * snow.js — Atmospheric particle systems & sky effects:
 * 1. Falling snow particle system (2500 snowflakes drifting and swaying)
 * 2. Aurora Borealis (waving glowing ribbons with AdditiveBlending and sine wave movement)
 * 3. Chimney smoke particles rising from Santa's workshop
 */

import * as THREE from "three";

// ── Shared references for animation ──────────────────────────────────────────
let snowGeometry, snowParticles;
let snowPositions, snowVelocities, snowSwayOffsets;
const SNOW_COUNT = 2500;
const SNOW_BOUNDS = { x: 55, yBottom: 0, yTop: 45, z: 55 };

// Aurora meshes and uniforms
const auroraMeshes = [];

// Chimney smoke
let smokeGeometry, smokePositions, smokeOpacities, smokeAges;
const SMOKE_COUNT = 45;
const CHIMNEY_POS = new THREE.Vector3(-14.5, 8.8, -9.0);

/**
 * Creates falling snow particle system
 */
function createFallingSnow(scene) {
  snowGeometry = new THREE.BufferGeometry();
  snowPositions = new Float32Array(SNOW_COUNT * 3);
  snowVelocities = new Float32Array(SNOW_COUNT);
  snowSwayOffsets = new Float32Array(SNOW_COUNT);

  for (let i = 0; i < SNOW_COUNT; i++) {
    const i3 = i * 3;
    snowPositions[i3] = (Math.random() - 0.5) * SNOW_BOUNDS.x * 2;
    snowPositions[i3 + 1] = Math.random() * SNOW_BOUNDS.yTop;
    snowPositions[i3 + 2] = (Math.random() - 0.5) * SNOW_BOUNDS.z * 2;

    // Fall velocity (randomized gentle drift)
    snowVelocities[i] = 1.2 + Math.random() * 1.6;
    // Horizontal sway phase offset
    snowSwayOffsets[i] = Math.random() * Math.PI * 2;
  }

  snowGeometry.setAttribute("position", new THREE.BufferAttribute(snowPositions, 3));

  const snowMaterial = new THREE.PointsMaterial({
    color: 0xe8edf2,
    size: 0.32,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  snowParticles = new THREE.Points(snowGeometry, snowMaterial);
  scene.add(snowParticles);
}

/**
 * Creates animated Aurora Borealis ribbons in the sky
 */
function createAurora(scene) {
  const auroraVertexShader = `
    uniform float uTime;
    uniform float uWaveSpeed;
    uniform float uWaveFrequency;
    uniform float uWaveAmplitude;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Create natural curtain waving motion
      float wave = sin(pos.x * uWaveFrequency + uTime * uWaveSpeed) *
                   cos(pos.y * 0.1 + uTime * (uWaveSpeed * 0.7));
      float wave2 = sin(pos.x * 0.08 - uTime * (uWaveSpeed * 1.3)) * 1.5;

      pos.z += (wave * uWaveAmplitude) + wave2;
      pos.y += sin(pos.x * 0.04 + uTime * 0.5) * 1.5;

      vWave = wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const auroraFragmentShader = `
    uniform vec3 uColorBottom;
    uniform vec3 uColorMid;
    uniform vec3 uColorTop;
    uniform float uTime;
    varying vec2 vUv;
    varying float vWave;

    void main() {
      // Vertical gradient from bottom to top
      vec3 col = mix(uColorBottom, uColorMid, smoothstep(0.0, 0.45, vUv.y));
      col = mix(col, uColorTop, smoothstep(0.45, 1.0, vUv.y));

      // Curtain vertical bands/stripes that drift
      float bands = sin(vUv.x * 35.0 + uTime * 0.8 + vWave * 2.0) * 0.5 + 0.5;
      bands = pow(bands, 1.4);

      // Smooth fade out at bottom edge and top edge
      float verticalFade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.6, vUv.y);

      float alpha = verticalFade * (0.35 + bands * 0.45);

      gl_FragColor = vec4(col, alpha);
    }
  `;

  // Layered ribbons across the northern sky
  const ribbonsData = [
    {
      width: 130,
      height: 22,
      pos: [0, 32, -35],
      rotY: 0.1,
      speed: 0.7,
      freq: 0.05,
      amp: 4.0,
      colorBottom: new THREE.Color(0x00e676), // Aurora bright green
      colorMid: new THREE.Color(0x00bcd4),    // Cyan
      colorTop: new THREE.Color(0x9c27b0),    // Purple
    },
    {
      width: 140,
      height: 25,
      pos: [-10, 35, -45],
      rotY: -0.15,
      speed: 0.5,
      freq: 0.04,
      amp: 5.5,
      colorBottom: new THREE.Color(0x1de9b6), // Teal-green
      colorMid: new THREE.Color(0x00e5ff),    // Vivid cyan
      colorTop: new THREE.Color(0xba68c8),    // Soft violet
    },
    {
      width: 120,
      height: 18,
      pos: [15, 30, -28],
      rotY: 0.25,
      speed: 0.85,
      freq: 0.06,
      amp: 3.5,
      colorBottom: new THREE.Color(0x69f0ae), // Pale green
      colorMid: new THREE.Color(0x40c4ff),    // Sky blue
      colorTop: new THREE.Color(0x7c4dff),    // Indigo
    },
  ];

  ribbonsData.forEach((data) => {
    const geo = new THREE.PlaneGeometry(data.width, data.height, 48, 12);
    const mat = new THREE.ShaderMaterial({
      vertexShader: auroraVertexShader,
      fragmentShader: auroraFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uWaveSpeed: { value: data.speed },
        uWaveFrequency: { value: data.freq },
        uWaveAmplitude: { value: data.amp },
        uColorBottom: { value: data.colorBottom },
        uColorMid: { value: data.colorMid },
        uColorTop: { value: data.colorTop },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(data.pos[0], data.pos[1], data.pos[2]);
    mesh.rotation.y = data.rotY;
    scene.add(mesh);

    auroraMeshes.push(mesh);
  });
}

/**
 * Creates smoke particles rising from the workshop chimney
 */
function createChimneySmoke(scene) {
  smokeGeometry = new THREE.BufferGeometry();
  smokePositions = new Float32Array(SMOKE_COUNT * 3);
  smokeOpacities = new Float32Array(SMOKE_COUNT);
  smokeAges = new Float32Array(SMOKE_COUNT);

  for (let i = 0; i < SMOKE_COUNT; i++) {
    smokeAges[i] = (i / SMOKE_COUNT) * 4.0; // Staggered lifetimes (0 to 4s)
    const t = smokeAges[i] / 4.0;
    const i3 = i * 3;

    smokePositions[i3] = CHIMNEY_POS.x + Math.sin(t * 3.0) * (0.2 + t * 0.8);
    smokePositions[i3 + 1] = CHIMNEY_POS.y + t * 5.0;
    smokePositions[i3 + 2] = CHIMNEY_POS.z + Math.cos(t * 2.5) * (0.2 + t * 0.8);
  }

  smokeGeometry.setAttribute("position", new THREE.BufferAttribute(smokePositions, 3));

  const smokeMat = new THREE.PointsMaterial({
    color: 0xcfd8dc,
    size: 0.6,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });

  const smokePoints = new THREE.Points(smokeGeometry, smokeMat);
  scene.add(smokePoints);
}

/**
 * Main initializer for all weather & sky particle effects
 */
export function createWeatherEffects(scene) {
  createFallingSnow(scene);
  createAurora(scene);
  createChimneySmoke(scene);
}

/**
 * Frame-by-frame animation of snow, aurora borealis, and chimney smoke
 * @param {number} time - Elapsed time in seconds
 * @param {number} delta - Frame delta in seconds (typically ~0.016s)
 */
export function animateWeatherEffects(time, delta = 0.016) {
  // ── 1. Animate falling snow ────────────────────────────────────────────────
  if (snowGeometry && snowPositions) {
    const pos = snowGeometry.attributes.position.array;
    for (let i = 0; i < SNOW_COUNT; i++) {
      const i3 = i * 3;

      // Fall down
      pos[i3 + 1] -= snowVelocities[i] * delta;

      // Gentle horizontal sway
      pos[i3] += Math.sin(time * 1.2 + snowSwayOffsets[i]) * 0.025;
      pos[i3 + 2] += Math.cos(time * 0.9 + snowSwayOffsets[i]) * 0.02;

      // Wrap back to the top when reaching ground level
      if (pos[i3 + 1] <= SNOW_BOUNDS.yBottom) {
        pos[i3 + 1] = SNOW_BOUNDS.yTop;
        pos[i3] = (Math.random() - 0.5) * SNOW_BOUNDS.x * 2;
        pos[i3 + 2] = (Math.random() - 0.5) * SNOW_BOUNDS.z * 2;
      }
    }
    snowGeometry.attributes.position.needsUpdate = true;
  }

  // ── 2. Animate Aurora Borealis ──────────────────────────────────────────────
  for (let i = 0; i < auroraMeshes.length; i++) {
    const mat = auroraMeshes[i].material;
    if (mat && mat.uniforms && mat.uniforms.uTime) {
      mat.uniforms.uTime.value = time;
    }
  }

  // ── 3. Animate Chimney Smoke ────────────────────────────────────────────────
  if (smokeGeometry && smokePositions) {
    const sPos = smokeGeometry.attributes.position.array;
    const maxAge = 4.0;
    for (let i = 0; i < SMOKE_COUNT; i++) {
      smokeAges[i] += delta;
      if (smokeAges[i] >= maxAge) {
        smokeAges[i] = 0;
      }

      const t = smokeAges[i] / maxAge; // 0.0 -> 1.0
      const i3 = i * 3;

      // Smoke rises and spreads outwards with wind
      sPos[i3] = CHIMNEY_POS.x + Math.sin(t * 3.5 + i) * (0.15 + t * 1.2) + (t * 0.8);
      sPos[i3 + 1] = CHIMNEY_POS.y + t * 5.2;
      sPos[i3 + 2] = CHIMNEY_POS.z + Math.cos(t * 3.0 + i) * (0.15 + t * 1.2);
    }
    smokeGeometry.attributes.position.needsUpdate = true;
  }
}
