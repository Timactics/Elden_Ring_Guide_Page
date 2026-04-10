// map.js – Elden Ring 3D-Karte mit Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ——— Zustand ———
let scene, camera, renderer, controls;
let markers = [];
let raycaster, mouse;
let animId = null;
let container = null;

// ——— Weltgröße ———
const WORLD = 160;
const SEGS  = 100;

// ——— Orte der Zwischenland ———
const LOCS = [
    // Limgrave
    { name:"Der Erste Schritt",            region:"Limgrave",            x:  8, z: 22, type:"grace",
      desc:"Erster Site of Grace. Startpunkt deiner Reise als Tarnished." },
    { name:"Margit, der Grausame Zeiger", region:"Limgrave",            x: -5, z:  8, type:"boss",
      desc:"Wächter vor Stormveil Burg. Erster großer Bosskampf des Spiels." },
    { name:"Stormveil Burg",              region:"Limgrave",            x: -5, z:  4, type:"dungeon",
      desc:"Erste große Burg. Heimat von Godrick dem Transpfropften." },
    { name:"Godrick der Transpfropfte",   region:"Limgrave",            x: -8, z:  1, type:"boss",
      desc:"Großer Ältester – Shard-Träger. Drop: Große Rune von Godrick." },
    { name:"Siofra-Brunnen",             region:"Limgrave",            x: 12, z: 17, type:"dungeon",
      desc:"Eingang zur unterirdischen Siofra-Region." },

    // Liurnia der Seen
    { name:"See von Liurnia",             region:"Liurnia der Seen",    x:-30, z:  5, type:"grace",
      desc:"Weitläufiger See mit der Akademie Raya Lucaria im Zentrum." },
    { name:"Akademie Raya Lucaria",       region:"Liurnia der Seen",    x:-27, z: -8, type:"dungeon",
      desc:"Heimat der Zauberer. Boss: Rennala, Königin des Vollmonds." },
    { name:"Rennala, Königin des Vollmonds", region:"Liurnia der Seen", x:-27, z:-11, type:"boss",
      desc:"Lernende Königin. Ermöglicht Neugestaltung des Charakters." },
    { name:"Caria-Herrensitz",            region:"Liurnia der Seen",    x:-40, z:-20, type:"dungeon",
      desc:"Herrensitz der Caria-Familie. Boss: Royal Knight Loretta." },

    // Caelid
    { name:"Caelid Wegweiser",            region:"Caelid",              x: 28, z: 14, type:"grace",
      desc:"Verwüstetes Land, befallen von Scarlet Rot." },
    { name:"Sellia, Stadt der Zauberer",  region:"Caelid",              x: 40, z:  5, type:"dungeon",
      desc:"Verfallene Zauberstadt mit Kristallmagiern und Geheimnissen." },
    { name:"Redmane Burg",               region:"Caelid",              x: 44, z: 32, type:"dungeon",
      desc:"Ort des Festivals von Caelid. Zugang zu Radahn." },
    { name:"Sternenknechtschaft Radahn", region:"Caelid",              x: 46, z: 36, type:"boss",
      desc:"Festival-Boss und mächtiger Shard-Träger. Drop: Große Rune von Radahn." },

    // Altus-Plateau
    { name:"Altus-Plateau Eingang",      region:"Altus-Plateau",       x:  2, z:-14, type:"grace",
      desc:"Erhöhtes Plateau – Zugang zur Königshauptstadt Leyndell." },
    { name:"Rundenforst",                region:"Altus-Plateau",       x:  0, z:-19, type:"grace",
      desc:"Hub-Bereich. Triff NPCs und Schmiedemeister Hewg hier." },
    { name:"Leyndell, Königshauptstadt", region:"Altus-Plateau",       x:  8, z:-27, type:"dungeon",
      desc:"Die goldene Hauptstadt am Erdbaum. Boss: Morgott." },
    { name:"Morgott, der Omenking",      region:"Altus-Plateau",       x:  8, z:-30, type:"boss",
      desc:"Wahrer König von Leyndell. Drop: Große Rune von Morgott." },
    { name:"Vulkano-Herrensitz",         region:"Altus-Plateau",       x:-20, z:-36, type:"dungeon",
      desc:"Feurige Burg auf dem Vulkanio. Boss: Rykard." },
    { name:"Rykard, Herr der Lästerung", region:"Altus-Plateau",       x:-22, z:-39, type:"boss",
      desc:"Verschluckte die Große Schlangenrune. Drop: Große Rune von Rykard." },

    // Bergkuppen & Farum Azula
    { name:"Bergkuppen der Giganten",    region:"Bergkuppen",          x: 15, z:-55, type:"grace",
      desc:"Schneebedeckte Berge. Heimat der Riesen und des Erdbaum-Asche." },
    { name:"Fire Giant",                 region:"Bergkuppen",          x: 18, z:-60, type:"boss",
      desc:"Letzter überlebender Riese. Wächter des Riesenfeuers." },
    { name:"Maliketh, der Schwarze Klingen-Bote", region:"Farum Azula", x: 60, z:-46, type:"boss",
      desc:"Hüter der Rune des Todes in Farum Azula." },
    { name:"Elden Beast",                region:"Erdbaum-Inneres",     x: 10, z:-63, type:"boss",
      desc:"Finaler Boss des Spiels. Das Elden Beast im Erdbaum." },
];

// ——— Höhenfunktion ———
function getY(x, z) {
    let y = 0;

    // Basis-Mikrovariationen
    y += Math.sin(x * 0.07) * Math.cos(z * 0.06) * 1.8;
    y += Math.cos(x * 0.13) * Math.sin(z * 0.11) * 0.9;
    y += Math.sin(x * 0.22 + z * 0.17) * 0.5;

    // Bergkuppen (nord, z < -48)
    if (z < -48) {
        y += Math.pow(Math.max(0, (-z - 48) * 0.1), 1.6) * 14;
        const px = x - 10, pz = z + 62;
        y += Math.max(0, 12 - Math.sqrt(px * px + pz * pz));
    }

    // Farum Azula (schwebende Region, Nordost)
    {
        const d = Math.sqrt((x - 60) ** 2 + (z + 47) ** 2);
        if (d < 18) y += Math.max(0, (18 - d) * 0.65);
    }

    // Altus-Plateau (erhöht)
    if (x > -36 && x < 36 && z > -48 && z < -13) {
        const bx = Math.min((x + 36) / 9, (36 - x) / 9, 1);
        const bz = Math.min((z + 48) / 9, (-13 - z) / 9, 1);
        y += Math.min(bx, bz) * 7;
    }

    // Leyndell-Hügel
    {
        const d = Math.sqrt((x - 8) ** 2 + (z + 27) ** 2);
        if (d < 7) y += (7 - d) * 0.4;
    }

    // Vulkano-Herrensitz
    {
        const d = Math.sqrt((x + 20) ** 2 + (z + 37) ** 2);
        if (d < 11) y += Math.max(0, (11 - d) * 0.6);
    }

    // Liurnia (See-Senke)
    if (x > -56 && x < -8 && z > -29 && z < 40) {
        const bx = Math.min((x + 56) / 8, (-8 - x) / 8, 1);
        const bz = Math.min((z + 29) / 8, (40 - z) / 8, 1);
        y -= Math.min(bx, bz) * 3.5;
    }

    // Caelid (unebenes Terrain)
    if (x > 12 && x < 62 && z > -20 && z < 50) {
        y += Math.sin(x * 0.24) * Math.cos(z * 0.19) * 2;
        y += 1.5;
    }

    return y;
}

// ——— Farbe je Region ———
function getColor(x, z, y) {
    if (y < -1.8) return new THREE.Color(0x1a3a6a); // tiefer See
    if (y < -0.3) return new THREE.Color(0x2a4e80);  // flaches Wasser

    const fD = Math.sqrt((x - 60) ** 2 + (z + 47) ** 2);
    if (fD < 20)  return new THREE.Color(0x55336e);  // Farum Azula

    if (y > 10 || z < -51) return new THREE.Color(0xddeeff); // Schnee

    if (y > 5.5 && z < -13 && z > -48 && x > -36 && x < 36)
        return new THREE.Color(0x9b7930); // Altus-Plateau

    const vD = Math.sqrt((x + 20) ** 2 + (z + 37) ** 2);
    if (vD < 14) return new THREE.Color(0x8b3a1a); // Vulkan

    if (x > 12 && x < 62 && z > -20 && z < 50)
        return new THREE.Color(0x8b3030); // Caelid

    if (x > -56 && x < -8 && z > -29 && z < 40)
        return new THREE.Color(0x3a5a4a); // Liurnia (Seeufer)

    if (z > -14 && z < 70) return new THREE.Color(0x4a7c3f); // Limgrave

    return new THREE.Color(0x5a6040); // Rest-Hochland
}

// ——— Terrain ———
function buildTerrain(sc) {
    const geo = new THREE.PlaneGeometry(WORLD, WORLD, SEGS, SEGS);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const cols = [];

    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        const y = getY(x, z);
        pos.setY(i, y);
        const c = getColor(x, z, y);
        cols.push(c.r, c.g, c.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    sc.add(mesh);

    // Wasserfläche – Liurnia
    const wGeo = new THREE.PlaneGeometry(48, 70);
    wGeo.rotateX(-Math.PI / 2);
    const wMat = new THREE.MeshLambertMaterial({
        color: 0x1a3a6a, transparent: true, opacity: 0.75
    });
    const water = new THREE.Mesh(wGeo, wMat);
    water.position.set(-30, -1.2, 5);
    sc.add(water);
}

// ——— Sterne ———
function buildStars(sc) {
    const geo = new THREE.BufferGeometry();
    const pts = [];
    for (let i = 0; i < 2000; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.random() * Math.PI;
        const r     = 220 + Math.random() * 30;
        pts.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.cos(phi),
            r * Math.sin(phi) * Math.sin(theta)
        );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.55, sizeAttenuation: true });
    sc.add(new THREE.Points(geo, mat));
}

// ——— Erdbaum-Strahlen ———
function buildErdtree(sc) {
    const baseH = getY(8, -27) + 18;

    const coneGeo = new THREE.ConeGeometry(5, 35, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
        color: 0xd4a64f, transparent: true, opacity: 0.10, side: THREE.DoubleSide
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(8, baseH, -27);
    sc.add(cone);

    const light = new THREE.PointLight(0xd4a64f, 4, 80);
    light.position.set(8, baseH - 5, -27);
    sc.add(light);
}

// ——— Marker ———
const TYPE_COLOR = { grace: 0xd4a64f, boss: 0xcc2222, dungeon: 0x6688ff };

function buildMarkers(sc) {
    markers = [];

    LOCS.forEach(loc => {
        const y = getY(loc.x, loc.z) + 2.5;

        // Kugelmarker
        const geo = new THREE.SphereGeometry(1.4, 16, 16);
        const mat = new THREE.MeshStandardMaterial({
            color: TYPE_COLOR[loc.type],
            emissive: TYPE_COLOR[loc.type],
            emissiveIntensity: 0.9,
            roughness: 0.3,
            metalness: 0.4,
        });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.position.set(loc.x, y, loc.z);
        sphere.userData = loc;
        sc.add(sphere);
        markers.push(sphere);

        // Lichtsäule
        const pGeo = new THREE.CylinderGeometry(0.08, 0.08, 5, 8);
        const pMat = new THREE.MeshBasicMaterial({
            color: TYPE_COLOR[loc.type], transparent: true, opacity: 0.25
        });
        const pillar = new THREE.Mesh(pGeo, pMat);
        pillar.position.set(loc.x, y + 0.5, loc.z);
        sc.add(pillar);
    });
}

// ——— Info-Panel ———
function showInfo(loc) {
    let p = document.getElementById('map-info-panel');
    if (!p) {
        p = document.createElement('div');
        p.id = 'map-info-panel';
        container.appendChild(p);
    }
    const icons  = { grace:'✦', boss:'☠', dungeon:'⚔' };
    const labels = { grace:'Site of Grace', boss:'Boss', dungeon:'Dungeon / Gebiet' };

    p.innerHTML = `
        <span class="map-tag map-tag-${loc.type}">${icons[loc.type]} ${labels[loc.type]}</span>
        <div class="map-region">${loc.region}</div>
        <h3>${loc.name}</h3>
        <p>${loc.desc}</p>
        <small class="map-hint">Klick außerhalb zum Schließen</small>
    `;
    p.classList.add('visible');
}

function hideInfo() {
    const p = document.getElementById('map-info-panel');
    if (p) p.classList.remove('visible');
}

// ——— Klick-Handler ———
function onClick(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(markers);
    hits.length > 0 ? showInfo(hits[0].object.userData) : hideInfo();
}

// ——— Legende ———
function buildLegend() {
    const leg = document.createElement('div');
    leg.id = 'map-legend';
    leg.innerHTML = `
        <div class="leg-title">Legende</div>
        <div class="leg-item"><span class="leg-dot leg-grace"></span> Site of Grace</div>
        <div class="leg-item"><span class="leg-dot leg-boss"></span> Boss</div>
        <div class="leg-item"><span class="leg-dot leg-dungeon"></span> Dungeon / Gebiet</div>
        <div class="leg-hint">Klick auf Marker für Details<br>Maus ziehen = Drehen<br>Scrollrad = Zoomen</div>
    `;
    container.appendChild(leg);
}

// ——— Animation ———
function animate() {
    animId = requestAnimationFrame(animate);
    const t = Date.now() * 0.001;
    markers.forEach((m, i) => {
        m.scale.setScalar(1 + Math.sin(t * 2.5 + i * 0.7) * 0.18);
    });
    controls.update();
    renderer.render(scene, camera);
}

// ——— Resize ———
function onResize() {
    if (!container || !renderer) return;
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

// ——— Öffentlich: initMap ———
function initMap(el) {
    container = el;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060810);
    scene.fog = new THREE.FogExp2(0x060810, 0.006);

    const w = el.clientWidth, hh = el.clientHeight;
    camera = new THREE.PerspectiveCamera(55, w / hh, 0.5, 500);
    camera.position.set(0, 70, 90);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, hh);
    renderer.shadowMap.enabled = true;
    el.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.06;
    controls.maxPolarAngle    = Math.PI / 2.1;
    controls.minDistance      = 20;
    controls.maxDistance      = 160;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x1a1a2e, 3));
    const sun = new THREE.DirectionalLight(0xffd580, 1.0);
    sun.position.set(40, 80, 40);
    sun.castShadow = true;
    scene.add(sun);

    buildTerrain(scene);
    buildStars(scene);
    buildErdtree(scene);
    buildMarkers(scene);
    buildLegend();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    animate();
}

// ——— Öffentlich: destroyMap ———
function destroyMap() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (renderer) {
        renderer.domElement.removeEventListener('click', onClick);
        renderer.dispose();
        if (renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }
    window.removeEventListener('resize', onResize);
    ['map-legend', 'map-info-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
    scene = camera = renderer = controls = null;
    markers = [];
    container = null;
}

// Globale Verfügbarkeit für nicht-Module-Skripte
window.initMap    = initMap;
window.destroyMap = destroyMap;
