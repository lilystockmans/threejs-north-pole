/**
 * main.js — Scene bootstrap: renderer, camera, lights, controls, animation loop.
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createTerrain, animateTerrain } from "./terrain.js";
import { createSky, animateStars } from "./sky.js";
import { createNorthPole } from "./northpole.js";
import { createWorkshop, animateWorkshop } from "./workshop.js";
import { createTrees, animateTrees, treeMeshes } from "./trees.js";
import { createCharacters } from "./characters.js";
import { createReindeer } from "./reindeer.js";
import { createProps, animateProps } from "./props.js";
import { createWeatherEffects, animateWeatherEffects } from "./snow.js";
import { setupInteraction, animateInteraction } from "./interaction.js";

// ── Renderer ────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
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
scene.background = new THREE.Color(0x0f2038); // Deep Atmospheric Night Sky
scene.fog = new THREE.FogExp2(0x0f2038, 0.007); // Softer fog for clearer, brighter diorama view

// ── Lights ──────────────────────────────────────────────────────────────────
// Ambient fill light for base clarity
const ambientLight = new THREE.AmbientLight(0x7090bb, 0.7);
scene.add(ambientLight);

// Hemisphere light for natural sky-down and snow-bounce upward fill
const hemiLight = new THREE.HemisphereLight(0xb0cce8, 0x445566, 0.5);
scene.add(hemiLight);

// Primary directional moonlight from upper-right with shadow casting
const moonLight = new THREE.DirectionalLight(0xdce6ff, 1.25);
moonLight.position.set(30, 45, 20);
moonLight.castShadow = true;
moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 130;
const d = 42;
moonLight.shadow.camera.left = -d;
moonLight.shadow.camera.right = d;
moonLight.shadow.camera.top = d;
moonLight.shadow.camera.bottom = -d;
moonLight.shadow.bias = -0.0006;
scene.add(moonLight);

// Secondary directional fill light from opposite angle to brighten shadowed sides
const fillLight = new THREE.DirectionalLight(0x8aa5cc, 0.45);
fillLight.position.set(-25, 25, -20);
scene.add(fillLight);

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
createWeatherEffects(scene);

// ── Enable shadows for world meshes ─────────────────────────────────────────
scene.traverse((obj) => {
  if (obj.isMesh) {
    if (obj.name === "ground" || obj.name === "riverWater") {
      obj.receiveShadow = true;
    } else if (!obj.userData.phases && obj.material?.type !== "MeshBasicMaterial") {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  }
});

// ── Interactive raycasting ──────────────────────────────────────────────────
setupInteraction(camera, scene, treeMeshes, renderer.domElement);

// ── Animation loop ──────────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Update orbit controls damping
  controls.update();

  // Animate modules
  animateTerrain(elapsed, delta);
  animateStars(elapsed);
  animateTrees(elapsed);
  animateWorkshop(elapsed, delta);
  animateProps(elapsed);
  animateWeatherEffects(elapsed, delta);
  animateInteraction(elapsed, delta, treeMeshes);

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
