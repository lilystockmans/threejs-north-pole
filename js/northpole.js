/**
 * northpole.js — The iconic red-and-white striped North Pole with sign and star.
 */

import * as THREE from "three";

/**
 * Creates the North Pole structure at the scene center:
 * striped pole, wooden sign with canvas text, and golden star on top.
 */
export function createNorthPole(scene) {
  // Group to hold all pole parts
  const poleGroup = new THREE.Group();

  // ── Striped pole — 10 alternating red/white cylinder segments ──────────
  const segmentCount = 10;
  const segmentHeight = 0.6; // Each segment is 0.6 tall → total 6 units
  const poleRadius = 0.2;

  for (let i = 0; i < segmentCount; i++) {
    const isRed = i % 2 === 0;
    const segGeo = new THREE.CylinderGeometry(
      poleRadius, poleRadius, segmentHeight, 8
    );
    const segMat = new THREE.MeshLambertMaterial({
      color: isRed ? 0xe74c3c : 0xe8edf2, // Candy Red / Snow White
      flatShading: true,
    });
    const seg = new THREE.Mesh(segGeo, segMat);

    // Stack segments from bottom to top
    seg.position.y = segmentHeight / 2 + i * segmentHeight;
    poleGroup.add(seg);
  }

  const totalPoleHeight = segmentCount * segmentHeight; // 6

  // ── Golden star on top ─────────────────────────────────────────────────
  const starGeo = new THREE.SphereGeometry(0.3, 8, 6);
  const starMat = new THREE.MeshPhongMaterial({
    color: 0xf4d03f,      // Warm Yellow
    emissive: 0xf4d03f,
    emissiveIntensity: 0.3,
    flatShading: true,
  });
  const star = new THREE.Mesh(starGeo, starMat);
  star.position.y = totalPoleHeight + 0.3;
  poleGroup.add(star);

  // Subtle golden glow point light from the star
  const starLight = new THREE.PointLight(0xf4d03f, 0.8, 8);
  starLight.position.y = totalPoleHeight + 0.5;
  poleGroup.add(starLight);

  // ── Horizontal arm for the sign ────────────────────────────────────────
  const armLength = 1.4;
  const armGeo = new THREE.CylinderGeometry(0.06, 0.06, armLength, 6);
  const armMat = new THREE.MeshLambertMaterial({
    color: 0x8b5e3c, // Warm Wood
    flatShading: true,
  });
  const arm = new THREE.Mesh(armGeo, armMat);
  // Rotate arm to be horizontal and position it near the top
  arm.rotation.z = Math.PI / 2;
  arm.position.set(armLength / 2, totalPoleHeight - 0.5, 0);
  poleGroup.add(arm);

  // ── Wooden sign board ──────────────────────────────────────────────────
  const signGeo = new THREE.BoxGeometry(2, 0.6, 0.1);
  const signMat = new THREE.MeshLambertMaterial({
    color: 0x8b5e3c, // Warm Wood
    flatShading: true,
  });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(armLength / 2 + 0.3, totalPoleHeight - 1.0, 0);
  poleGroup.add(sign);

  // ── Canvas texture with "NORTH POLE" text ──────────────────────────────
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext("2d");

  // Background — warm wood tone
  ctx.fillStyle = "#8b5e3c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text styling
  ctx.fillStyle = "#e8edf2";
  ctx.font = "bold 36px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NORTH POLE", canvas.width / 2, canvas.height / 2);

  const textTexture = new THREE.CanvasTexture(canvas);
  const textPlaneGeo = new THREE.PlaneGeometry(1.9, 0.55);
  const textPlaneMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
  });

  // Front face text
  const textPlaneFront = new THREE.Mesh(textPlaneGeo, textPlaneMat);
  textPlaneFront.position.set(armLength / 2 + 0.3, totalPoleHeight - 1.0, 0.06);
  poleGroup.add(textPlaneFront);

  // Back face text (mirrored)
  const textPlaneBack = new THREE.Mesh(textPlaneGeo, textPlaneMat.clone());
  textPlaneBack.position.set(armLength / 2 + 0.3, totalPoleHeight - 1.0, -0.06);
  textPlaneBack.rotation.y = Math.PI;
  poleGroup.add(textPlaneBack);

  // ── Place the whole group at scene center ──────────────────────────────
  poleGroup.position.set(0, 0, 0);
  scene.add(poleGroup);

  return poleGroup;
}
