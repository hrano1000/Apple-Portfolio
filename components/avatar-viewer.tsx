"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Group, Mesh, Object3D, Texture, WebGLRenderer, WebGLRenderTarget } from "three";

type Props = { modelUrl: string | null; posterUrl: string; posterMaskUrl?: string | null; rotationOffset?: number };

/** A real glTF mesh turntable. The poster remains visible until a model has loaded. */
export default function AvatarViewer({ modelUrl, posterUrl, posterMaskUrl = null, rotationOffset = 0 }: Props) {
  const portraitId = useId().replace(/:/g, "");
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    if (!modelUrl) { setReady(false); setFailed(false); return; }
    const container: HTMLDivElement = element;
    setReady(false);
    setFailed(false);
    let stopped = false;
    let renderer: WebGLRenderer | undefined;
    let environment: Texture | undefined;
    let environmentTarget: WebGLRenderTarget | undefined;
    let model: Group | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let renderFrame = 0;
    let progress = 0;
    const stage = container.closest<HTMLElement>(".portrait-stage");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let draw = () => {};
    function queue() { if (!renderFrame) renderFrame = requestAnimationFrame(() => { renderFrame = 0; draw(); }); }
    function onProgress(event: Event) { progress = (event as CustomEvent<{ progress: number }>).detail.progress; queue(); }
    function onMotionChange() { queue(); }
    stage?.addEventListener("portrait-progress", onProgress);
    reduced.addEventListener("change", onMotionChange);

    async function load() {
      try {
        const [THREE, { GLTFLoader }, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/addons/loaders/GLTFLoader.js"),
          import("three/addons/environments/RoomEnvironment.js"),
        ]);
        if (stopped) return;
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        renderer.domElement.setAttribute("role", "img");
        renderer.domElement.setAttribute("aria-label", "360-degree 3D avatar of Hassan Ibrahim Rano");
        container.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
        camera.position.set(0, 0.08, 6.6);
        camera.lookAt(0, 0, 0);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environmentTarget = pmrem.fromScene(room, 0.04);
        environment = environmentTarget.texture;
        scene.environment = environment;
        room.dispose();
        pmrem.dispose();
        scene.add(new THREE.HemisphereLight(0xf1f6ff, 0x74675c, 1.35));
        const key = new THREE.DirectionalLight(0xfff2df, 3);
        key.position.set(3, 5, 6); scene.add(key);
        const fill = new THREE.DirectionalLight(0xe8efff, 1.25);
        fill.position.set(-4, 2, 3); scene.add(fill);
        const rim = new THREE.DirectionalLight(0xc9d9ff, 2.2);
        rim.position.set(-3, 4, -4); scene.add(rim);
        const gltf = await new GLTFLoader().loadAsync(modelUrl!);
        if (stopped) { disposeModel(gltf.scene); return; }
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        checkFiniteBounds(size.y);
        gltf.scene.position.sub(center);
        model = new THREE.Group();
        model.add(gltf.scene);
        const scale = 3.45 / size.y;
        model.scale.setScalar(scale);
        scene.add(model);
        let meshes = 0;
        gltf.scene.traverse((object) => { if ((object as Mesh).isMesh) meshes += 1; });
        container.dataset.meshCount = String(meshes);
        function resize() {
          if (!renderer || stopped) return;
          const { width, height } = container.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          queue();
        }
        draw = () => {
          if (stopped || !model || !renderer) return;
          const p = reduced.matches ? 0 : Math.min(1, Math.max(0, progress));
          model.rotation.y = rotationOffset + p * Math.PI * 2;
          container.dataset.rotation = String(Math.round(p * 360));
          renderer.render(scene, camera);
        };
        progress = Number(stage?.dataset.progress || 0);
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        resize(); draw();
        container.dataset.rendererState = "ready";
        setReady(true);
      } catch {
        if (!stopped) { container.dataset.rendererState = "error"; setFailed(true); }
      }
    }
    void load();
    return () => {
      stopped = true;
      cancelAnimationFrame(renderFrame);
      resizeObserver?.disconnect();
      stage?.removeEventListener("portrait-progress", onProgress);
      reduced.removeEventListener("change", onMotionChange);
      if (model) disposeModel(model);
      environmentTarget?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [modelUrl, rotationOffset]);

  return <div className={`avatar-viewer ${ready ? "avatar-ready" : ""}`} ref={host} data-renderer-state={ready ? "ready" : failed ? "error" : modelUrl ? "loading" : "poster"}>
    {!ready && (posterMaskUrl ? <svg className="avatar-poster" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Hassan Ibrahim Rano">
      <defs>
        <filter id={`${portraitId}-edge`} filterUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
          <feMorphology in="SourceAlpha" operator="erode" radius="5" />
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
        <mask id={`${portraitId}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024" style={{ maskType: "alpha" }}>
          <image href={posterMaskUrl} width="1024" height="1024" filter={`url(#${portraitId}-edge)`} />
        </mask>
      </defs>
      <image href={posterUrl} width="1024" height="1024" mask={`url(#${portraitId}-mask)`} />
    </svg> : <img className="avatar-poster" src={posterUrl} alt="Hassan Ibrahim Rano" fetchPriority="high" />)}
    {failed && <span className="avatar-fallback-note">3D view unavailable</span>}
  </div>;
}

function checkFiniteBounds(height: number) { if (!Number.isFinite(height) || height <= 0) throw new Error("The avatar model has no usable bounds."); }

function disposeModel(root: Object3D) {
  root.traverse((object) => {
    const mesh = object as Object3D & { geometry?: { dispose(): void }; material?: { dispose(): void } | { dispose(): void }[] };
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) {
      for (const value of Object.values(material)) if (value && typeof value === "object" && "isTexture" in value) (value as Texture).dispose();
      material.dispose();
    }
  });
}
