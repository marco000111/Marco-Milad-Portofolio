import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BackSide,
  Box3,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  EquirectangularReflectionMapping,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  WebGLRenderer,
  Vector3,
} from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import fontUrl from '../../assets/fonts/helvetiker_bold.typeface.json?url';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ThreeNameScene({ variant = 'intro', onReady }) {
  const hostRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let renderer;
    let frame = 0;
    let disposed = false;
    let timeline;
    let resizeObserver;
    let visibilityObserver;
    const listeners = [];
    const geometries = [];
    const materials = [];
    const floating = [];
    let scene;
    let camera;
    let wordGroup;
    let environmentTexture;
    let pointer = { x: 0, y: 0 };
    let isInView = true;

    const listen = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      listeners.push(() => target.removeEventListener(type, handler, options));
    };
    const fail = () => { if (!disposed) setFailed(true); };

    try {
      if (!window.WebGLRenderingContext) throw new Error('WebGL unavailable');
      renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
      renderer.outputColorSpace = SRGBColorSpace;
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = variant === 'hero' ? 1.04 : 1.1;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = 'three-name-canvas';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      host.appendChild(renderer.domElement);
    } catch {
      fail();
      return undefined;
    }

    scene = new Scene();
    camera = new PerspectiveCamera(variant === 'hero' ? 25 : 30, 1, 0.1, 100);
    let cameraHomeZ = variant === 'hero' ? 4 : 8;
    camera.position.set(0, 0, cameraHomeZ);
    scene.add(new AmbientLight(0xc6d5e8, 1.0));
    const key = new DirectionalLight(0xf0f4fa, variant === 'hero' ? 1.9 : 2.4);
    key.position.set(-3, 5, 8);
    scene.add(key);
    const blue = new PointLight(0x288bdb, variant === 'hero' ? 6.5 : 18, 24, 2);
    blue.position.set(-3, 0.25, 1.2);
    scene.add(blue);
    const cyan = new PointLight(0x67d8ee, variant === 'hero' ? 4.5 : 12, 22, 2);
    cyan.position.set(3, -0.25, 1.2);
    scene.add(cyan);
    const sweepCanvas = document.createElement('canvas');
    sweepCanvas.width = 128;
    sweepCanvas.height = 8;
    const sweepContext = sweepCanvas.getContext('2d');
    const sweepGradient = sweepContext.createLinearGradient(0, 0, 128, 0);
    sweepGradient.addColorStop(0, 'rgba(48,177,255,0)');
    sweepGradient.addColorStop(0.34, 'rgba(48,177,255,.16)');
    sweepGradient.addColorStop(0.5, 'rgba(208,251,255,.98)');
    sweepGradient.addColorStop(0.66, 'rgba(33,153,255,.2)');
    sweepGradient.addColorStop(1, 'rgba(48,177,255,0)');
    sweepContext.fillStyle = sweepGradient;
    sweepContext.fillRect(0, 0, 128, 8);
    const sweepTexture = new CanvasTexture(sweepCanvas);
    sweepTexture.colorSpace = SRGBColorSpace;
    const sweepMaterial = new MeshBasicMaterial({
      map: sweepTexture, transparent: true, opacity: variant === 'hero' ? 0.34 : 0.82,
      blending: AdditiveBlending, depthWrite: false, side: DoubleSide,
    });
    const sweepBeam = new Mesh(new PlaneGeometry(0.3, 1.2), sweepMaterial);
    sweepBeam.position.set(-8, 0, 0.5);
    scene.add(sweepBeam);
    geometries.push(sweepBeam.geometry);
    materials.push(sweepMaterial);
    materials.push({ dispose: () => sweepTexture.dispose() });
    wordGroup = new Group();
    scene.add(wordGroup);

    const resize = () => {
      if (!renderer || !host.clientWidth || !host.clientHeight) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = variant === 'hero' ? 25 : 30;
      camera.updateProjectionMatrix();
      if (wordGroup.userData.textBounds) {
        const bounds = wordGroup.userData.textBounds;
        const rawWidth = bounds.max.x - bounds.min.x;
        const rawHeight = bounds.max.y - bounds.min.y;
        const uniformScale = Math.min(1, 8.2 / rawWidth, (variant === 'hero' ? 0.72 : 0.82) / rawHeight);
        const textWidth = rawWidth * uniformScale;
        const textHeight = rawHeight * uniformScale;
        const tangent = Math.tan(MathUtils.degToRad(camera.fov / 2));
        const widthRatio = variant === 'hero' ? 0.92 : 0.82;
        const heightRatio = variant === 'hero' ? 0.88 : 0.54;
        const distanceForWidth = textWidth / (2 * widthRatio * tangent * camera.aspect);
        const distanceForHeight = textHeight / (2 * heightRatio * tangent);
        cameraHomeZ = Math.max(1.7, distanceForWidth, distanceForHeight) + 0.06;
        camera.position.set(0, 0, cameraHomeZ);
        wordGroup.scale.setScalar(uniformScale);
        wordGroup.position.set(
          -((bounds.min.x + bounds.max.x) / 2) * uniformScale,
          -((bounds.min.y + bounds.max.y) / 2) * uniformScale,
          0,
        );
        sweepBeam.scale.y = Math.max(1, textHeight * 1.55 / 1.2);
        sweepBeam.position.z = textWidth * 0.06;
        wordGroup.userData.renderTextWidth = textWidth;
        wordGroup.userData.homeY = wordGroup.position.y;
        host.dataset.geometryWidth = rawWidth.toFixed(3);
        host.dataset.geometryHeight = rawHeight.toFixed(3);
        host.dataset.uniformScale = uniformScale.toFixed(3);
        host.dataset.cameraDistance = cameraHomeZ.toFixed(3);
        host.dataset.framedWidthRatio = widthRatio.toFixed(2);
      }
    };
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    listen(window, 'resize', resize);
    const handlePointer = (event) => {
      const rect = host.getBoundingClientRect();
      pointer = {
        x: MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1),
        y: MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1),
      };
      host.dataset.pointerX = pointer.x.toFixed(2);
      host.dataset.pointerY = pointer.y.toFixed(2);
    };
    listen(host, 'pointermove', handlePointer, { passive: true });
    listen(host, 'pointerleave', () => { pointer = { x: 0, y: 0 }; }, { passive: true });
    visibilityObserver = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting;
      if (isInView && !frame && !document.hidden) frame = window.requestAnimationFrame(render);
      if (!isInView && frame) { window.cancelAnimationFrame(frame); frame = 0; }
    });
    visibilityObserver.observe(host);
    const visibilityChange = () => {
      if (document.hidden && frame) { window.cancelAnimationFrame(frame); frame = 0; }
      else if (!document.hidden && isInView && !frame) frame = window.requestAnimationFrame(render);
    };
    listen(document, 'visibilitychange', visibilityChange);

    const render = (time) => {
      frame = 0;
      if (disposed) return;
      if (isInView && !document.hidden) {
        const elapsed = time * 0.001;
        const mobile = window.matchMedia('(pointer: coarse)').matches;
        const autoX = !reduceMotion() && mobile ? Math.sin(elapsed * 0.48) * 0.012 : 0;
        const autoY = !reduceMotion() && mobile ? Math.cos(elapsed * 0.38) * 0.006 : 0;
        const pointerX = reduceMotion() ? 0 : pointer.x;
        const pointerY = reduceMotion() ? 0 : pointer.y;
        wordGroup.rotation.y += ((pointerX * 0.04 + autoX) - wordGroup.rotation.y) * 0.035;
        wordGroup.rotation.x += ((-pointerY * 0.025 + autoY) - wordGroup.rotation.x) * 0.035;
        camera.position.x += ((pointerX * 0.14) - camera.position.x) * 0.025;
        camera.position.y += ((pointerY * 0.08) - camera.position.y) * 0.025;
        camera.lookAt(0, 0, 0);
        for (const particle of floating) {
          particle.position.y += particle.userData.speed;
          if (particle.position.y > 3.1) particle.position.y = -3.1;
          particle.material.opacity = 0.35 + Math.sin(elapsed * 1.6 + particle.userData.phase) * 0.18;
        }
        if (variant === 'hero' && !reduceMotion()) {
          const sweepCycle = 12;
          const progress = (elapsed % sweepCycle) / sweepCycle;
          const extent = wordGroup.userData.renderTextWidth * 0.62;
          sweepBeam.position.x = -extent + progress * extent * 2;
          blue.position.x = sweepBeam.position.x;
          sweepBeam.material.opacity = 0.12 + Math.sin(progress * Math.PI) * 0.24;
          wordGroup.position.y = wordGroup.userData.homeY + Math.sin(elapsed * 0.48) * 0.008;
        }
        renderer.render(scene, camera);
      }
      if (!reduceMotion() || variant === 'intro') frame = window.requestAnimationFrame(render);
    };

    const loader = new FontLoader();
    loader.load(fontUrl, (font) => {
      if (disposed) return;
      const name = 'MARCO MILAD';
      const charGap = variant === 'hero' ? 0.045 : 0.06;
      const letters = [];
      let total = 0;
      for (const char of name) {
        if (char === ' ') { total += 0.36; letters.push(null); continue; }
        const extrusionDepth = variant === 'hero' ? 0.14 : 0.2;
        const geometry = new TextGeometry(char, {
          font, size: 0.84, depth: extrusionDepth, curveSegments: 6,
          bevelEnabled: true,
          bevelThickness: variant === 'hero' ? 0.022 : 0.035,
          bevelSize: variant === 'hero' ? 0.015 : 0.022,
          bevelSegments: 3,
        });
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();
        geometries.push(geometry);
        const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
        letters.push({ geometry, width, offset: total });
        total += width + charGap;
      }
      total -= charGap;
      const textBounds = new Box3().makeEmpty();
      for (const letter of letters) {
        if (!letter) continue;
        const glyphX = letter.offset + letter.width / 2 - total / 2 - letter.width / 2;
        textBounds.union(letter.geometry.boundingBox.clone().translate(new Vector3(glyphX, 0, 0)));
      }
      const metal = new MeshPhysicalMaterial({
        color: variant === 'hero' ? 0xb7bec8 : 0xd9e8ff,
        metalness: variant === 'hero' ? 0.86 : 0.82,
        roughness: variant === 'hero' ? 0.34 : 0.2,
        clearcoat: variant === 'hero' ? 0.28 : 0.9,
        clearcoatRoughness: variant === 'hero' ? 0.28 : 0.16,
        emissive: 0x071522,
        emissiveIntensity: variant === 'hero' ? 0.08 : 0.42,
      });
      materials.push(metal);
      const glowMaterial = new MeshBasicMaterial({
        color: 0x53bde8,
        side: BackSide,
        transparent: true,
        opacity: variant === 'hero' ? 0.09 : 0.2,
      });
      materials.push(glowMaterial);
      for (let index = 0; index < letters.length; index += 1) {
        const letter = letters[index];
        if (!letter) continue;
        const group = new Group();
        const mesh = new Mesh(letter.geometry, metal);
        mesh.position.x = -letter.width / 2;
        group.add(mesh);
        const rim = new Mesh(letter.geometry, glowMaterial);
        rim.scale.setScalar(1.015);
        rim.position.x = -letter.width / 2;
        rim.position.z = -0.016;
        group.add(rim);
        group.position.x = letter.offset + letter.width / 2 - total / 2;
        group.userData.targetX = group.position.x;
        wordGroup.add(group);
        if (variant === 'intro') {
          group.position.set(group.userData.targetX + (index % 2 ? 1 : -1) * (4.4 + Math.random() * 2), (Math.random() - 0.5) * 4.3, -2 - Math.random() * 2);
          group.rotation.set((Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.3, (Math.random() - 0.5) * 1.3);
        }
      }
      host.dataset.threeReady = 'true';
      host.dataset.geometry = 'TextGeometry';
      host.dataset.letterCount = String(letters.filter(Boolean).length);
      host.dataset.extrusionDepth = variant === 'hero' ? '0.14' : '0.2';
      host.dataset.beveled = 'true';
      host.dataset.geometryBounds = `${(textBounds.max.x - textBounds.min.x).toFixed(3)}x${(textBounds.max.y - textBounds.min.y).toFixed(3)}`;
      wordGroup.userData.textBounds = textBounds;
      const textWidth = textBounds.max.x - textBounds.min.x;
      blue.position.x = -textWidth * 0.34;
      blue.distance = textWidth * 1.55;
      cyan.position.x = textWidth * 0.34;
      cyan.distance = textWidth * 1.4;
      resize();

      const environmentCanvas = document.createElement('canvas');
      environmentCanvas.width = 512;
      environmentCanvas.height = 256;
      const environmentContext = environmentCanvas.getContext('2d');
      const environmentGradient = environmentContext.createLinearGradient(0, 0, 0, 256);
      environmentGradient.addColorStop(0, '#d2d9e2');
      environmentGradient.addColorStop(0.27, '#697889');
      environmentGradient.addColorStop(0.5, '#101924');
      environmentGradient.addColorStop(0.72, '#28435b');
      environmentGradient.addColorStop(1, '#bac8d4');
      environmentContext.fillStyle = environmentGradient;
      environmentContext.fillRect(0, 0, 512, 256);
      for (const [x, width, color] of [[52, 30, 'rgba(238,246,255,.72)'], [162, 20, 'rgba(45,126,196,.56)'], [340, 38, 'rgba(57,86,119,.58)'], [440, 15, 'rgba(143,214,232,.72)']]) {
        environmentContext.fillStyle = color;
        environmentContext.fillRect(x, 0, width, 256);
      }
      environmentTexture = new CanvasTexture(environmentCanvas);
      environmentTexture.mapping = EquirectangularReflectionMapping;
      environmentTexture.colorSpace = SRGBColorSpace;
      scene.environment = environmentTexture;

      const particleGeometry = new SphereGeometry(0.012, 6, 6);
      geometries.push(particleGeometry);
      const particleMaterial = new MeshBasicMaterial({ color: 0x49baff, transparent: true, opacity: 0.5 });
      materials.push(particleMaterial);
      for (let i = 0; i < 34; i += 1) {
        const particle = new Mesh(particleGeometry, particleMaterial.clone());
        particle.material = materials[materials.push(particle.material) - 1];
        particle.position.set((Math.random() - 0.5) * 13, (Math.random() - 0.5) * 6, -1 - Math.random() * 4);
        particle.userData.speed = 0.0007 + Math.random() * 0.0012;
        particle.userData.phase = Math.random() * Math.PI * 2;
        floating.push(particle);
        scene.add(particle);
      }

      if (variant === 'intro' && !reduceMotion()) {
        const lettersToAnimate = wordGroup.children.filter((child) => child.userData.targetX !== undefined);
        timeline = gsap.timeline({ onComplete: () => onReady?.() });
        timeline.to(lettersToAnimate.map((letter) => letter.position), {
          x: (index) => lettersToAnimate[index].userData.targetX,
          y: 0, z: 0, duration: 0.82, ease: 'power3.out', stagger: 0.045,
        }, 0.82);
        timeline.to(lettersToAnimate.map((letter) => letter.rotation), {
          x: 0, y: 0, z: 0, duration: 0.78, ease: 'power3.inOut', stagger: 0.04,
        }, 0.84);
        const sweepExtent = Math.max(4.5, textWidth * 0.64);
        sweepBeam.position.x = -sweepExtent;
        timeline.to(blue.position, { x: sweepExtent, duration: 0.82, ease: 'power1.inOut' }, 1.38);
        timeline.to(sweepBeam.position, { x: sweepExtent, duration: 0.82, ease: 'power1.inOut' }, 1.38);
        timeline.to(camera.position, { z: cameraHomeZ * 0.94, x: 0.08, duration: 1.25, ease: 'power2.inOut' }, 1.28);
        timeline.to(wordGroup.rotation, { y: -0.035, x: 0.018, duration: 1.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.4);
        timeline.timeScale(0.83);
      } else {
        onReady?.();
      }
      if (isInView && !document.hidden && !frame) frame = window.requestAnimationFrame(render);
    }, undefined, fail);

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      timeline?.kill();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      delete host.dataset.threeReady;
      listeners.forEach((remove) => remove());
      environmentTexture?.dispose();
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [onReady, variant]);

  return (
    <div ref={hostRef} className={`three-name-scene three-name-scene--${variant}${failed ? ' is-fallback' : ''}`} aria-hidden="true">
      {failed && <span className="three-name-fallback">MARCO MILAD</span>}
    </div>
  );
}
