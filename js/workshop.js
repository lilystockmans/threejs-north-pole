/**
 * workshop.js — Santa's Workshop & Toy Factory.
 * Highly detailed storybook factory modeled after classic North Pole architecture:
 * - Sage green half-timbered walls with dark wood trim and base skirting
 * - Steep snow-laden pitched roofs with organic sculpted snow blankets
 * - Grand candy-cane column entrance portico with timber truss & fanlight transom
 * - Storybook turret / castle watchtower with conical spire and stacked dormers
 * - Protruding multi-pane bay windows emitting cozy warm golden light
 * - Dual masonry chimneys with twin terracotta pots and animated rising smoke puffs
 * - Factory mechanics: rotating brass gearworks, steam exhaust pipes, and toy loading chute with gifts
 * - Row of candy-cane garden arches and iconic foreground snow-capped North Pole signpost
 */

import * as THREE from "three";

// ── Shared Materials ──────────────────────────────────────────────────────────
const wallMat = new THREE.MeshLambertMaterial({
  color: 0x678263, // Sage / Olive green plaster
  flatShading: true,
});

const wallTrimMat = new THREE.MeshLambertMaterial({
  color: 0x362114, // Dark chocolate timber framing & baseboard
  flatShading: true,
});

const timberDarkMat = new THREE.MeshLambertMaterial({
  color: 0x422a1b, // Rich dark wood
  flatShading: true,
});

const roofBaseMat = new THREE.MeshLambertMaterial({
  color: 0x2e1e14, // Deep wood-shingle roof base
  flatShading: true,
});

const snowMat = new THREE.MeshLambertMaterial({
  color: 0xe6f2fb, // Snow with soft arctic cyan-white tint
  flatShading: true,
});

const chimneyBrickMat = new THREE.MeshLambertMaterial({
  color: 0x3d4f3e, // Aged mossy masonry brick
  flatShading: true,
});

const terracottaMat = new THREE.MeshLambertMaterial({
  color: 0xb55734, // Terracotta chimney pots
  flatShading: true,
});

const brassMat = new THREE.MeshStandardMaterial({
  color: 0xd4af37, // Golden brass gearworks & finials
  roughness: 0.35,
  metalness: 0.75,
  flatShading: true,
});

const copperMat = new THREE.MeshStandardMaterial({
  color: 0xb87333, // Copper steam pipes
  roughness: 0.4,
  metalness: 0.65,
  flatShading: true,
});

// Emissive warm window materials for rich interior glow
const windowGlowMat = new THREE.MeshBasicMaterial({
  color: 0xffea85, // Bright cozy warm yellow
});

const windowInnerMat = new THREE.MeshBasicMaterial({
  color: 0xf39c12, // Deep amber backlight
});

// ── Global References for Animation ───────────────────────────────────────────
const animatedSmokePuffs = [];
const animatedGears = [];
let lanternLight = null;
let bayGlowLight = null;

// ── Helper: Procedural Candy Cane Spiral Texture ───────────────────────────────
let cachedCandyTexture = null;
function getCandyCaneTexture() {
  if (cachedCandyTexture) return cachedCandyTexture;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Crisp white background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Candy red diagonal stripes
  ctx.fillStyle = "#c0392b";
  const stripeWidth = 22;
  for (let x = -canvas.height; x < canvas.width + canvas.height; x += stripeWidth * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + stripeWidth, 0);
    ctx.lineTo(x + stripeWidth + canvas.height, canvas.height);
    ctx.lineTo(x + canvas.height, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  // Thin gold accent pinstripe for extra craftsmanship
  ctx.fillStyle = "#f39c12";
  for (let x = -canvas.height; x < canvas.width + canvas.height; x += stripeWidth * 2) {
    ctx.fillRect(x + stripeWidth + 2, 0, 3, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  cachedCandyTexture = texture;
  return texture;
}

// ── Helper: Create a Candy Cane Column ─────────────────────────────────────────
function createCandyCaneColumn(height, radius) {
  const group = new THREE.Group();

  // Spiral striped cylinder
  const caneMat = new THREE.MeshLambertMaterial({
    map: getCandyCaneTexture(),
    flatShading: true,
  });
  const colGeo = new THREE.CylinderGeometry(radius, radius, height, 16);
  const col = new THREE.Mesh(colGeo, caneMat);
  col.position.y = height / 2;
  group.add(col);

  // Dark timber base plinth
  const plinthGeo = new THREE.BoxGeometry(radius * 3, 0.25, radius * 3);
  const plinth = new THREE.Mesh(plinthGeo, timberDarkMat);
  plinth.position.y = 0.125;
  group.add(plinth);

  // Dark timber top capital
  const capGeo = new THREE.BoxGeometry(radius * 3.2, 0.25, radius * 3.2);
  const cap = new THREE.Mesh(capGeo, timberDarkMat);
  cap.position.y = height - 0.125;
  group.add(cap);

  return group;
}

// ── Helper: Multi-Pane Rectangular Window ─────────────────────────────────────
function createGridWindow(width, height, cols = 2, rows = 3) {
  const winGroup = new THREE.Group();

  // Outer dark timber frame
  const frameThickness = 0.08;
  const frameDepth = 0.12;

  // Glowing glass backing
  const glassGeo = new THREE.PlaneGeometry(width - frameThickness, height - frameThickness);
  const glass = new THREE.Mesh(glassGeo, windowGlowMat);
  glass.position.z = 0.02;
  winGroup.add(glass);

  // Outer frame borders
  const topBottomGeo = new THREE.BoxGeometry(width, frameThickness, frameDepth);
  const topFrame = new THREE.Mesh(topBottomGeo, timberDarkMat);
  topFrame.position.y = height / 2 - frameThickness / 2;
  winGroup.add(topFrame);

  const btmFrame = new THREE.Mesh(topBottomGeo, timberDarkMat);
  btmFrame.position.y = -height / 2 + frameThickness / 2;
  winGroup.add(btmFrame);

  const sideGeo = new THREE.BoxGeometry(frameThickness, height, frameDepth);
  const leftFrame = new THREE.Mesh(sideGeo, timberDarkMat);
  leftFrame.position.x = -width / 2 + frameThickness / 2;
  winGroup.add(leftFrame);

  const rightFrame = new THREE.Mesh(sideGeo, timberDarkMat);
  rightFrame.position.x = width / 2 - frameThickness / 2;
  winGroup.add(rightFrame);

  // Vertical mullion bars
  for (let c = 1; c < cols; c++) {
    const x = -width / 2 + (width / cols) * c;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.04, height - frameThickness * 2, 0.08), timberDarkMat);
    bar.position.set(x, 0, 0.03);
    winGroup.add(bar);
  }

  // Horizontal mullion bars
  for (let r = 1; r < rows; r++) {
    const y = -height / 2 + (height / rows) * r;
    const bar = new THREE.Mesh(new THREE.BoxGeometry(width - frameThickness * 2, 0.04, 0.08), timberDarkMat);
    bar.position.set(0, y, 0.03);
    winGroup.add(bar);
  }

  // Window sill
  const sillGeo = new THREE.BoxGeometry(width + 0.16, 0.1, frameDepth + 0.12);
  const sill = new THREE.Mesh(sillGeo, timberDarkMat);
  sill.position.set(0, -height / 2, 0.06);
  winGroup.add(sill);

  // Mini snow drift on sill
  const sillSnowGeo = new THREE.BoxGeometry(width + 0.14, 0.06, frameDepth + 0.1);
  const sillSnow = new THREE.Mesh(sillSnowGeo, snowMat);
  sillSnow.position.set(0, -height / 2 + 0.07, 0.06);
  winGroup.add(sillSnow);

  return winGroup;
}

// ── Helper: Round Circular Attic Window with 4 Panes ──────────────────────────
function createRoundAtticWindow(radius = 0.75) {
  const roundWin = new THREE.Group();

  // Glowing circular back
  const circleGeo = new THREE.CircleGeometry(radius, 24);
  const circle = new THREE.Mesh(circleGeo, windowGlowMat);
  circle.position.z = 0.02;
  roundWin.add(circle);

  // Outer circular wooden ring
  const ringGeo = new THREE.RingGeometry(radius - 0.09, radius + 0.08, 24);
  const ring = new THREE.Mesh(ringGeo, timberDarkMat);
  ring.position.z = 0.04;
  roundWin.add(ring);

  // Cross mullions (vertical and horizontal timber bars)
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, radius * 2, 0.08), timberDarkMat);
  crossV.position.z = 0.05;
  roundWin.add(crossV);

  const crossH = new THREE.Mesh(new THREE.BoxGeometry(radius * 2, 0.08, 0.08), timberDarkMat);
  crossH.position.z = 0.05;
  roundWin.add(crossH);

  // Snow cap resting on upper curve of circular window
  const snowArchGeo = new THREE.TorusGeometry(radius + 0.05, 0.07, 6, 16, Math.PI);
  const snowArch = new THREE.Mesh(snowArchGeo, snowMat);
  snowArch.position.set(0, 0, 0.06);
  roundWin.add(snowArch);

  return roundWin;
}

// ── Helper: 3D Protruding Faceted Bay Window ──────────────────────────────────
function createBayWindow(width = 2.6, height = 1.8, depth = 0.8) {
  const bay = new THREE.Group();

  // Bottom timber base support brackets
  const baseGeo = new THREE.BoxGeometry(width, 0.25, depth);
  const base = new THREE.Mesh(baseGeo, timberDarkMat);
  base.position.set(0, -height / 2 - 0.125, depth / 2);
  bay.add(base);

  // Angled underside brackets
  for (let s of [-1, 1]) {
    const bracketGeo = new THREE.BoxGeometry(0.12, 0.5, 0.5);
    const bracket = new THREE.Mesh(bracketGeo, timberDarkMat);
    bracket.position.set(s * (width * 0.35), -height / 2 - 0.35, depth * 0.4);
    bracket.rotation.x = Math.PI / 4;
    bay.add(bracket);
  }

  // Front center multi-pane window
  const frontWin = createGridWindow(width * 0.65, height, 3, 3);
  frontWin.position.set(0, 0, depth);
  bay.add(frontWin);

  // Left angled wing window
  const sideW = depth * 0.95;
  const leftSideWin = createGridWindow(sideW, height, 1, 3);
  leftSideWin.position.set(-width * 0.325 - sideW * 0.35, 0, depth * 0.5);
  leftSideWin.rotation.y = Math.PI / 4;
  bay.add(leftSideWin);

  // Right angled wing window
  const rightSideWin = createGridWindow(sideW, height, 1, 3);
  rightSideWin.position.set(width * 0.325 + sideW * 0.35, 0, depth * 0.5);
  rightSideWin.rotation.y = -Math.PI / 4;
  bay.add(rightSideWin);

  // Bay Window Roof Canopy (Dark timber awning)
  const roofW = width + 0.45;
  const roofD = depth + 0.35;
  const awningGeo = new THREE.BoxGeometry(roofW, 0.12, roofD);
  const awning = new THREE.Mesh(awningGeo, timberDarkMat);
  awning.position.set(0, height / 2 + 0.06, depth / 2 + 0.05);
  bay.add(awning);

  // Thick curved snow cushion atop the awning
  const snowAwningGeo = new THREE.BoxGeometry(roofW + 0.15, 0.28, roofD + 0.12);
  const snowAwning = new THREE.Mesh(snowAwningGeo, snowMat);
  snowAwning.position.set(0, height / 2 + 0.22, depth / 2 + 0.08);
  bay.add(snowAwning);

  // Drooping snow lip on front edge
  const lipGeo = new THREE.CylinderGeometry(0.14, 0.14, roofW + 0.14, 8);
  const lip = new THREE.Mesh(lipGeo, snowMat);
  lip.rotation.z = Math.PI / 2;
  lip.position.set(0, height / 2 + 0.12, depth + 0.18);
  bay.add(lip);

  return bay;
}

// ── Helper: Roof Dormer with Pitched Snow Cap ─────────────────────────────────
function createRoofDormer(width = 1.0, height = 1.2, depth = 1.2) {
  const dormer = new THREE.Group();

  // Dormer wall box
  const wallGeo = new THREE.BoxGeometry(width, height, depth);
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.position.set(0, height / 2, depth / 2);
  dormer.add(wall);

  // Timber corner trim
  for (let s of [-1, 1]) {
    const postGeo = new THREE.BoxGeometry(0.08, height, 0.08);
    const post = new THREE.Mesh(postGeo, timberDarkMat);
    post.position.set(s * (width / 2 - 0.04), height / 2, depth - 0.04);
    dormer.add(post);
  }

  // Front glowing arched or gridded window
  const win = createGridWindow(width * 0.75, height * 0.7, 2, 2);
  win.position.set(0, height * 0.48, depth + 0.02);
  dormer.add(win);

  // Pitched dormer roof
  const roofHeight = 0.65;
  const roofGeo = new THREE.ConeGeometry(width * 0.85, roofHeight, 4);
  const roof = new THREE.Mesh(roofGeo, timberDarkMat);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(0, height + roofHeight * 0.4, depth / 2);
  roof.scale.set(1.2, 1, depth / width);
  dormer.add(roof);

  // Thick snow cap on dormer
  const snowDormerGeo = new THREE.ConeGeometry(width * 0.95, roofHeight * 0.75, 4);
  const snowDormer = new THREE.Mesh(snowDormerGeo, snowMat);
  snowDormer.rotation.y = Math.PI / 4;
  snowDormer.position.set(0, height + roofHeight * 0.65, depth / 2);
  snowDormer.scale.set(1.22, 1, depth / width);
  dormer.add(snowDormer);

  return dormer;
}

// ── Helper: Masonry Chimney with Terracotta Pots & Animated Smoke ─────────────
function createChimney(width = 1.3, depth = 1.3, height = 3.6) {
  const chimGroup = new THREE.Group();

  // Chimney main brick column
  const chimGeo = new THREE.BoxGeometry(width, height, depth);
  const chim = new THREE.Mesh(chimGeo, chimneyBrickMat);
  chim.position.y = height / 2;
  chimGroup.add(chim);

  // Decorative corbelled stone cap
  const rimGeo = new THREE.BoxGeometry(width + 0.25, 0.35, depth + 0.25);
  const rim = new THREE.Mesh(rimGeo, timberDarkMat);
  rim.position.y = height + 0.175;
  chimGroup.add(rim);

  // Snow accumulation around chimney crown
  const chimSnowGeo = new THREE.BoxGeometry(width + 0.3, 0.18, depth + 0.3);
  const chimSnow = new THREE.Mesh(chimSnowGeo, snowMat);
  chimSnow.position.y = height + 0.36;
  chimGroup.add(chimSnow);

  // Twin Terracotta Chimney Pots
  const potRadius = 0.18;
  const potHeight = 0.8;
  const potPositions = [-0.3, 0.3];

  potPositions.forEach((offsetX) => {
    // Cylindrical pot body
    const potGeo = new THREE.CylinderGeometry(potRadius * 0.9, potRadius, potHeight, 12);
    const pot = new THREE.Mesh(potGeo, terracottaMat);
    pot.position.set(offsetX, height + 0.45 + potHeight / 2, 0);
    chimGroup.add(pot);

    // Rim on top of pot
    const potRimGeo = new THREE.TorusGeometry(potRadius * 0.95, 0.04, 6, 12);
    const potRim = new THREE.Mesh(potRimGeo, terracottaMat);
    potRim.rotation.x = Math.PI / 2;
    potRim.position.set(offsetX, height + 0.45 + potHeight, 0);
    chimGroup.add(potRim);

    // Dark soot interior
    const sootGeo = new THREE.CircleGeometry(potRadius * 0.85, 12);
    const sootMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const soot = new THREE.Mesh(sootGeo, sootMat);
    soot.rotation.x = -Math.PI / 2;
    soot.position.set(offsetX, height + 0.45 + potHeight - 0.02, 0);
    chimGroup.add(soot);
  });

  // Animated Smoke Particle System (Puffs rising and drifting)
  const smokeCount = 10;
  for (let i = 0; i < smokeCount; i++) {
    const puffGeo = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.15, 1);
    const puffMat = new THREE.MeshLambertMaterial({
      color: 0xecf0f1,
      transparent: true,
      opacity: 0.6,
      flatShading: true,
    });
    const puff = new THREE.Mesh(puffGeo, puffMat);

    // Initialize state on mesh
    puff.userData = {
      baseY: height + 1.2,
      progress: i / smokeCount,
      speed: 0.28 + Math.random() * 0.15,
      driftAngle: Math.random() * Math.PI * 2,
      driftDist: 0.3 + Math.random() * 0.5,
      maxScale: 2.2 + Math.random() * 1.0,
      potOffset: potPositions[i % 2],
    };

    puff.position.set(puff.userData.potOffset, puff.userData.baseY, 0);
    chimGroup.add(puff);
    animatedSmokePuffs.push(puff);
  }

  return chimGroup;
}

// ── Helper: Decorative Factory Gear (Steampunk Toyworks) ──────────────────────
function createFactoryGear(radius = 0.9, teeth = 8, color = 0xd4af37) {
  const gear = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.4,
    metalness: 0.7,
    flatShading: true,
  });

  // Central hub
  const hubGeo = new THREE.CylinderGeometry(radius * 0.8, radius * 0.8, 0.12, 16);
  const hub = new THREE.Mesh(hubGeo, bodyMat);
  hub.rotation.x = Math.PI / 2;
  gear.add(hub);

  // Center axle pin
  const pinGeo = new THREE.CylinderGeometry(radius * 0.25, radius * 0.25, 0.2, 12);
  const pinMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
  const pin = new THREE.Mesh(pinGeo, pinMat);
  pin.rotation.x = Math.PI / 2;
  gear.add(pin);

  // Outer cogs/teeth
  const toothW = (radius * 2 * Math.PI) / (teeth * 3);
  const toothH = radius * 0.28;
  const toothD = 0.12;

  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const toothGeo = new THREE.BoxGeometry(toothW, toothH, toothD);
    const tooth = new THREE.Mesh(toothGeo, bodyMat);
    tooth.position.set(
      Math.cos(angle) * (radius * 0.9),
      Math.sin(angle) * (radius * 0.9),
      0
    );
    tooth.rotation.z = angle + Math.PI / 2;
    gear.add(tooth);
  }

  return gear;
}

// ── Helper: Steam Pipes with Pressure Valve ───────────────────────────────────
function createSteamPipes() {
  const pipeGroup = new THREE.Group();

  // Vertical main exhaust conduit
  const mainPipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.2, 10);
  const mainPipe = new THREE.Mesh(mainPipeGeo, copperMat);
  mainPipe.position.set(0, 2.1, 0);
  pipeGroup.add(mainPipe);

  // Horizontal junction pipe
  const horizGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.8, 8);
  const horiz = new THREE.Mesh(horizGeo, copperMat);
  horiz.rotation.z = Math.PI / 2;
  horiz.position.set(-0.9, 3.2, 0);
  pipeGroup.add(horiz);

  // 90-degree elbow joint
  const elbowGeo = new THREE.SphereGeometry(0.14, 8, 8);
  const elbow = new THREE.Mesh(elbowGeo, brassMat);
  elbow.position.set(0, 3.2, 0);
  pipeGroup.add(elbow);

  // Round pressure gauge dial
  const gaugeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16);
  const gaugeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const gauge = new THREE.Mesh(gaugeGeo, gaugeMat);
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(-0.6, 3.2, 0.12);
  pipeGroup.add(gauge);

  const needleGeo = new THREE.BoxGeometry(0.03, 0.14, 0.02);
  const needleMat = new THREE.MeshBasicMaterial({ color: 0xd32f2f });
  const needle = new THREE.Mesh(needleGeo, needleMat);
  needle.position.set(-0.6, 3.2, 0.17);
  needle.rotation.z = Math.PI / 3;
  pipeGroup.add(needle);

  return pipeGroup;
}

// ── Helper: Toy Conveyor Chute with Wrapped Gifts ──────────────────────────────
function createToyDeliveryChute() {
  const chuteGroup = new THREE.Group();

  // Slanted wooden slide chute
  const chuteLength = 3.6;
  const slideGeo = new THREE.BoxGeometry(1.0, 0.1, chuteLength);
  const slide = new THREE.Mesh(slideGeo, timberDarkMat);
  slide.rotation.x = 0.55; // Angle downward
  slide.position.set(0, 1.8, 1.4);
  chuteGroup.add(slide);

  // Side guide rails
  for (let s of [-1, 1]) {
    const railGeo = new THREE.BoxGeometry(0.08, 0.28, chuteLength);
    const rail = new THREE.Mesh(railGeo, brassMat);
    rail.rotation.x = 0.55;
    rail.position.set(s * 0.46, 1.9, 1.4);
    chuteGroup.add(rail);
  }

  // Wooden receiving crate at base of chute
  const crateGeo = new THREE.BoxGeometry(1.3, 0.7, 1.3);
  const crate = new THREE.Mesh(crateGeo, timberDarkMat);
  crate.position.set(0, 0.35, 2.9);
  chuteGroup.add(crate);

  // Wrapped gift boxes in transit down the chute and in crate
  const giftColors = [0xc0392b, 0x27ae60, 0x2980b9, 0xf39c12, 0x8e44ad];
  const giftPositions = [
    { x: -0.1, y: 2.4, z: 0.6, size: 0.36, c: 0 },
    { x: 0.12, y: 1.6, z: 1.5, size: 0.32, c: 1 },
    { x: -0.05, y: 0.9, z: 2.3, size: 0.38, c: 2 },
    { x: 0.15, y: 0.8, z: 2.8, size: 0.42, c: 3 },
    { x: -0.2, y: 0.85, z: 3.1, size: 0.35, c: 4 },
  ];

  giftPositions.forEach((gp) => {
    const boxGeo = new THREE.BoxGeometry(gp.size, gp.size, gp.size);
    const boxMat = new THREE.MeshLambertMaterial({
      color: giftColors[gp.c],
      flatShading: true,
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(gp.x, gp.y, gp.z);
    box.rotation.y = Math.random() * 0.6;
    chuteGroup.add(box);

    // Contrasting ribbon cross
    const ribGeo = new THREE.BoxGeometry(gp.size + 0.02, gp.size + 0.02, 0.06);
    const ribMat = new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true });
    const rib1 = new THREE.Mesh(ribGeo, ribMat);
    rib1.position.set(gp.x, gp.y, gp.z);
    chuteGroup.add(rib1);
  });

  return chuteGroup;
}

// ── Helper: Front Courtyard Candy Cane Arches (Wickets) ───────────────────────
function createCandyCaneArches() {
  const archesGroup = new THREE.Group();

  // Create an inverted U-curve path
  const curve = new THREE.CurvePath();
  const radius = 0.28;
  const legHeight = 0.8;

  // Candy cane arches spacing along the front snowbank
  const archCount = 6;
  const archSpacing = 1.35;

  const archMat = new THREE.MeshLambertMaterial({
    map: getCandyCaneTexture(),
    flatShading: true,
  });

  for (let i = 0; i < archCount; i++) {
    const singleArch = new THREE.Group();

    // Left vertical stem
    const stemGeo = new THREE.CylinderGeometry(0.05, 0.05, legHeight, 10);
    const leftStem = new THREE.Mesh(stemGeo, archMat);
    leftStem.position.set(-radius, legHeight / 2, 0);
    singleArch.add(leftStem);

    // Right vertical stem
    const rightStem = new THREE.Mesh(stemGeo, archMat);
    rightStem.position.set(radius, legHeight / 2, 0);
    singleArch.add(rightStem);

    // Top curved half-torus arch
    const archTopGeo = new THREE.TorusGeometry(radius, 0.05, 8, 16, Math.PI);
    const archTop = new THREE.Mesh(archTopGeo, archMat);
    archTop.position.set(0, legHeight, 0);
    singleArch.add(archTop);

    // Position along the front garden border
    singleArch.position.set(-4.0 + i * archSpacing, 0, 4.3);
    archesGroup.add(singleArch);
  }

  return archesGroup;
}

// ── Helper: Foreground North Pole Signpost with Snow & Glowing Globe ───────────
function createNorthPoleSignpost() {
  const signGroup = new THREE.Group();

  // Thick spiral candy cane post
  const postHeight = 3.6;
  const postRadius = 0.28;
  const post = createCandyCaneColumn(postHeight, postRadius);
  signGroup.add(post);

  // Glowing spherical globe finial on top (like the photo)
  const globeGeo = new THREE.SphereGeometry(0.45, 16, 16);
  const globeMat = new THREE.MeshPhongMaterial({
    color: 0xfff4d0,
    emissive: 0xffd166,
    emissiveIntensity: 0.6,
    shininess: 90,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  globe.position.y = postHeight + 0.45;
  signGroup.add(globe);

  // Soft glow light from the globe
  const globeLight = new THREE.PointLight(0xffe082, 1.2, 8);
  globeLight.position.set(0, postHeight + 0.5, 0);
  signGroup.add(globeLight);

  // Sign Board: Canvas texture with rustic hand-lettered text
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Aged warm winter wood plank background
  ctx.fillStyle = "#e0d3bc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Wood grain strokes
  ctx.strokeStyle = "#cbb99f";
  ctx.lineWidth = 4;
  for (let i = 0; i < 16; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 16 + Math.random() * 8);
    ctx.bezierCurveTo(170, i * 16 + 10, 340, i * 16 - 10, 512, i * 16 + 5);
    ctx.stroke();
  }

  // Dark timber border
  ctx.lineWidth = 12;
  ctx.strokeStyle = "#4a3222";
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Calligraphic script text matching reference image ("North Pole")
  ctx.fillStyle = "#261a12";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "italic bold 64px 'Brush Script MT', 'Palatino', cursive, serif";
  ctx.fillText("North", canvas.width / 2, 85);
  ctx.fillText("Pole", canvas.width / 2, 165);

  const signTex = new THREE.CanvasTexture(canvas);
  const boardGeo = new THREE.BoxGeometry(2.6, 1.3, 0.15);
  const boardMat = new THREE.MeshLambertMaterial({ map: signTex, flatShading: true });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0.6, postHeight - 1.2, 0.35);
  board.rotation.z = -0.06; // Whimsical jaunty angle
  signGroup.add(board);

  // Heavy sculpted snow blanket draped over the sign board
  const snowCapGeo = new THREE.BoxGeometry(2.8, 0.35, 0.35);
  const snowCap = new THREE.Mesh(snowCapGeo, snowMat);
  snowCap.position.set(0.6, postHeight - 0.5, 0.35);
  snowCap.rotation.z = -0.06;
  signGroup.add(snowCap);

  return signGroup;
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT: createWorkshop(scene)
// ══════════════════════════════════════════════════════════════════════════════

export function createWorkshop(scene) {
  // Clear any previous references
  animatedSmokePuffs.length = 0;
  animatedGears.length = 0;

  // Master Workshop Complex Group
  const workshop = new THREE.Group();

  // ════════════════════════════════════════════════════════════════════════════
  // 1. LEFT GABLED WING (Toymaker's Bavarian Alpine Hall)
  // ════════════════════════════════════════════════════════════════════════════
  const leftWing = new THREE.Group();
  leftWing.position.set(-6.5, 0, 0);

  const lWidth = 6.2;
  const lDepth = 7.0;
  const lWallHeight = 4.8;

  // Wall box
  const lBodyGeo = new THREE.BoxGeometry(lWidth, lWallHeight, lDepth);
  const lBody = new THREE.Mesh(lBodyGeo, wallMat);
  lBody.position.y = lWallHeight / 2;
  leftWing.add(lBody);

  // Dark timber base skirting (foundation plinth)
  const lBaseGeo = new THREE.BoxGeometry(lWidth + 0.15, 0.65, lDepth + 0.15);
  const lBase = new THREE.Mesh(lBaseGeo, wallTrimMat);
  lBase.position.y = 0.325;
  leftWing.add(lBase);

  // Gable peak wall (Triangular front facade filling up the A-frame roof)
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-lWidth / 2, 0);
  gableShape.lineTo(lWidth / 2, 0);
  gableShape.lineTo(0, 4.0);
  gableShape.closePath();

  const gableExtrude = new THREE.ExtrudeGeometry(gableShape, {
    depth: lDepth,
    bevelEnabled: false,
  });
  const gableWall = new THREE.Mesh(gableExtrude, wallMat);
  // Center the extrude along Z
  gableWall.position.set(0, lWallHeight, -lDepth / 2);
  leftWing.add(gableWall);

  // Steep pitched A-frame roof with eaves
  const roofThickness = 0.35;
  const roofSlopeLen = Math.sqrt(Math.pow(lWidth / 2 + 0.9, 2) + Math.pow(4.0 + 0.4, 2));
  const roofSlopeAngle = Math.atan2(4.4, lWidth / 2 + 0.9);

  // Left & right roof slopes
  for (let s of [-1, 1]) {
    // Dark timber roof deck
    const slopeGeo = new THREE.BoxGeometry(roofSlopeLen, roofThickness, lDepth + 1.2);
    const slope = new THREE.Mesh(slopeGeo, roofBaseMat);
    slope.rotation.z = s * -roofSlopeAngle;
    slope.position.set(s * (lWidth / 4 + 0.4), lWallHeight + 2.1, 0);
    leftWing.add(slope);

    // Thick sculpted snow mantle on roof
    const snowSlopeGeo = new THREE.BoxGeometry(roofSlopeLen + 0.1, 0.45, lDepth + 1.35);
    const snowSlope = new THREE.Mesh(snowSlopeGeo, snowMat);
    snowSlope.rotation.z = s * -roofSlopeAngle;
    snowSlope.position.set(s * (lWidth / 4 + 0.4), lWallHeight + 2.35, 0);
    leftWing.add(snowSlope);

    // Drooping rounded snow eaves at the roof edge
    const dripGeo = new THREE.CylinderGeometry(0.22, 0.22, lDepth + 1.35, 10);
    const drip = new THREE.Mesh(dripGeo, snowMat);
    drip.rotation.x = Math.PI / 2;
    drip.position.set(s * (lWidth / 2 + 0.8), lWallHeight + 0.1, 0);
    leftWing.add(drip);
  }

  // Snow ridge cap along roof peak
  const ridgeGeo = new THREE.BoxGeometry(0.5, 0.4, lDepth + 1.4);
  const ridge = new THREE.Mesh(ridgeGeo, snowMat);
  ridge.position.set(0, lWallHeight + 4.25, 0);
  leftWing.add(ridge);

  // ── Half-Timbering Framing on Left Gable (Tudor motif from image) ─────────
  const frontZ = lDepth / 2 + 0.05;

  // Central vertical timber beam
  const vBeam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.0, 0.1), timberDarkMat);
  vBeam.position.set(0, lWallHeight + 1.9, frontZ);
  leftWing.add(vBeam);

  // Symmetrical diagonal timber struts forming a V-brace
  for (let s of [-1, 1]) {
    const dBeam = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 0.1), timberDarkMat);
    dBeam.position.set(s * 1.3, lWallHeight + 1.4, frontZ);
    dBeam.rotation.z = s * 0.72;
    leftWing.add(dBeam);
  }

  // Circular divided attic window in gable peak
  const roundWin = createRoundAtticWindow(0.85);
  roundWin.position.set(0, lWallHeight + 2.1, frontZ + 0.02);
  leftWing.add(roundWin);

  // Protruding 3D faceted Bay Window on ground floor front
  const lBayWin = createBayWindow(2.8, 1.8, 0.85);
  lBayWin.position.set(0, 1.9, lDepth / 2);
  leftWing.add(lBayWin);

  // Side Roof Dormer Window on left slope
  const sideDormer = createRoofDormer(1.1, 1.3, 1.3);
  sideDormer.rotation.y = -Math.PI / 2;
  sideDormer.position.set(-lWidth / 2 - 0.2, lWallHeight + 0.6, 0.8);
  leftWing.add(sideDormer);

  // Left Chimney (Mossy masonry stone with twin terracotta pots)
  const leftChimney = createChimney(1.4, 1.4, 4.2);
  leftChimney.position.set(-1.8, lWallHeight + 2.0, -1.2);
  leftWing.add(leftChimney);

  // Side ground floor window on outer wall
  const lSideWin = createGridWindow(1.0, 1.4, 2, 3);
  lSideWin.rotation.y = -Math.PI / 2;
  lSideWin.position.set(-lWidth / 2 - 0.02, 2.2, -1.0);
  leftWing.add(lSideWin);

  workshop.add(leftWing);

  // ════════════════════════════════════════════════════════════════════════════
  // 2. CENTER ENTRANCE PORTICO (The Grand Candy-Cane Entrance Portal)
  // ════════════════════════════════════════════════════════════════════════════
  const centerWing = new THREE.Group();
  centerWing.position.set(-1.2, 0, 0.4);

  const cWidth = 4.8;
  const cDepth = 5.2;
  const cHeight = 4.2;

  // Recessed center wall
  const cBodyGeo = new THREE.BoxGeometry(cWidth, cHeight, cDepth);
  const cBody = new THREE.Mesh(cBodyGeo, wallMat);
  cBody.position.y = cHeight / 2;
  centerWing.add(cBody);

  // Base plinth
  const cBaseGeo = new THREE.BoxGeometry(cWidth + 0.15, 0.65, cDepth + 0.15);
  const cBase = new THREE.Mesh(cBaseGeo, wallTrimMat);
  cBase.position.y = 0.325;
  centerWing.add(cBase);

  // Grand Portico Gable Porch extending forward
  const porchW = 3.6;
  const porchD = 2.4;
  const porchColHeight = 3.2;

  // Two candy-cane spiral striped entrance columns
  const colLeft = createCandyCaneColumn(porchColHeight, 0.22);
  colLeft.position.set(-porchW / 2 + 0.3, 0, cDepth / 2 + porchD - 0.3);
  centerWing.add(colLeft);

  const colRight = createCandyCaneColumn(porchColHeight, 0.22);
  colRight.position.set(porchW / 2 - 0.3, 0, cDepth / 2 + porchD - 0.3);
  centerWing.add(colRight);

  // Porch Gable Roof (Steep pitched triangle over entrance)
  const pRoofLen = Math.sqrt(Math.pow(porchW / 2 + 0.4, 2) + Math.pow(2.0, 2));
  const pAngle = Math.atan2(2.0, porchW / 2 + 0.4);

  for (let s of [-1, 1]) {
    const pSlopeGeo = new THREE.BoxGeometry(pRoofLen, 0.22, porchD + 0.4);
    const pSlope = new THREE.Mesh(pSlopeGeo, roofBaseMat);
    pSlope.rotation.z = s * -pAngle;
    pSlope.position.set(
      s * (porchW / 4 + 0.15),
      porchColHeight + 0.9,
      cDepth / 2 + porchD / 2
    );
    centerWing.add(pSlope);

    // Thick snow on porch roof
    const pSnowGeo = new THREE.BoxGeometry(pRoofLen + 0.08, 0.35, porchD + 0.55);
    const pSnow = new THREE.Mesh(pSnowGeo, snowMat);
    pSnow.rotation.z = s * -pAngle;
    pSnow.position.set(
      s * (porchW / 4 + 0.15),
      porchColHeight + 1.12,
      cDepth / 2 + porchD / 2
    );
    centerWing.add(pSnow);
  }

  // Timber truss in porch gable (King post & diagonal struts)
  const porchFrontZ = cDepth / 2 + porchD + 0.15;
  const trussKing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.8, 0.1), timberDarkMat);
  trussKing.position.set(0, porchColHeight + 0.9, porchFrontZ);
  centerWing.add(trussKing);

  const trussTie = new THREE.Mesh(new THREE.BoxGeometry(porchW, 0.18, 0.12), timberDarkMat);
  trussTie.position.set(0, porchColHeight, porchFrontZ);
  centerWing.add(trussTie);

  for (let s of [-1, 1]) {
    const trussStrut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.1), timberDarkMat);
    trussStrut.position.set(s * 0.8, porchColHeight + 0.55, porchFrontZ);
    trussStrut.rotation.z = s * 0.7;
    centerWing.add(trussStrut);
  }

  // Main Entrance Door (Double wood panels, arched transom fanlight)
  const doorWidth = 1.6;
  const doorHeight = 2.4;
  const doorZ = cDepth / 2 + 0.06;

  // Door leaf
  const doorLeafGeo = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
  const doorLeaf = new THREE.Mesh(doorLeafGeo, timberDarkMat);
  doorLeaf.position.set(0, doorHeight / 2, doorZ);
  centerWing.add(doorLeaf);

  // Arched Fanlight Transom above door (glowing warm rays)
  const fanGeo = new THREE.CircleGeometry(doorWidth / 2, 16, 0, Math.PI);
  const fan = new THREE.Mesh(fanGeo, windowGlowMat);
  fan.position.set(0, doorHeight + 0.02, doorZ + 0.02);
  centerWing.add(fan);

  // Fanlight wooden rim & radiating spoke dividers
  const fanRimGeo = new THREE.RingGeometry(doorWidth / 2 - 0.06, doorWidth / 2 + 0.06, 16, 1, 0, Math.PI);
  const fanRim = new THREE.Mesh(fanRimGeo, timberDarkMat);
  fanRim.position.set(0, doorHeight + 0.02, doorZ + 0.04);
  centerWing.add(fanRim);

  for (let a = 1; a < 4; a++) {
    const angle = (a / 4) * Math.PI;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, doorWidth / 2, 0.05), timberDarkMat);
    spoke.position.set(
      Math.cos(angle) * (doorWidth / 4),
      doorHeight + 0.02 + Math.sin(angle) * (doorWidth / 4),
      doorZ + 0.04
    );
    spoke.rotation.z = angle - Math.PI / 2;
    centerWing.add(spoke);
  }

  // Holiday Wreath with Red Ribbon on the door
  const wreathGeo = new THREE.TorusGeometry(0.35, 0.1, 8, 16);
  const wreathMat = new THREE.MeshLambertMaterial({ color: 0x1e5a2d, flatShading: true });
  const wreath = new THREE.Mesh(wreathGeo, wreathMat);
  wreath.position.set(0, 1.45, doorZ + 0.08);
  centerWing.add(wreath);

  const bowGeo = new THREE.BoxGeometry(0.18, 0.12, 0.06);
  const bowMat = new THREE.MeshLambertMaterial({ color: 0xc0392b });
  const bow = new THREE.Mesh(bowGeo, bowMat);
  bow.position.set(0, 1.8, doorZ + 0.12);
  centerWing.add(bow);

  // Stone entry steps leading down to snow
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 1.0), timberDarkMat);
  step1.position.set(0, 0.1, cDepth / 2 + porchD - 0.2);
  centerWing.add(step1);

  const step2 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.15, 0.8), timberDarkMat);
  step2.position.set(0, 0.075, cDepth / 2 + porchD + 0.5);
  centerWing.add(step2);

  // Warm hanging porch lantern
  const lanternGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.35, 6);
  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffea88 });
  const lantern = new THREE.Mesh(lanternGeo, lanternMat);
  lantern.position.set(0, porchColHeight - 0.3, cDepth / 2 + porchD * 0.6);
  centerWing.add(lantern);

  lanternLight = new THREE.PointLight(0xffbe69, 1.8, 14);
  lanternLight.position.set(0, porchColHeight - 0.4, cDepth / 2 + porchD * 0.6);
  centerWing.add(lanternLight);

  // Flanking windows on center wall
  const cWinL = createGridWindow(0.7, 1.1, 2, 2);
  cWinL.position.set(-1.6, 2.1, cDepth / 2 + 0.02);
  centerWing.add(cWinL);

  workshop.add(centerWing);

  // ════════════════════════════════════════════════════════════════════════════
  // 3. STORYBOOK TURRET TOWER (Observatory & Bell Spire)
  // ════════════════════════════════════════════════════════════════════════════
  const tower = new THREE.Group();
  tower.position.set(2.0, 0, 0.6);

  const towerRadius = 1.65;
  const towerHeight = 7.5;

  // Octagonal tower wall prism
  const towerGeo = new THREE.CylinderGeometry(towerRadius * 0.95, towerRadius, towerHeight, 8);
  const towerMesh = new THREE.Mesh(towerGeo, wallMat);
  towerMesh.position.y = towerHeight / 2;
  tower.add(towerMesh);

  // Base skirting
  const tBaseGeo = new THREE.CylinderGeometry(towerRadius * 1.05, towerRadius * 1.08, 0.65, 8);
  const tBase = new THREE.Mesh(tBaseGeo, wallTrimMat);
  tBase.position.y = 0.325;
  tower.add(tBase);

  // Mid-tower decorative timber belt course
  const beltGeo = new THREE.CylinderGeometry(towerRadius * 1.02, towerRadius * 1.02, 0.22, 8);
  const belt = new THREE.Mesh(beltGeo, timberDarkMat);
  belt.position.y = 4.2;
  tower.add(belt);

  // Decorative corbel cornice under tower roof
  const corbelGeo = new THREE.CylinderGeometry(towerRadius * 1.18, towerRadius * 0.95, 0.45, 8);
  const corbel = new THREE.Mesh(corbelGeo, timberDarkMat);
  corbel.position.y = towerHeight + 0.2;
  tower.add(corbel);

  // Steep pointed conical spire roof
  const spireHeight = 4.2;
  const spireGeo = new THREE.ConeGeometry(towerRadius * 1.25, spireHeight, 8);
  const spireMat = new THREE.MeshLambertMaterial({ color: 0x3d5a73, flatShading: true }); // Frosted slate blue
  const spire = new THREE.Mesh(spireGeo, spireMat);
  spire.position.y = towerHeight + 0.4 + spireHeight / 2;
  tower.add(spire);

  // Snow cap on tower spire
  const spireSnowGeo = new THREE.ConeGeometry(towerRadius * 0.8, spireHeight * 0.65, 8);
  const spireSnow = new THREE.Mesh(spireSnowGeo, snowMat);
  spireSnow.position.y = towerHeight + 0.4 + spireHeight * 0.68;
  tower.add(spireSnow);

  // Golden star / weathervane finial on top of spire
  const finialGeo = new THREE.SphereGeometry(0.25, 8, 8);
  const finial = new THREE.Mesh(finialGeo, brassMat);
  finial.position.y = towerHeight + 0.4 + spireHeight + 0.25;
  tower.add(finial);

  // Two vertically stacked arched dormer windows on tower face
  const tWin1 = createGridWindow(0.65, 0.95, 2, 2);
  tWin1.position.set(0, 2.5, towerRadius * 0.98);
  tower.add(tWin1);

  const tWin2 = createGridWindow(0.65, 0.95, 2, 2);
  tWin2.position.set(0, 5.2, towerRadius * 0.94);
  tower.add(tWin2);

  workshop.add(tower);

  // ════════════════════════════════════════════════════════════════════════════
  // 4. RIGHT WING (The Great Assembly & Packaging Hall)
  // ════════════════════════════════════════════════════════════════════════════
  const rightWing = new THREE.Group();
  rightWing.position.set(6.8, 0, -0.2);

  const rWidth = 8.5;
  const rDepth = 6.4;
  const rWallHeight = 4.4;

  // Main right hall wall
  const rBodyGeo = new THREE.BoxGeometry(rWidth, rWallHeight, rDepth);
  const rBody = new THREE.Mesh(rBodyGeo, wallMat);
  rBody.position.y = rWallHeight / 2;
  rightWing.add(rBody);

  // Base skirting
  const rBaseGeo = new THREE.BoxGeometry(rWidth + 0.15, 0.65, rDepth + 0.15);
  const rBase = new THREE.Mesh(rBaseGeo, wallTrimMat);
  rBase.position.y = 0.325;
  rightWing.add(rBase);

  // Long pitched roof
  const rRoofLen = Math.sqrt(Math.pow(rDepth / 2 + 0.8, 2) + Math.pow(3.4, 2));
  const rRoofAngle = Math.atan2(3.4, rDepth / 2 + 0.8);

  for (let s of [-1, 1]) {
    // Timber roof slope
    const rSlopeGeo = new THREE.BoxGeometry(rWidth + 0.8, 0.28, rRoofLen);
    const rSlope = new THREE.Mesh(rSlopeGeo, roofBaseMat);
    rSlope.rotation.x = s * rRoofAngle;
    rSlope.position.set(0, rWallHeight + 1.7, s * (rDepth / 4 + 0.3));
    rightWing.add(rSlope);

    // Sculpted snow blanket on roof
    const rSnowGeo = new THREE.BoxGeometry(rWidth + 0.95, 0.44, rRoofLen + 0.12);
    const rSnow = new THREE.Mesh(rSnowGeo, snowMat);
    rSnow.rotation.x = s * rRoofAngle;
    rSnow.position.set(0, rWallHeight + 1.95, s * (rDepth / 4 + 0.3));
    rightWing.add(rSnow);

    // Eave snow overhang
    const rDripGeo = new THREE.CylinderGeometry(0.2, 0.2, rWidth + 0.95, 10);
    const rDrip = new THREE.Mesh(rDripGeo, snowMat);
    rDrip.rotation.z = Math.PI / 2;
    rDrip.position.set(0, rWallHeight + 0.05, s * (rDepth / 2 + 0.7));
    rightWing.add(rDrip);
  }

  // Snow ridge cap
  const rRidgeGeo = new THREE.BoxGeometry(rWidth + 1.0, 0.4, 0.5);
  const rRidge = new THREE.Mesh(rRidgeGeo, snowMat);
  rRidge.position.set(0, rWallHeight + 3.5, 0);
  rightWing.add(rRidge);

  // Two Roof Dormer Windows on right wing front slope
  const dormer1 = createRoofDormer(1.0, 1.2, 1.2);
  dormer1.position.set(-1.8, rWallHeight + 0.5, rDepth / 2 - 0.2);
  rightWing.add(dormer1);

  const dormer2 = createRoofDormer(1.0, 1.2, 1.2);
  dormer2.position.set(1.8, rWallHeight + 0.5, rDepth / 2 - 0.2);
  rightWing.add(dormer2);

  // Expansive Multi-Pane Factory Bay Window on front face
  const factoryBay = createBayWindow(3.6, 1.9, 0.85);
  factoryBay.position.set(-0.8, 1.9, rDepth / 2);
  rightWing.add(factoryBay);

  // Dedicated Elf Loading Door framed by candy-cane columns
  const sideDoorX = 3.2;
  const colElfL = createCandyCaneColumn(2.6, 0.16);
  colElfL.position.set(sideDoorX - 0.7, 0, rDepth / 2 + 0.5);
  rightWing.add(colElfL);

  const colElfR = createCandyCaneColumn(2.6, 0.16);
  colElfR.position.set(sideDoorX + 0.7, 0, rDepth / 2 + 0.5);
  rightWing.add(colElfR);

  // Door leaf
  const elfDoor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.08), timberDarkMat);
  elfDoor.position.set(sideDoorX, 1.05, rDepth / 2 + 0.04);
  rightWing.add(elfDoor);

  // Overhang above elf door
  const elfAwning = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.75), timberDarkMat);
  elfAwning.position.set(sideDoorX, 2.65, rDepth / 2 + 0.35);
  rightWing.add(elfAwning);

  const elfSnowAwning = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 0.8), snowMat);
  elfSnowAwning.position.set(sideDoorX, 2.8, rDepth / 2 + 0.38);
  rightWing.add(elfSnowAwning);

  // Right Chimney with Twin Terracotta Pots & Smoke
  const rightChimney = createChimney(1.3, 1.3, 3.8);
  rightChimney.position.set(3.0, rWallHeight + 1.6, -1.0);
  rightWing.add(rightChimney);

  workshop.add(rightWing);

  // ════════════════════════════════════════════════════════════════════════════
  // 5. FACTORY MECHANICS (Toy Chute, Rotating Gearworks, Steam Pipes)
  // ════════════════════════════════════════════════════════════════════════════
  const factoryTech = new THREE.Group();

  // Rotating brass gear system mounted on the right factory wall
  const gear1 = createFactoryGear(0.85, 10, 0xd4af37);
  gear1.position.set(rightWing.position.x + rWidth / 2 + 0.08, 3.2, 0.5);
  gear1.rotation.y = Math.PI / 2;
  gear1.userData = { speed: 0.6 };
  factoryTech.add(gear1);
  animatedGears.push(gear1);

  const gear2 = createFactoryGear(0.55, 7, 0xb87333);
  gear2.position.set(rightWing.position.x + rWidth / 2 + 0.08, 4.25, -0.3);
  gear2.rotation.y = Math.PI / 2;
  gear2.userData = { speed: -0.92 }; // Opposite rotation
  factoryTech.add(gear2);
  animatedGears.push(gear2);

  // Copper steam pipes running along side wall
  const steamPipes = createSteamPipes();
  steamPipes.position.set(rightWing.position.x + rWidth / 2 + 0.08, 0, -1.4);
  steamPipes.rotation.y = Math.PI / 2;
  factoryTech.add(steamPipes);

  // Toy Chute & Delivery Staging on left side
  const toyChute = createToyDeliveryChute();
  toyChute.position.set(leftWing.position.x - lWidth / 2 - 0.2, 0, 0.5);
  toyChute.rotation.y = -Math.PI / 2;
  factoryTech.add(toyChute);

  workshop.add(factoryTech);

  // ════════════════════════════════════════════════════════════════════════════
  // 6. FRONT COURTYARD & LANDSCAPE DETAILS (From TurboSquid Reference)
  // ════════════════════════════════════════════════════════════════════════════

  // Row of arched candy canes along the front garden border
  const candyArches = createCandyCaneArches();
  candyArches.position.set(0, 0, 0);
  workshop.add(candyArches);

  // Foreground iconic North Pole Signpost
  const signpost = createNorthPoleSignpost();
  signpost.position.set(-6.8, 0, 5.6);
  workshop.add(signpost);

  // Sculpted organic snowdrifts nestling around the building foundation
  const driftPositions = [
    { x: -9.8, z: 2.5, r: 1.8, h: 0.7 },
    { x: -3.8, z: 4.8, r: 1.4, h: 0.55 },
    { x: 3.5, z: 4.2, r: 1.6, h: 0.6 },
    { x: 10.5, z: 2.2, r: 2.0, h: 0.8 },
    { x: -1.0, z: -3.5, r: 2.2, h: 0.9 },
  ];

  driftPositions.forEach((dp) => {
    const dGeo = new THREE.SphereGeometry(dp.r, 8, 6);
    const drift = new THREE.Mesh(dGeo, snowMat);
    drift.scale.set(1.6, dp.h / dp.r, 1.2);
    drift.position.set(dp.x, dp.h * 0.4, dp.z);
    workshop.add(drift);
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. ATMOSPHERIC WARM WORKSHOP LIGHTING
  // ════════════════════════════════════════════════════════════════════════════

  // Warm light pool spilling from left bay window
  const leftBayLight = new THREE.PointLight(0xffaa44, 1.4, 10);
  leftBayLight.position.set(-6.5, 1.8, 4.2);
  workshop.add(leftBayLight);

  // Warm light pool spilling from right factory bay window
  const rightBayLight = new THREE.PointLight(0xffaa44, 1.6, 12);
  rightBayLight.position.set(6.0, 1.8, 4.2);
  workshop.add(rightBayLight);

  // ── Position the entire workshop complex in the diorama ─────────────────────
  // Angled slightly toward the camera for a picturesque view matching the photo
  workshop.position.set(-10, 0, -8);
  workshop.rotation.y = 0.16; // ~9 degrees tilt

  scene.add(workshop);
  return workshop;
}

// ══════════════════════════════════════════════════════════════════════════════
// ANIMATION UPDATE: animateWorkshop(elapsed, delta)
// ══════════════════════════════════════════════════════════════════════════════

export function animateWorkshop(elapsed, delta) {
  // 1. Animate rising and drifting chimney smoke puffs
  animatedSmokePuffs.forEach((puff) => {
    const ud = puff.userData;
    ud.progress += delta * ud.speed;
    if (ud.progress > 1.0) {
      ud.progress -= 1.0;
    }

    // Rise upward
    const riseHeight = 3.8;
    puff.position.y = ud.baseY + ud.progress * riseHeight;

    // Gentle wind drift
    const drift = Math.sin(elapsed * 1.2 + ud.driftAngle) * (ud.progress * 0.8);
    puff.position.x = ud.potOffset + drift + (ud.progress * 0.4);
    puff.position.z = Math.cos(elapsed * 0.9 + ud.driftAngle) * (ud.progress * 0.6);

    // Expand as it rises
    const s = 0.3 + ud.progress * ud.maxScale;
    puff.scale.set(s, s * 0.85, s);

    // Fade out near top
    if (puff.material) {
      puff.material.opacity = Math.max(0, (1.0 - ud.progress) * 0.65);
    }
  });

  // 2. Animate rotating factory brass gears
  animatedGears.forEach((gear) => {
    gear.rotation.x += delta * (gear.userData.speed || 0.5);
  });

  // 3. Gentle warm lantern flicker
  if (lanternLight) {
    const flicker = Math.sin(elapsed * 4.5) * 0.12 + Math.cos(elapsed * 7.2) * 0.08;
    lanternLight.intensity = 1.7 + flicker;
  }
}
