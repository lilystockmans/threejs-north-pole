/**
 * workshop.js — Santa's Workshop building made from primitives.
 */

import * as THREE from "three";

/**
 * Creates Santa's Workshop with main building, side wing,
 * pitched roofs with snow, windows, door, chimney, and sign.
 */
export function createWorkshop(scene) {
  // Group to hold the entire workshop complex
  const workshop = new THREE.Group();

  // ════════════════════════════════════════════════════════════════════════
  // MAIN BUILDING
  // ════════════════════════════════════════════════════════════════════════

  // ── Main body ──────────────────────────────────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(8, 5, 6);
  const bodyMat = new THREE.MeshLambertMaterial({
    color: 0x8b5e3c, // Warm Wood
    flatShading: true,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 2.5; // Half height so base sits on ground
  workshop.add(body);

  // ── Pitched roof (4-sided cone for A-frame look) ───────────────────────
  const roofGeo = new THREE.ConeGeometry(5.5, 3, 4);
  const roofMat = new THREE.MeshLambertMaterial({
    color: 0xc0392b, // Roof Red
    flatShading: true,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.y = 6.5; // Sits on top of the 5-tall body
  roof.rotation.y = Math.PI / 4; // Align edges with walls
  workshop.add(roof);

  // ── Snow layer on roof ─────────────────────────────────────────────────
  const snowRoofGeo = new THREE.ConeGeometry(5.7, 0.5, 4);
  const snowMat = new THREE.MeshLambertMaterial({
    color: 0xe8edf2, // Snow White
    flatShading: true,
  });
  const snowRoof = new THREE.Mesh(snowRoofGeo, snowMat);
  snowRoof.position.y = 7.8;
  snowRoof.rotation.y = Math.PI / 4;
  workshop.add(snowRoof);

  // ════════════════════════════════════════════════════════════════════════
  // SIDE WING (smaller attached building)
  // ════════════════════════════════════════════════════════════════════════

  // ── Wing body ──────────────────────────────────────────────────────────
  const wingGeo = new THREE.BoxGeometry(4, 4, 5);
  const wing = new THREE.Mesh(wingGeo, bodyMat);
  wing.position.set(6, 2, -0.5); // Attached to the right side
  workshop.add(wing);

  // ── Wing pitched roof ─────────────────────────────────────────────────
  const wingRoofGeo = new THREE.ConeGeometry(3.8, 2.5, 4);
  const wingRoof = new THREE.Mesh(wingRoofGeo, roofMat);
  wingRoof.position.set(6, 5.25, -0.5);
  wingRoof.rotation.y = Math.PI / 4;
  workshop.add(wingRoof);

  // ── Snow on wing roof ─────────────────────────────────────────────────
  const wingSnowGeo = new THREE.ConeGeometry(4.0, 0.4, 4);
  const wingSnow = new THREE.Mesh(wingSnowGeo, snowMat);
  wingSnow.position.set(6, 6.3, -0.5);
  wingSnow.rotation.y = Math.PI / 4;
  workshop.add(wingSnow);

  // ════════════════════════════════════════════════════════════════════════
  // WINDOWS (warm glowing rectangles on the walls)
  // ════════════════════════════════════════════════════════════════════════
  const windowMat = new THREE.MeshBasicMaterial({
    color: 0xf4d03f, // Warm Yellow — emits glow via MeshBasicMaterial
  });

  /** Helper: create a window and add it to the workshop group */
  function addWindow(x, y, z, rotY) {
    const winGeo = new THREE.BoxGeometry(0.8, 1, 0.05);
    const win = new THREE.Mesh(winGeo, windowMat);
    win.position.set(x, y, z);
    win.rotation.y = rotY || 0;
    workshop.add(win);
  }

  // Front windows (z = +3.01 face)
  addWindow(-2, 2.8, 3.01, 0);
  addWindow(0, 2.8, 3.01, 0);
  addWindow(2, 2.8, 3.01, 0);

  // Back window
  addWindow(-1, 2.8, -3.01, 0);
  addWindow(1, 2.8, -3.01, 0);

  // Wing front window
  addWindow(6, 2.5, 2.01, 0);

  // ════════════════════════════════════════════════════════════════════════
  // DOOR
  // ════════════════════════════════════════════════════════════════════════

  // ── Main door ──────────────────────────────────────────────────────────
  const doorGeo = new THREE.BoxGeometry(1.2, 2.2, 0.06);
  const doorMat = new THREE.MeshLambertMaterial({
    color: 0x5a3a1c, // Dark wood
    flatShading: true,
  });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 1.1, 3.03);
  workshop.add(door);

  // ── Porch overhang above door ──────────────────────────────────────────
  const porchGeo = new THREE.BoxGeometry(2, 0.15, 0.8);
  const porch = new THREE.Mesh(porchGeo, roofMat);
  porch.position.set(0, 2.5, 3.3);
  workshop.add(porch);

  // ── Snow on porch ─────────────────────────────────────────────────────
  const porchSnowGeo = new THREE.BoxGeometry(2.1, 0.1, 0.9);
  const porchSnow = new THREE.Mesh(porchSnowGeo, snowMat);
  porchSnow.position.set(0, 2.63, 3.3);
  workshop.add(porchSnow);

  // ════════════════════════════════════════════════════════════════════════
  // CHIMNEY
  // ════════════════════════════════════════════════════════════════════════

  // ── Chimney body ───────────────────────────────────────────────────────
  const chimGeo = new THREE.BoxGeometry(1, 2.5, 1);
  const chimMat = new THREE.MeshLambertMaterial({
    color: 0x8b5e3c, // Warm Wood
    flatShading: true,
  });
  const chimney = new THREE.Mesh(chimGeo, chimMat);
  chimney.position.set(-2.5, 7.5, -1);
  workshop.add(chimney);

  // ── Dark opening on top of chimney ─────────────────────────────────────
  const openGeo = new THREE.BoxGeometry(0.7, 0.1, 0.7);
  const openMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const opening = new THREE.Mesh(openGeo, openMat);
  opening.position.set(-2.5, 8.8, -1);
  workshop.add(opening);

  // ════════════════════════════════════════════════════════════════════════
  // SIGN — "SANTA'S WORKSHOP" (canvas texture)
  // ════════════════════════════════════════════════════════════════════════

  const signCanvas = document.createElement("canvas");
  signCanvas.width = 512;
  signCanvas.height = 96;
  const sctx = signCanvas.getContext("2d");

  // Background — roof red
  sctx.fillStyle = "#c0392b";
  sctx.fillRect(0, 0, signCanvas.width, signCanvas.height);

  // Text
  sctx.fillStyle = "#e8edf2";
  sctx.font = "bold 40px Arial, sans-serif";
  sctx.textAlign = "center";
  sctx.textBaseline = "middle";
  sctx.fillText("SANTA'S WORKSHOP", signCanvas.width / 2, signCanvas.height / 2);

  const signTexture = new THREE.CanvasTexture(signCanvas);
  const signPlaneGeo = new THREE.PlaneGeometry(3.5, 0.65);
  const signPlaneMat = new THREE.MeshBasicMaterial({
    map: signTexture,
  });

  // Sign above the door
  const signPlane = new THREE.Mesh(signPlaneGeo, signPlaneMat);
  signPlane.position.set(0, 3.8, 3.05);
  workshop.add(signPlane);

  // ── Position the entire workshop off-center ────────────────────────────
  workshop.position.set(-12, 0, -8);
  scene.add(workshop);

  return workshop;
}
