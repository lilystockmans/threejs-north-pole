/**
 * main.js — Scene bootstrap: renderer, camera, lights, controls, animation loop.
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createTerrain } from "./terrain.js";
import { createSky, animateStars } from "./sky.js";
import { createNorthPole } from "./northpole.js";
import { createWorkshop } from "./workshop.js";
import { createTrees, animateTrees, treeMeshes } from "./trees.js";
import { createCharacters } from "./characters.js";
import { createReindeer } from "./reindeer.js";
import { createProps, animateProps } from "./props.js";

// ── Renderer ────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// ── Camera ──────────────────────────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(30, 20, 30);
camera.lookAt(0, 0, 0);

// ── Scene ───────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1628); // Deep Night Sky
scene.fog = new THREE.FogExp2(0x0a1628, 0.012); // Exponential fog matching sky

// ── Lights ──────────────────────────────────────────────────────────────────
// Blue-ish moonlight ambient fill
const ambientLight = new THREE.AmbientLight(0x4466aa, 0.4);
scene.add(ambientLight);

// Directional moonlight from upper-right
const moonLight = new THREE.DirectionalLight(0xaabbdd, 0.6);
moonLight.position.set(30, 40, 20);
scene.add(moonLight);

// ── OrbitControls ───────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minPolarAngle = 0.3; // Prevent looking straight down
controls.maxPolarAngle = Math.PI / 2.1; // Can't go below ground
controls.minDistance = 10;
controls.maxDistance = 80;
controls.target.set(0, 0, 0);

// ── Build the world ─────────────────────────────────────────────────────────
createTerrain(scene);
createSky(scene);
createNorthPole(scene);
createWorkshop(scene);
createTrees(scene);
createCharacters(scene);
createReindeer(scene);
createProps(scene);

// ── Animation loop ──────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Update orbit controls damping
  controls.update();

  // Animate modules
  animateStars(elapsed);
  animateTrees(elapsed);
  animateProps(elapsed);

  // Render the scene
  renderer.render(scene, camera);
}
animate();

// ── Responsive resize handler ───────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── Exports for other modules ───────────────────────────────────────────────
export { scene, camera };
