"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CommunityScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    mount.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06040e);

    // ── Camera — high 3/4 angle so we see the full car body ───────
    // At y=5, z=11 looking at y=0.5 → ~26° downward tilt (proper showroom angle)
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 5, 11);
    camera.lookAt(0, 0.5, 0);

    // ── Lighting ──────────────────────────────────────────────────
    // Strong ambient so no face is fully black
    scene.add(new THREE.AmbientLight(0xffffff, 5.0));

    // Main overhead spotlight — illuminates the entire top surface
    const spot = new THREE.SpotLight(0xfff5e0, 12, 35, Math.PI / 4.5, 0.35, 1.0);
    spot.position.set(0, 14, 8);
    spot.target.position.set(0, 0.5, 0);
    spot.castShadow = true;
    spot.shadow.mapSize.setScalar(2048);
    scene.add(spot);
    scene.add(spot.target);

    // Warm key from front-right
    const key = new THREE.DirectionalLight(0xFFD080, 5.0);
    key.position.set(6, 8, 10);
    key.castShadow = true;
    key.shadow.mapSize.setScalar(1024);
    scene.add(key);

    // Cyan fill from left
    const fill = new THREE.DirectionalLight(0x5CE8D8, 3.0);
    fill.position.set(-8, 6, 4);
    scene.add(fill);

    // Orange rim from behind
    const rim = new THREE.DirectionalLight(0xFF7020, 4.0);
    rim.position.set(0, 5, -10);
    scene.add(rim);

    // Hemisphere bounce
    scene.add(new THREE.HemisphereLight(0xffa040, 0x0a0520, 3.0));

    // ── Ground ────────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0x080511, roughness: 0.2, metalness: 0.7 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Faint orange grid on floor
    const gm = new THREE.LineBasicMaterial({ color: 0xF07028, transparent: true, opacity: 0.07 });
    for (let i = -8; i <= 8; i++) {
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-8,0,i), new THREE.Vector3(8,0,i)]), gm));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i,0,-8), new THREE.Vector3(i,0,8)]), gm));
    }

    // ── Materials ─────────────────────────────────────────────────
    // metalness: 0 → color is fully visible from direct lights (no env map needed)
    const bodyMat  = new THREE.MeshStandardMaterial({ color: 0xf2f0ec, roughness: 0.25, metalness: 0 });
    const paintMat = new THREE.MeshStandardMaterial({ color: 0xF07028, roughness: 0.20, metalness: 0 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a1828, transparent: true, opacity: 0.70, roughness: 0.05, metalness: 0 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, roughness: 0.20, metalness: 0 });
    const tireMat  = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.95, metalness: 0 });
    const hlMat    = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x5CE8D8, emissiveIntensity: 6 });
    const tlMat    = new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xE8411A, emissiveIntensity: 6 });

    // ── Car ───────────────────────────────────────────────────────
    const car = new THREE.Group();
    scene.add(car);

    const add = (geo, mat, px, py, pz, rx = 0, ry = 0, rz = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(px, py, pz);
      m.rotation.set(rx, ry, rz);
      m.castShadow = true;
      m.receiveShadow = true;
      car.add(m);
      return m;
    };

    // Chassis
    add(new THREE.BoxGeometry(4.40, 0.52, 1.82), bodyMat,  0,     0.26, 0);
    // Cabin
    add(new THREE.BoxGeometry(2.18, 0.54, 1.66), bodyMat, -0.06,  0.82, 0);
    // Hood slope
    add(new THREE.BoxGeometry(1.22, 0.07, 1.82), bodyMat,  1.12,  0.58, 0, 0, 0, -0.20);
    // Trunk slope
    add(new THREE.BoxGeometry(0.96, 0.07, 1.82), bodyMat, -1.36,  0.63, 0, 0, 0,  0.20);
    // Front bumper
    add(new THREE.BoxGeometry(0.20, 0.40, 1.82), bodyMat,  2.10,  0.20, 0);
    // Rear bumper
    add(new THREE.BoxGeometry(0.20, 0.40, 1.82), bodyMat, -2.10,  0.20, 0);

    // Orange side skirts
    [-0.92, 0.92].forEach(z => add(new THREE.BoxGeometry(3.60, 0.09, 0.07), paintMat, 0, 0.0, z));
    // Orange front lip
    add(new THREE.BoxGeometry(0.20, 0.10, 1.82), paintMat,  2.10, 0.01, 0);
    // Orange rear diffuser
    add(new THREE.BoxGeometry(0.20, 0.12, 1.82), paintMat, -2.10, 0.01, 0);
    // Orange hood stripe
    add(new THREE.BoxGeometry(0.80, 0.016, 0.28), paintMat, 1.45, 0.59, 0);

    // Spoiler
    add(new THREE.BoxGeometry(1.60, 0.07, 1.82), bodyMat,   -1.65, 1.06, 0);
    add(new THREE.BoxGeometry(0.06, 0.28, 0.10), chromeMat, -1.65, 0.93,  0.85);
    add(new THREE.BoxGeometry(0.06, 0.28, 0.10), chromeMat, -1.65, 0.93, -0.85);

    // Windshields
    add(new THREE.BoxGeometry(0.07, 0.52, 1.58), glassMat,  0.86, 0.84, 0, 0, 0, -0.20);
    add(new THREE.BoxGeometry(0.07, 0.52, 1.58), glassMat, -1.10, 0.84, 0, 0, 0,  0.20);
    // Roof
    add(new THREE.BoxGeometry(2.06, 0.08, 1.58), glassMat, -0.06, 1.08, 0);
    // Side windows
    [-0.84, 0.84].forEach(z => add(new THREE.BoxGeometry(2.0, 0.40, 0.05), glassMat, -0.08, 0.90, z));

    // Wheels
    [
      [ 1.32, 0.34,  0.97],
      [ 1.32, 0.34, -0.97],
      [-1.32, 0.34,  0.97],
      [-1.32, 0.34, -0.97],
    ].forEach(([x, y, z]) => {
      add(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32), tireMat,   x, y, z, Math.PI / 2);
      add(new THREE.CylinderGeometry(0.28, 0.28, 0.26, 32), chromeMat, x, y, z, Math.PI / 2);
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.28, 12), chromeMat, x, y, z, Math.PI / 2);
      for (let s = 0; s < 5; s++) {
        const sp = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.36, 0.035), chromeMat);
        sp.position.set(x, y, z);
        sp.rotation.set(Math.PI / 2, 0, (Math.PI * 2 / 5) * s);
        car.add(sp);
      }
    });

    // Headlights
    [-0.60, 0.60].forEach(z => {
      add(new THREE.BoxGeometry(0.09, 0.14, 0.24), hlMat, 2.13, 0.33, z);
      const pl = new THREE.PointLight(0x5CE8D8, 3.0, 9);
      pl.position.set(2.4, 0.33, z);
      car.add(pl);
    });

    // Tail lights
    [-0.60, 0.60].forEach(z => {
      add(new THREE.BoxGeometry(0.09, 0.14, 0.24), tlMat, -2.13, 0.33, z);
      const pl = new THREE.PointLight(0xe8411a, 2.0, 7);
      pl.position.set(-2.4, 0.33, z);
      car.add(pl);
    });

    // Underglow
    const under = new THREE.PointLight(0xF07028, 3.5, 6);
    under.position.set(0, 0.03, 0);
    car.add(under);

    // Start at a nice 3/4 front-left angle
    car.rotation.y = -0.4;
    car.position.set(0, 0.01, 0);

    // ── Particles ─────────────────────────────────────────────────
    const PCOUNT = 100;
    const pPos = new Float32Array(PCOUNT * 3);
    const pSpd = new Float32Array(PCOUNT);
    for (let i = 0; i < PCOUNT; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 18;
      pPos[i * 3 + 1] =  Math.random() * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
      pSpd[i] = 0.003 + Math.random() * 0.004;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xF07028, size: 0.04, transparent: true, opacity: 0.5, sizeAttenuation: true,
    })));

    // ── Mouse — rotate car only, camera stays fixed ────────────────
    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);

    // ── Animation ─────────────────────────────────────────────────
    let raf;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Mouse gently steers the car angle around the default -0.4
      car.rotation.y = -0.4 + mouse.x * 0.35;

      // Gentle float
      car.position.y = 0.01 + Math.sin(t * 0.65) * 0.07;

      // Underglow pulse
      under.intensity = 3.0 + Math.sin(t * 1.8) * 0.8;

      // Particles drift upward
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < PCOUNT; i++) {
        pos[i * 3 + 1] += pSpd[i];
        if (pos[i * 3 + 1] > 10) pos[i * 3 + 1] = 0;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const nW = mount.clientWidth;
      const nH = mount.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}
