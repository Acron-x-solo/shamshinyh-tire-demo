import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import * as THREE from "three";

import WheelFallback from "./WheelFallback.jsx";

export default function WheelScene() {
  const container = useRef(null);
  const api = useRef(null);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [exploded, setExploded] = useState(false);
  const settings = useRef({ paused, exploded, reduced });
  settings.current = { paused, exploded, reduced };
  useEffect(() => {
    const host = container.current;
    let renderer;
    let stopped = false;
    let contextLost = false;
    let frame = 0;
    let resizeObserver;
    let visibilityObserver;
    let environment;
    let visible = true;
    let pageVisible = !document.hidden;
    let last = 0;
    let activePointer = null;
    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    let userYaw = 0;
    let userPitch = 0;
    let hoverX = 0;
    let hoverY = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.05, 8.7);
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor(0xf4f7fa, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.prepend(renderer.domElement);
    // Small studio cubemap gives chrome reflections without rendering a full room.
    const studioFaces = Array.from({ length: 6 }, (_, index) => {
      const face = document.createElement("canvas");
      face.width = 64;
      face.height = 64;
      const context = face.getContext("2d");
      const gradient = context.createLinearGradient(0, 0, 64, 64);
      gradient.addColorStop(0, "#161d25");
      gradient.addColorStop(0.4, index % 2 ? "#8198a8" : "#dce9ee");
      gradient.addColorStop(1, "#27313b");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      context.fillStyle = "#f4f8f9";
      context.fillRect(index % 2 ? 8 : 40, 4, 9, 56);
      return face;
    });
    environment = new THREE.CubeTexture(studioFaces);
    environment.colorSpace = THREE.SRGBColorSpace;
    environment.needsUpdate = true;
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xe8f4ff, 2.0);
    key.position.set(-4, 4, 6);
    scene.add(key);
    const rimLight = new THREE.DirectionalLight(0x839fff, 2.5);
    rimLight.position.set(5, 1, -3);
    scene.add(rimLight);
    const topLight = new THREE.DirectionalLight(0xffffff, 1.25);
    topLight.position.set(2, 6, 2);
    scene.add(topLight);
    const pivot = new THREE.Group();
    pivot.rotation.set(-0.14, -0.42, -0.13);
    scene.add(pivot);
    const tyre = new THREE.Group();
    const rim = new THREE.Group();
    const brake = new THREE.Group();
    pivot.add(tyre, rim, brake);
    const rubber = new THREE.MeshStandardMaterial({
      color: 0x0c1115,
      roughness: 0.82,
      metalness: 0.03,
    });
    const treadMaterial = new THREE.MeshStandardMaterial({
      color: 0x20262a,
      roughness: 0.79,
      metalness: 0.03,
    });
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x252b2f,
      roughness: 0.73,
    });
    const silver = new THREE.MeshPhongMaterial({
      color: 0x7e8fa4,
      specular: 0xffffff,
      shininess: 80,
      envMap: environment,
      reflectivity: 0.65,
    });
    const darkMetal = new THREE.MeshPhongMaterial({
      color: 0x2a3137,
      specular: 0x8399aa,
      shininess: 40,
      envMap: environment,
      reflectivity: 0.32,
    });
    const rotorMaterial = new THREE.MeshStandardMaterial({
      color: 0x6f777c,
      metalness: 0.83,
      roughness: 0.4,
    });
    const orange = new THREE.MeshStandardMaterial({
      color: 0x2456ee,
      metalness: 0.5,
      roughness: 0.35,
    });
    const points = [
      new THREE.Vector2(1.16, -0.32),
      new THREE.Vector2(1.4, -0.42),
      new THREE.Vector2(1.68, -0.38),
      new THREE.Vector2(1.84, -0.28),
      new THREE.Vector2(1.91, -0.15),
      new THREE.Vector2(1.93, 0.15),
      new THREE.Vector2(1.84, 0.28),
      new THREE.Vector2(1.68, 0.38),
      new THREE.Vector2(1.4, 0.42),
      new THREE.Vector2(1.16, 0.32),
      new THREE.Vector2(1.16, -0.32),
    ];
    const tyreMesh = new THREE.Mesh(
      new THREE.LatheGeometry(points, 96),
      rubber,
    );
    tyreMesh.rotation.x = Math.PI / 2;
    tyre.add(tyreMesh);
    for (const z of [-0.34, 0.34]) {
      for (const radius of [1.27, 1.37, 1.69, 1.79]) {
        const bead = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.013, 8, 96),
          sideMaterial,
        );
        bead.position.z = z;
        tyre.add(bead);
      }
    }
    const treadGeo = new THREE.BoxGeometry(0.16, 0.075, 0.16);
    const blocks = new THREE.InstancedMesh(treadGeo, treadMaterial, 96 * 5);
    const dummy = new THREE.Object3D();
    let n = 0;
    for (let row = 0; row < 5; row++) {
      for (let i = 0; i < 96; i++) {
        const angle = ((i + (row % 2) * 0.5) * Math.PI * 2) / 96;
        dummy.position.set(
          Math.cos(angle) * 1.937,
          Math.sin(angle) * 1.937,
          (row - 2) * 0.14,
        );
        dummy.rotation.set(
          0,
          0,
          angle - Math.PI / 2 + (row % 2 ? -0.12 : 0.12),
        );
        dummy.updateMatrix();
        blocks.setMatrixAt(n++, dummy.matrix);
      }
    }
    blocks.instanceMatrix.needsUpdate = true;
    tyre.add(blocks);
    for (const z of [-0.33, 0.33]) {
      const lip = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.055, 12, 96),
        silver,
      );
      lip.position.z = z;
      rim.add(lip);
    }
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.17, 1.17, 0.59, 96, 1, true),
      darkMetal,
    );
    barrel.rotation.x = Math.PI / 2;
    rim.add(barrel);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.16, 48),
      silver,
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 0.31;
    rim.add(hub);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.125, 0.17, 40),
      darkMetal,
    );
    cap.rotation.x = Math.PI / 2;
    cap.position.z = 0.34;
    rim.add(cap);
    const shape = new THREE.Shape();
    shape.moveTo(-0.07, 0.21);
    shape.lineTo(-0.115, 0.42);
    shape.lineTo(-0.075, 1.12);
    shape.lineTo(0.04, 1.12);
    shape.lineTo(0.065, 0.68);
    shape.lineTo(0.125, 0.35);
    shape.lineTo(0.07, 0.21);
    shape.closePath();
    const spokeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.018,
      bevelThickness: 0.022,
    });
    for (let i = 0; i < 10; i++) {
      const spoke = new THREE.Mesh(spokeGeo, silver);
      spoke.rotation.z = (i * Math.PI) / 5;
      spoke.position.z = 0.3;
      rim.add(spoke);
    }
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.034, 0.034, 0.07, 6),
        darkMetal,
      );
      bolt.rotation.x = Math.PI / 2;
      bolt.position.set(Math.sin(angle) * 0.218, Math.cos(angle) * 0.218, 0.42);
      rim.add(bolt);
    }
    const rotor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.91, 0.91, 0.055, 96),
      rotorMaterial,
    );
    rotor.rotation.x = Math.PI / 2;
    rotor.position.z = 0.11;
    brake.add(rotor);
    const holes = new THREE.InstancedMesh(
      new THREE.CircleGeometry(0.021, 6),
      darkMetal,
      72,
    );
    for (let i = 0; i < 72; i++) {
      const radius = 0.52 + Math.floor(i / 24) * 0.12;
      const angle = ((i % 24) * Math.PI * 2) / 24 + Math.floor(i / 24) * 0.06;
      dummy.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.142,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      holes.setMatrixAt(i, dummy.matrix);
    }
    brake.add(holes);
    const rotorHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.11, 40),
      darkMetal,
    );
    rotorHub.rotation.x = Math.PI / 2;
    rotorHub.position.z = 0.14;
    brake.add(rotorHub);
    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.57, 0.18),
      orange,
    );
    caliper.rotation.z = -0.17;
    caliper.position.set(0.79, 0.2, 0.2);
    brake.add(caliper);
    let wheelAngle = 0;
    let yaw = pivot.rotation.y;
    let pitch = pivot.rotation.x;
    let tyreOffset = 0;
    let rimOffset = 0;
    let brakeOffset = 0;
    function render(now) {
      frame = 0;
      if (stopped || contextLost || !visible || !pageVisible) return;
      const dt = Math.min((now - last) / 1000 || 0.016, 0.04);
      last = now;
      const prefs = settings.current;
      const moving = !prefs.paused && !prefs.reduced;
      if (moving && !dragging) {
        wheelAngle += dt * 0.1;
      }
      tyre.rotation.z = wheelAngle;
      rim.rotation.z = wheelAngle;
      const aimYaw = -0.42 + userYaw + (moving ? hoverX * 0.1 : 0);
      const aimPitch = -0.14 + userPitch + (moving ? hoverY * 0.06 : 0);
      const factor = prefs.reduced ? 1 : 1 - Math.exp(-dt * 6);
      yaw = THREE.MathUtils.lerp(yaw, aimYaw, factor);
      pitch = THREE.MathUtils.lerp(pitch, aimPitch, factor);
      pivot.rotation.y = yaw;
      pivot.rotation.x = pitch;
      const targets = prefs.exploded ? [-0.7, 0.85, -1.2] : [0, 0, 0];
      tyreOffset = THREE.MathUtils.lerp(
        tyreOffset,
        targets[0],
        prefs.reduced ? 1 : factor,
      );
      rimOffset = THREE.MathUtils.lerp(
        rimOffset,
        targets[1],
        prefs.reduced ? 1 : factor,
      );
      brakeOffset = THREE.MathUtils.lerp(
        brakeOffset,
        targets[2],
        prefs.reduced ? 1 : factor,
      );
      tyre.position.z = tyreOffset;
      rim.position.z = rimOffset;
      brake.position.z = brakeOffset;
      renderer.render(scene, camera);
      const settling =
        Math.abs(yaw - aimYaw) +
          Math.abs(pitch - aimPitch) +
          Math.abs(tyreOffset - targets[0]) +
          Math.abs(rimOffset - targets[1]) +
          Math.abs(brakeOffset - targets[2]) >
        0.00005;
      if (moving || settling || dragging) frame = requestAnimationFrame(render);
    }
    function wake() {
      if (!frame && !stopped && !contextLost && visible && pageVisible) {
        last = performance.now();
        frame = requestAnimationFrame(render);
      }
    }
    function resize() {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.z = camera.aspect < 0.85 ? 10.2 : 8.7;
      camera.updateProjectionMatrix();
      wake();
    }
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) wake();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "60px" },
    );
    visibilityObserver.observe(host);
    function visibility() {
      pageVisible = !document.hidden;
      if (pageVisible) wake();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
    function down(event) {
      if (event.target !== renderer.domElement) return;
      activePointer = event.pointerId;
      dragging = true;
      dragStart = { x: event.clientX, y: event.clientY };
      renderer.domElement.setPointerCapture(event.pointerId);
      wake();
    }
    function move(event) {
      if (dragging && event.pointerId === activePointer) {
        userYaw += (event.clientX - dragStart.x) * 0.007;
        userPitch = THREE.MathUtils.clamp(
          userPitch + (event.clientY - dragStart.y) * 0.003,
          -0.5,
          0.5,
        );
        dragStart = { x: event.clientX, y: event.clientY };
        wake();
        return;
      }
      if (
        settings.current.reduced ||
        settings.current.paused ||
        event.pointerType === "touch"
      )
        return;
      hoverX = event.offsetX / host.clientWidth - 0.5;
      hoverY = event.offsetY / host.clientHeight - 0.5;
      wake();
    }
    function up() {
      dragging = false;
      activePointer = null;
      wake();
    }
    function leave() {
      hoverX = 0;
      hoverY = 0;
      wake();
    }
    const canvas = renderer.domElement;
    function loseContext(event) {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(frame);
      frame = 0;
      setFailed(true);
    }
    function restoreContext() {
      contextLost = false;
      setFailed(false);
      wake();
    }
    canvas.addEventListener("webglcontextlost", loseContext);
    canvas.addEventListener("webglcontextrestored", restoreContext);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    api.current = {
      wake,
      rotate(direction) {
        userYaw += direction * 0.38;
        wake();
      },
      reset() {
        userYaw = 0;
        userPitch = 0;
        wake();
      },
    };
    resize();
    renderer.render(scene, camera);
    setReady(true);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("pointerleave", leave);
      api.current = null;
      canvas.removeEventListener("webglcontextlost", loseContext);
      canvas.removeEventListener("webglcontextrestored", restoreContext);
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material)
          (Array.isArray(object.material)
            ? object.material
            : [object.material]
          ).forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      environment?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);
  useEffect(() => {
    api.current?.wake();
  }, [paused, exploded, reduced]);
  return (
    <div
      ref={container}
      className={`wheel-scene ${ready && !failed ? "scene-ready" : ""} ${exploded ? "is-exploded" : ""} ${paused ? "is-paused" : ""}`}
    >
      <div className="wheel-aura" aria-hidden="true" />
      {(!ready || failed) && <WheelFallback />}
      <div className="wheel-label label-top">
        <span />
        КОНТАКТ С ДОРОГОЙ
      </div>
      <div className="wheel-label label-bottom">
        РЕЗИНА. МЕТАЛЛ. ВНИМАНИЕ К ДЕТАЛЯМ.
      </div>
      {ready && !failed && (
        <div className="wheel-controls">
          <div className="rotation-controls">
            <button
              className="scene-icon"
              type="button"
              aria-label="Повернуть колесо влево"
              title="Повернуть влево"
              onClick={() => api.current?.rotate(-1)}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="scene-icon"
              type="button"
              aria-label="Повернуть колесо вправо"
              title="Повернуть вправо"
              onClick={() => api.current?.rotate(1)}
            >
              <ArrowRight size={17} />
            </button>
            <button
              className="scene-icon"
              type="button"
              aria-label="Вернуть исходный вид колеса"
              title="Исходный вид"
              onClick={() => {
                setExploded(false);
                api.current?.reset();
              }}
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <button
            className="exploded-button"
            type="button"
            aria-pressed={exploded}
            onClick={() => setExploded(!exploded)}
          >
            <Layers size={16} />
            {exploded ? "Собрать колесо" : "Разобрать колесо"}
          </button>
          {!reduced && (
            <button
              className="scene-icon pause-control"
              type="button"
              aria-label={
                paused ? "Включить 3D-анимацию" : "Приостановить 3D-анимацию"
              }
              title={paused ? "Включить анимацию" : "Пауза"}
              aria-pressed={paused}
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}
        </div>
      )}
      <span className="wheel-hint">
        {failed
          ? "Каждая деталь имеет значение"
          : reduced
            ? "Исследуй колесо кнопками"
            : "Вращай колесо · собирай детали"}
      </span>
    </div>
  );
}
