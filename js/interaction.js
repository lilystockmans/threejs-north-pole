/**
 * interaction.js — User interaction via Raycasting.
 *
 * How it works (explainable to classmates):
 * 1. We listen for mouse moves and clicks on the canvas.
 * 2. We convert the 2D screen coordinates into normalized device coordinates (NDC: -1 to +1).
 * 3. A THREE.Raycaster shoots an invisible laser beam from the camera into the 3D world.
 * 4. If the laser hits any part of a Christmas tree:
 *    - On hover: we change the mouse cursor to a pointer.
 *    - On click: we toggle the tree's celebration mode (golden star, warm glow, bright sparkling lights).
 */

import * as THREE from "three";

// ── Raycasting state ─────────────────────────────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Store magic sparkle particles when trees are lit
const activeSparkles = [];

/**
 * Finds the root Christmas tree group given a clicked child mesh
 * @param {THREE.Object3D} object
 * @param {THREE.Group[]} treeList
 * @returns {THREE.Group|null}
 */
function findTreeRoot(object, treeList) {
  let curr = object;
  while (curr) {
    if (treeList.includes(curr)) {
      return curr;
    }
    curr = curr.parent;
  }
  return null;
}

/**
 * Spawns a small golden sparkle particle burst at the top of a tree
 * @param {THREE.Scene} scene
 * @param {THREE.Vector3} position
 */
function spawnSparkleBurst(scene, position) {
  const particleCount = 24;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;

    // Explode outward in random directions
    const angle = Math.random() * Math.PI * 2;
    const elevation = (Math.random() - 0.2) * Math.PI;
    const speed = 1.5 + Math.random() * 2.5;

    velocities.push(
      new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.sin(elevation) * speed + 1.0,
        Math.sin(angle) * Math.cos(elevation) * speed
      )
    );
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffea00,
    size: 0.35,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  activeSparkles.push({
    points,
    geometry,
    material,
    velocities,
    age: 0,
    maxAge: 1.2, // Live for 1.2 seconds
    scene,
  });
}

/**
 * Toggles a tree between normal and lit/magical mode
 * @param {THREE.Group} tree
 * @param {THREE.Scene} scene
 */
function toggleTreeLights(tree, scene) {
  const isLit = !tree.userData.isLit;
  tree.userData.isLit = isLit;

  if (isLit) {
    // 1. Add glowing golden tree-topper star
    if (!tree.userData.topperStar) {
      const starGeo = new THREE.OctahedronGeometry(0.35, 0);
      const starMat = new THREE.MeshBasicMaterial({
        color: 0xfff176, // Bright yellow
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(0, 5.3, 0); // At the very top of foliage
      tree.add(star);
      tree.userData.topperStar = star;
    }
    tree.userData.topperStar.visible = true;

    // 2. Add warm golden point light that illuminates the tree & ground
    if (!tree.userData.treeLight) {
      const treeLight = new THREE.PointLight(0xffd54f, 2.0, 14);
      treeLight.position.set(0, 5.2, 0);
      tree.add(treeLight);
      tree.userData.treeLight = treeLight;
    }
    tree.userData.treeLight.visible = true;

    // 3. Brighten all light spheres on this tree
    tree.traverse((child) => {
      if (child.isMesh && child.material && child.material.isMeshBasicMaterial) {
        if (child !== tree.userData.topperStar) {
          child.scale.setScalar(1.8); // Make light bulbs visibly larger & brighter
        }
      }
    });

    // 4. Sparkle particle burst!
    const worldPos = new THREE.Vector3();
    tree.getWorldPosition(worldPos);
    worldPos.y += 5.3 * tree.scale.y;
    spawnSparkleBurst(scene, worldPos);

    // 5. Update user-facing UI hint
    const hint = document.getElementById("hint");
    if (hint) {
      hint.textContent = "🌟 Tree lit up! Click again to turn off or click other trees!";
      hint.style.color = "#ffe082";
    }
  } else {
    // Turn off topper star and point light
    if (tree.userData.topperStar) {
      tree.userData.topperStar.visible = false;
    }
    if (tree.userData.treeLight) {
      tree.userData.treeLight.visible = false;
    }

    // Reset bulb sizes
    tree.traverse((child) => {
      if (child.isMesh && child.material && child.material.isMeshBasicMaterial) {
        if (child !== tree.userData.topperStar) {
          child.scale.setScalar(1.0);
        }
      }
    });

    const hint = document.getElementById("hint");
    if (hint) {
      hint.textContent = "✨ Click any tree to light it up!";
      hint.style.color = "#ffffff";
    }
  }
}

/**
 * Initializes raycasting interaction on the canvas
 * @param {THREE.Camera} camera
 * @param {THREE.Scene} scene
 * @param {THREE.Group[]} treeMeshes
 * @param {HTMLElement} domElement
 */
export function setupInteraction(camera, scene, treeMeshes, domElement) {
  let isPointerDown = false;
  let pointerDownPos = { x: 0, y: 0 };

  // Track hover to change mouse cursor
  domElement.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(treeMeshes, true);

    if (intersects.length > 0) {
      domElement.style.cursor = "pointer";
    } else {
      domElement.style.cursor = "default";
    }
  });

  // Distinguish clicks from drags (OrbitControls drags shouldn't trigger tree light toggle)
  domElement.addEventListener("pointerdown", (event) => {
    isPointerDown = true;
    pointerDownPos = { x: event.clientX, y: event.clientY };
  });

  domElement.addEventListener("pointerup", (event) => {
    if (!isPointerDown) return;
    isPointerDown = false;

    // If mouse moved more than 5px, user was dragging the camera — ignore click
    const dx = Math.abs(event.clientX - pointerDownPos.x);
    const dy = Math.abs(event.clientY - pointerDownPos.y);
    if (dx > 5 || dy > 5) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(treeMeshes, true);

    if (intersects.length > 0) {
      const clickedTree = findTreeRoot(intersects[0].object, treeMeshes);
      if (clickedTree) {
        toggleTreeLights(clickedTree, scene);
      }
    }
  });
}

/**
 * Animates topper stars and sparkle particles
 * @param {number} time
 * @param {number} delta
 * @param {THREE.Group[]} treeMeshes
 */
export function animateInteraction(time, delta, treeMeshes) {
  // Rotate active topper stars
  for (let i = 0; i < treeMeshes.length; i++) {
    const star = treeMeshes[i].userData.topperStar;
    if (star && star.visible) {
      star.rotation.y = time * 2.0;
      star.rotation.z = Math.sin(time * 3.0) * 0.2;
    }
  }

  // Update sparkle bursts
  for (let i = activeSparkles.length - 1; i >= 0; i--) {
    const s = activeSparkles[i];
    s.age += delta;

    if (s.age >= s.maxAge) {
      s.scene.remove(s.points);
      s.geometry.dispose();
      s.material.dispose();
      activeSparkles.splice(i, 1);
      continue;
    }

    const pos = s.geometry.attributes.position.array;
    const count = s.velocities.length;
    for (let j = 0; j < count; j++) {
      const j3 = j * 3;
      pos[j3] += s.velocities[j].x * delta;
      pos[j3 + 1] += s.velocities[j].y * delta;
      pos[j3 + 2] += s.velocities[j].z * delta;

      // Gravity pulls sparkles down gently
      s.velocities[j].y -= 2.5 * delta;
    }

    s.geometry.attributes.position.needsUpdate = true;
    s.material.opacity = 1.0 - s.age / s.maxAge;
  }
}
