"use client";

import { Html, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import land from "./land.json";

/** Colours from brand.md. */
import { COLOR } from "./colors";

export { COLOR };

const R = 1; // globe radius
const RING_R = 1.42;
const RING_TILT = new THREE.Euler(Math.PI / 2.6, 0, Math.PI / 9);

export interface EngineNode {
  id: string;
  gpu: string;
  lat: number;
  lon: number;
  city: string | null;
  country: string | null;
  pricePerGpuHour: number;
  gpus: number;
}
export interface EnginePod {
  id: string;
  lat: number;
  lon: number;
  status: "starting" | "running";
  gpu: string;
}
/** A moment to draw: a payment on the ring, or a beam to a node. */
export interface EnginePulse {
  key: string;
  kind: "payment" | "beam";
  color: string;
  lat?: number;
  lon?: number;
  /** performance.now() when it started. */
  at: number;
}

export function toVec3(lat: number, lon: number, r = R): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/** Round, soft-edged dots (PointsMaterial draws squares). */
function dotMaterial(color: string, size: number, opacity: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uOpacity: { value: opacity },
    },
    vertexShader: `
      uniform float uSize;
      varying float vFacing;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        // Dim the dots on the far side of the globe instead of hiding them.
        vec3 n = normalize(mat3(modelViewMatrix) * normalize(position));
        vFacing = smoothstep(-0.2, 0.45, n.z);
        gl_PointSize = uSize * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vFacing;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.15, d) * uOpacity * mix(0.12, 1.0, vFacing);
        gl_FragColor = vec4(uColor, a);
      }`,
  });
}

function Land() {
  const geo = useMemo(() => {
    const pts = land as number[];
    const pos = new Float32Array((pts.length / 2) * 3);
    for (let i = 0; i < pts.length; i += 2) {
      const v = toVec3(pts[i]!, pts[i + 1]!, R * 1.002);
      pos.set([v.x, v.y, v.z], (i / 2) * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const mat = useMemo(() => dotMaterial("#9DB0FF", 0.022, 0.7), []);
  return <points geometry={geo} material={mat} />;
}

/** Fresnel glow around the globe. */
function Atmosphere() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#4360FF") } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uColor; varying vec3 vN; void main(){ // Back faces: brightest at the globe's edge, gone at the shell's rim.
        float i = pow(clamp(-dot(vN, vec3(0,0,1.0)) / 0.57, 0.0, 1.0), 3.0) * 0.5; gl_FragColor = vec4(uColor * i, i); }`,
      }),
    [],
  );
  return (
    <>
      <mesh>
        <sphereGeometry args={[R * 0.995, 64, 64]} />
        <meshBasicMaterial color="#07080A" />
      </mesh>
      <mesh scale={1.22} material={mat}>
        <sphereGeometry args={[R, 64, 64]} />
      </mesh>
    </>
  );
}

/** Real Lium nodes; cheap ones glow white, pricier ones turn blue. Hover for details. */
function Nodes({ nodes }: { nodes: EngineNode[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const [hover, setHover] = useState<number | null>(null);
  const placed = useMemo(
    () => nodes.map((n) => ({ n, v: toVec3(n.lat, n.lon, R * 1.012) })),
    [nodes],
  );
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const tmp = new THREE.Object3D();
    const prices = nodes.map((n) => n.pricePerGpuHour).sort((a, b) => a - b);
    const p90 = prices[Math.floor(prices.length * 0.9)] ?? 1;
    placed.forEach(({ n, v }, i) => {
      tmp.position.copy(v);
      tmp.scale.setScalar(0.6 + Math.min(n.gpus, 8) * 0.08);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      const t = Math.min(n.pricePerGpuHour / p90, 1);
      m.setColorAt(
        i,
        new THREE.Color("#FFFFFF").lerp(new THREE.Color(COLOR.accent), t),
      );
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [placed, nodes]);
  const h = hover !== null ? placed[hover] : undefined;
  return (
    <>
      <instancedMesh
        key={placed.length}
        ref={ref}
        args={[undefined, undefined, Math.max(placed.length, 1)]}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => (
          e.stopPropagation(),
          setHover(e.instanceId ?? null)
        )}
        onPointerOut={() => setHover(null)}
      >
        <sphereGeometry args={[0.011, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {h && (
        <Html
          position={h.v}
          center
          distanceFactor={6}
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className="engine-tip">
            <b>{h.n.gpu.replace(/^NVIDIA (GeForce )?/, "")}</b>
            <span>{[h.n.city, h.n.country].filter(Boolean).join(", ")}</span>
            <span className="num">
              ${h.n.pricePerGpuHour.toFixed(2)}/h · {h.n.gpus} free
            </span>
          </div>
        </Html>
      )}
    </>
  );
}

/** A light pillar standing on each live pod's real location. */
function Pillar({ pod }: { pod: EnginePod }) {
  const ref = useRef<THREE.Group>(null);
  const base = useMemo(() => toVec3(pod.lat, pod.lon, R), [pod.lat, pod.lon]);
  const quat = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        base.clone().normalize(),
      ),
    [base],
  );
  const color = pod.status === "running" ? COLOR.live : COLOR.amber;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 3) * 0.08;
    ref.current.scale.set(s, 1, s);
  });
  return (
    <group position={base} quaternion={quat}>
      <group ref={ref}>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.004, 0.012, 0.32, 12, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.9}
            toneMapped={false}
          />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.02, 0.034, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** The x402 ring: a tilted orbit with ambient traffic; payments race around it as comets. */
function PaymentRing({
  pulses,
  still,
}: {
  pulses: EnginePulse[];
  still: boolean;
}) {
  const traffic = useRef<THREE.InstancedMesh>(null);
  const count = 46;
  const curve = useMemo(
    () =>
      new THREE.EllipseCurve(0, 0, RING_R, RING_R, 0, Math.PI * 2, false, 0),
    [],
  );
  const ringPts = useMemo(
    () => curve.getPoints(180).map((p) => new THREE.Vector3(p.x, p.y, 0)),
    [curve],
  );
  const comets = pulses.filter((p) => p.kind === "payment");
  const cometRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    const m = traffic.current;
    if (m) {
      const tmp = new THREE.Object3D();
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + t * 0.12;
        tmp.position.set(Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0);
        tmp.scale.setScalar(0.5 + 0.5 * Math.sin(i * 1.7 + t));
        tmp.updateMatrix();
        m.setMatrixAt(i, tmp.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    const now = performance.now();
    comets.forEach((c, i) => {
      const mesh = cometRefs.current[i];
      if (!mesh) return;
      const p = Math.min((now - c.at) / 2200, 1);
      const a = p * Math.PI * 2.2;
      mesh.position.set(Math.cos(a) * RING_R, Math.sin(a) * RING_R, 0);
      mesh.scale.setScalar((1 - p) * 2.4 + 0.2);
      (mesh.material as THREE.MeshBasicMaterial).opacity = 1 - p;
    });
  });
  return (
    <group rotation={RING_TILT}>
      <Line
        points={ringPts}
        color="#9DB0FF"
        lineWidth={1}
        transparent
        opacity={0.35}
      />
      <instancedMesh ref={traffic} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.006, 8, 8]} />
        <meshBasicMaterial
          color="#C9D3FF"
          transparent
          opacity={0.7}
          toneMapped={false}
        />
      </instancedMesh>
      {comets.map((c, i) => (
        <mesh key={c.key} ref={(el) => void (cometRefs.current[i] = el)}>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color={c.color} transparent toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A beam arcing from the ring to a node's real location. */
function Beam({ pulse }: { pulse: EnginePulse }) {
  const line = useRef<{
    material: { dashOffset: number; opacity: number };
  } | null>(null);
  const pts = useMemo(() => {
    const end = toVec3(pulse.lat!, pulse.lon!, R * 1.01);
    const start = new THREE.Vector3(RING_R, 0, 0).applyEuler(RING_TILT);
    const mid = start
      .clone()
      .add(end)
      .multiplyScalar(0.5)
      .normalize()
      .multiplyScalar(1.9);
    return new THREE.QuadraticBezierCurve3(start, mid, end).getPoints(48);
  }, [pulse.lat, pulse.lon]);
  useFrame(() => {
    if (!line.current) return;
    const p = Math.min((performance.now() - pulse.at) / 3200, 1);
    line.current.material.dashOffset = -p * 2;
    line.current.material.opacity = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25;
  });
  return (
    <Line
      ref={line as never}
      points={pts}
      color={pulse.color}
      lineWidth={2.2}
      dashed
      dashSize={0.5}
      gapSize={0.5}
      transparent
      toneMapped={false}
    />
  );
}

function Scene({
  nodes,
  pods,
  pulses,
  still,
}: {
  nodes: EngineNode[];
  pods: EnginePod[];
  pulses: EnginePulse[];
  still: boolean;
}) {
  const world = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (world.current && !still) world.current.rotation.y += dt * 0.045;
  });
  return (
    <>
      <group ref={world} rotation={[0.32, -1.9, 0]}>
        <Atmosphere />
        <Land />
        <Nodes nodes={nodes} />
        {pods.map((p) => (
          <Pillar key={p.id} pod={p} />
        ))}
        {pulses
          .filter((p) => p.kind === "beam" && p.lat !== undefined)
          .map((p) => (
            <Beam key={p.key} pulse={p} />
          ))}
      </group>
      <PaymentRing pulses={pulses} still={still} />
      <EffectComposer>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function Engine(props: {
  nodes: EngineNode[];
  pods: EnginePod[];
  pulses: EnginePulse[];
  still: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 4.1], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <Scene {...props} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.45}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.72}
      />
    </Canvas>
  );
}
