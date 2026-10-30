"use client";

import { Float, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import type { MotionValue } from "motion/react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { COLOR } from "./colors";

const W = 3.4; // card length
const H = 1.36; // card height
const D = 0.42; // shroud depth

/** A fan: a ring, seven swept blades and a hub, spinning faster while a pod is live. */
function Fan({ x, live, still }: { x: number; live: boolean; still: boolean }) {
  const rotor = useRef<THREE.Group>(null);
  const speed = useRef(2);
  useFrame((_, dt) => {
    if (!rotor.current || still) return;
    speed.current += ((live ? 22 : 5) - speed.current) * Math.min(dt * 1.5, 1);
    rotor.current.rotation.z -= dt * speed.current;
  });
  const blades = useMemo(() => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2), []);
  return (
    <group position={[x, 0, D / 2 + 0.005]}>
      <mesh>
        <torusGeometry args={[0.5, 0.035, 12, 64]} />
        <meshStandardMaterial color="#20232b" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <circleGeometry args={[0.49, 48]} />
        <meshStandardMaterial color="#050608" />
      </mesh>
      <group ref={rotor}>
        {blades.map((a) => (
          <mesh key={a} rotation={[0.35, 0, a]} position={[Math.cos(a) * 0.24, Math.sin(a) * 0.24, 0]}>
            <boxGeometry args={[0.36, 0.13, 0.012]} />
            <meshStandardMaterial color="#1a1d25" metalness={0.5} roughness={0.45} />
          </mesh>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.06, 32]} />
          <meshStandardMaterial color="#2a2e38" metalness={0.9} roughness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.032]}>
          <circleGeometry args={[0.06, 32]} />
          <meshBasicMaterial color={COLOR.accent} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Card({ live, still, scroll }: { live: boolean; still: boolean; scroll?: MotionValue<number> }) {
  const g = useRef<THREE.Group>(null);
  const strip = useRef<THREE.MeshBasicMaterial>(null);
  const fins = useMemo(() => Array.from({ length: 34 }, (_, i) => -W / 2 + 0.12 + (i * (W - 0.24)) / 33), []);
  const pins = useMemo(() => Array.from({ length: 26 }, (_, i) => -0.7 + i * 0.07), []);

  useFrame(({ pointer, clock }) => {
    if (!g.current) return;
    const s = scroll?.get() ?? 0.5;
    // Turns with the scroll, leans toward the pointer.
    const ry = still ? -0.45 : -0.9 + s * 1.4 + pointer.x * 0.35;
    const rx = still ? 0.18 : 0.28 - s * 0.3 - pointer.y * 0.25;
    g.current.rotation.y += (ry - g.current.rotation.y) * 0.08;
    g.current.rotation.x += (rx - g.current.rotation.x) * 0.08;
    if (strip.current) {
      const pulse = live ? 0.75 + Math.sin(clock.elapsedTime * 4) * 0.25 : 0.55;
      strip.current.color.set(live ? COLOR.live : COLOR.accent).multiplyScalar(still ? 1 : pulse * 1.6);
    }
  });

  return (
    <group ref={g}>
      {/* Shroud */}
      <RoundedBox args={[W, H, D]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#14161c" metalness={0.85} roughness={0.32} />
      </RoundedBox>
      {/* Faceted trim lines on the shroud */}
      {[-1, 1].map((k) => (
        <mesh key={k} position={[0, k * (H / 2 - 0.1), D / 2 + 0.003]}>
          <planeGeometry args={[W - 0.3, 0.012]} />
          <meshBasicMaterial color="#3a3f4d" />
        </mesh>
      ))}
      <Fan x={-0.82} live={live} still={still} />
      <Fan x={0.82} live={live} still={still} />
      {/* Light strip along the top edge */}
      <mesh position={[0, H / 2 + 0.006, 0.02]}>
        <boxGeometry args={[W - 0.5, 0.02, 0.06]} />
        <meshBasicMaterial ref={strip} color={COLOR.accent} toneMapped={false} />
      </mesh>
      {/* Heatsink fins behind the shroud */}
      {fins.map((x) => (
        <mesh key={x} position={[x, 0, -D / 2 - 0.16]}>
          <boxGeometry args={[0.02, H - 0.18, 0.3]} />
          <meshStandardMaterial color="#8a8f9c" metalness={1} roughness={0.28} />
        </mesh>
      ))}
      {/* Backplate and PCB */}
      <mesh position={[0, 0, -D / 2 - 0.34]}>
        <boxGeometry args={[W, H, 0.04]} />
        <meshStandardMaterial color="#0c0d11" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, -H / 2 - 0.06, -D / 2 - 0.17]}>
        <boxGeometry args={[W - 0.2, 0.12, 0.05]} />
        <meshStandardMaterial color="#0f2a1e" roughness={0.7} />
      </mesh>
      {/* PCIe contacts */}
      {pins.map((x) => (
        <mesh key={x} position={[x, -H / 2 - 0.15, -D / 2 - 0.17]}>
          <boxGeometry args={[0.04, 0.09, 0.052]} />
          <meshStandardMaterial color="#c9a227" metalness={1} roughness={0.25} />
        </mesh>
      ))}
      {/* I/O bracket */}
      <mesh position={[-W / 2 - 0.03, 0, -0.1]}>
        <boxGeometry args={[0.04, H + 0.25, 0.7]} />
        <meshStandardMaterial color="#9aa0ad" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Pulls the camera back on narrow screens so the whole card fits. */
function Fit() {
  const { camera, size } = useThree();
  useFrame(() => {
    const aspect = size.width / size.height;
    const z = aspect < 1.5 ? 5.2 * (1.5 / Math.max(aspect, 0.4)) : 5.2;
    camera.position.z += (z - camera.position.z) * 0.2;
  });
  return null;
}

/** An interactive 3D GPU card. Its fans spin up while a real pod is live. */
export default function GpuCard({ live, still, scroll }: { live: boolean; still: boolean; scroll?: MotionValue<number> }) {
  return (
    <Canvas camera={{ position: [0, 0.2, 5.2], fov: 36 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} aria-hidden>
      <Fit />
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-4, -2, 3]} intensity={0.6} color={COLOR.peri} />
      <pointLight position={[0, 2.5, -2]} intensity={14} color={COLOR.accent} distance={8} />
      <pointLight position={[-3, -1, 2]} intensity={6} color="#ffffff" distance={7} />
      <Float speed={still ? 0 : 1.4} rotationIntensity={0.15} floatIntensity={still ? 0 : 0.5}>
        <Card live={live} still={still} scroll={scroll} />
      </Float>
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
