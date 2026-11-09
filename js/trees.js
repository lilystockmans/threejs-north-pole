/**
 * trees.js — Low-poly Christmas trees with twinkling lights.
 */

import * as THREE from "three";
import { getTerrainHeight } from "./terrain.js";

/** Array of tree group meshes — exported for raycasting in later phases */
export const treeMeshes = [];

/** Internal array of all light spheres for the twinkle animation */
const lightSpheres = [];

/**
 * Tree positions around the scene: [x, z, scale]
 * Enlarged to grand coniferous scale (~1.8x - 2.5x) to frame Santa's workshop,
 * border the snowy hills, and cast dramatic low-poly shadows across the terrain.
 */
const treeData = [
  { x:  -2.0, z:  -5.5, scale: 1.85 }, // Near workshop pathway & snowman clearing
  { x: -10.0, z:   6.2, scale: 1.9  }, // South riverbank meadow
  { x:   9.5, z:  -3.5, scale: 1.8  }, // Clearing near snowman & campfire 1
  { x:  14.5, z:   0.0, scale: 2.1  }, // Grand pine framing eastern reindeer grounds
  { x: -21.0, z:  -6.0, scale: 2.3  }, // Northwest mountain foothills
  { x:  -3.0, z:  13.0, scale: 2.0  }, // South rolling hills
  { x:  16.5, z: -10.5, scale: 2.4  }, // Far northeast ridge giant pine
  { x:   4.5, z:  14.5, scale: 2.0  }, // Southeast hill overlook
  { x: -16.0, z:   9.0, scale: 2.1  }, // Southwest snowy ridge
  { x: -18.5, z: -13.0, scale: 2.5  }, // Towering workshop backdrop pine (west)
  { x:  20.0, z:  -5.0, scale: 2.2  }, // Far eastern perimeter pine
  { x:  -5.0, z: -16.0, scale: 2.3  }, // Workshop northern backdrop pine
];

/** Christmas light colors — vibrant festive palette */
const lightColors = [
  0xe74c3c, // Ruby Red
  0xf4d03f, // Golden Yellow
  0x3498db, // Arctic Ice Blue
  0x2ecc71, // Emerald Green
  0xe67e22, // Warm Orange
  0x9b59b6, // Sugar Plum Violet
  0xfffae6, // Warm White
];

/**
 * Creates a single low-poly Christmas tree with 3 foliage layers,
 * snow caps, a trunk, and twinkling light spheres.
 * @returns {THREE.Group} The tree group
 */
function buildTree() {
  const tree = new THREE.Group();

  // ── Trunk ──────────────────────────────────────────────────────────────
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.28, 1, 6);
  const trunkMat = new THREE.MeshLambertMaterial({
    color: 0x8b5e3c, // Warm Wood
    flatShading: true,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 0.5;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
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
    cone.castShadow = true;
    cone.receiveShadow = true;
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
    snowCap.castShadow = true;
    snowCap.receiveShadow = true;
    tree.add(snowCap);
  });

  // ── Twinkling light spheres on the tree surface ────────────────────────
  // More lights (12-16) to richly adorn the larger tree
  const lightsPerTree = 12 + Math.floor(Math.random() * 5);

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
    const coneRadius = layer.radius * t * 0.92;

    const x = Math.cos(angle) * coneRadius;
    const z = Math.sin(angle) * coneRadius;

    // Pick a random christmas light color
    const color = lightColors[Math.floor(Math.random() * lightColors.length)];

    const lightGeo = new THREE.SphereGeometry(0.065, 4, 4);
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
    const groundY = getTerrainHeight ? getTerrainHeight(data.x, data.z) : 0;
    tree.position.set(data.x, groundY, data.z);

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
