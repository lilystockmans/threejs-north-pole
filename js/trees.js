/**
 * trees.js — Low-poly Christmas trees with twinkling lights.
 */

import * as THREE from "three";

/** Array of tree group meshes — exported for raycasting in later phases */
export const treeMeshes = [];

/** Internal array of all light spheres for the twinkle animation */
const lightSpheres = [];

/**
 * Tree positions around the scene: [x, z, scale]
 * Some near the workshop, some scattered around.
 */
const treeData = [
  { x:  -6, z:  -4, scale: 1.2 },
  { x:  -8, z:   4, scale: 0.9 },
  { x:   7, z:  -6, scale: 1.0 },
  { x:  12, z:   3, scale: 1.3 },
  { x: -18, z:  -4, scale: 0.8 },
  { x:  -4, z:  10, scale: 1.1 },
  { x:  15, z: -10, scale: 0.7 },
  { x:   3, z:  12, scale: 1.0 },
  { x: -14, z:   8, scale: 0.85 },
];

/** Christmas light colors */
const lightColors = [0xe74c3c, 0xf4d03f, 0x3498db, 0x2ecc71, 0xe67e22];

/**
 * Creates a single low-poly Christmas tree with 3 foliage layers,
 * snow caps, a trunk, and twinkling light spheres.
 * @returns {THREE.Group} The tree group
 */
function buildTree() {
  const tree = new THREE.Group();

  // ── Trunk ──────────────────────────────────────────────────────────────
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.25, 1, 6);
  const trunkMat = new THREE.MeshLambertMaterial({
    color: 0x8b5e3c, // Warm Wood
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.5;
  tree.add(trunk);

  // ── Foliage layers (3 stacked cones, decreasing in size) ───────────────
  const layers = [
    { radius: 1.5, height: 2.0, y: 2.0, color: 0x2d5a3d },  // Bottom — Pine Green
    { radius: 1.2, height: 1.8, y: 3.3, color: 0x1a3a28 },  // Middle — Dark Pine
    { radius: 0.8, height: 1.5, y: 4.4, color: 0x2d5a3d },  // Top — Pine Green
  ];

  const coneMeshes = []; // Store cone references for light placement

  layers.forEach((layer) => {
    // Foliage cone
    const coneGeo = new THREE.ConeGeometry(layer.radius, layer.height, 7);
    const coneMat = new THREE.MeshLambertMaterial({
      color: layer.color,
      flatShading: true,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = layer.y;
    tree.add(cone);
    coneMeshes.push(cone);

    // Snow cap on top of each layer
    const snowCapGeo = new THREE.ConeGeometry(layer.radius * 0.35, 0.3, 7);
    const snowCapMat = new THREE.MeshLambertMaterial({
      color: 0xe8edf2, // Snow White
      flatShading: true,
    });
    const snowCap = new THREE.Mesh(snowCapGeo, snowCapMat);
    snowCap.position.y = layer.y + layer.height / 2 - 0.05;
    tree.add(snowCap);
  });

  // ── Twinkling light spheres on the tree surface ────────────────────────
  const lightsPerTree = 6 + Math.floor(Math.random() * 3); // 6-8 lights

  for (let i = 0; i < lightsPerTree; i++) {
    // Pick a random foliage layer to place the light on
    const layerIdx = Math.floor(Math.random() * layers.length);
    const layer = layers[layerIdx];

    // Random angle around the cone
    const angle = Math.random() * Math.PI * 2;

    // Random height within the cone (bias toward lower portion)
    const t = 0.2 + Math.random() * 0.6; // 20-80% from top
    const yPos = layer.y + (layer.height / 2) * (1 - 2 * t);

    // Cone radius at this height
    const coneRadius = layer.radius * t * 0.9;

    const x = Math.cos(angle) * coneRadius;
    const z = Math.sin(angle) * coneRadius;

    // Pick a random christmas light color
    const color = lightColors[Math.floor(Math.random() * lightColors.length)];

    const lightGeo = new THREE.SphereGeometry(0.06, 4, 4);
    const lightMat = new THREE.MeshBasicMaterial({
      color: color,
    });
    const lightMesh = new THREE.Mesh(lightGeo, lightMat);
    lightMesh.position.set(x, yPos, z);

    // Store animation data on the mesh
    lightMesh.userData.baseColor = new THREE.Color(color);
    lightMesh.userData.phase = Math.random() * Math.PI * 2;
    lightMesh.userData.speed = 1.5 + Math.random() * 2.5; // Varied twinkle speeds

    tree.add(lightMesh);
    lightSpheres.push(lightMesh);
  }

  return tree;
}

/**
 * Creates all Christmas trees and places them in the scene.
 */
export function createTrees(scene) {
  treeData.forEach((data) => {
    const tree = buildTree();
    tree.scale.setScalar(data.scale);
    tree.position.set(data.x, 0, data.z);

    // Slight random Y rotation for variety
    tree.rotation.y = Math.random() * Math.PI * 2;

    scene.add(tree);
    treeMeshes.push(tree);
  });
}

/**
 * Animates the twinkling lights on all trees.
 * Oscillates brightness of each light sphere at different rates.
 * @param {number} time — elapsed seconds from the clock
 */
export function animateTrees(time) {
  for (let i = 0; i < lightSpheres.length; i++) {
    const light = lightSpheres[i];
    const { baseColor, phase, speed } = light.userData;

    // Oscillate between dim (0.3) and full brightness (1.0)
    const wave = Math.sin(time * speed + phase);
    const intensity = 0.3 + 0.7 * (0.5 + 0.5 * wave);

    // Modulate the material color to simulate twinkling
    light.material.color.setRGB(
      baseColor.r * intensity,
      baseColor.g * intensity,
      baseColor.b * intensity
    );
  }
}
