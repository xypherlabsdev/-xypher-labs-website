import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { MotionValue } from 'motion/react';
import { X_H, X_W, roundedCorners, xPieces, type Pt } from '../lib/logo';
import { clamp01, easeInOutCubic, easeOutQuart, heroLayout, lerp } from '../lib/hooks';

export type PointerState = { x: number; y: number; inside: boolean };

type Props = {
  collapse: MotionValue<number>;
  copyBottom: number;
  pointer: React.RefObject<PointerState>;
  active: boolean;
  reduce: boolean;
};

// The bevel grows each piece outward, so the 3D pieces are cut with a wider gap
// to keep the visible gap close to the flat logo.
const BEVEL = 1;
const DEPTH = 11;
// Direction each piece drifts when the X "breathes" apart: chevron left, arms out to the right.
const DIRS: [number, number][] = [
  [-1, 0],
  [Math.SQRT1_2, Math.SQRT1_2],
  [Math.SQRT1_2, -Math.SQRT1_2],
];

function pieceShape(pts: Pt[]) {
  const corners = roundedCorners(pts, 1.6);
  // Centre the X on the origin and flip y, since three.js is y-up.
  const t = (p: Pt): [number, number] => [p[0] - X_W / 2, -(p[1] - X_H / 2)];
  const s = new THREE.Shape();
  s.moveTo(...t(corners[0].b));
  for (let i = 1; i <= corners.length; i++) {
    const k = corners[i % corners.length];
    s.lineTo(...t(k.a));
    s.quadraticCurveTo(...t(k.p), ...t(k.b));
  }
  return s;
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Pieces({ collapse, pointer, reduce, copyBottom }: Omit<Props, 'active'>) {
  const group = useRef<THREE.Group>(null);
  const floor = useRef<THREE.Mesh>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const size = useThree((s) => s.size);
  const motion = useRef({ rx: 0, ry: 0, spread: 0, start: -1 });

  const geometries = useMemo(
    () =>
      xPieces(4 + BEVEL * 2).map((pts) => {
        const g = new THREE.ExtrudeGeometry(pieceShape(pts), {
          depth: DEPTH,
          bevelEnabled: true,
          bevelThickness: 2.4,
          bevelSize: BEVEL,
          bevelSegments: 8,
          curveSegments: 12,
        });
        g.translate(0, 0, -DEPTH / 2);
        return g;
      }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#F8FAFC',
        roughness: 0.32,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.16,
        envMapIntensity: 0.9,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    },
    [geometries, material],
  );

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const m = motion.current;
    const now = state.clock.elapsedTime;
    if (m.start < 0) m.start = now;
    const intro = reduce ? 1 : easeOutQuart(clamp01((now - m.start - 0.15) / 1.7));
    const e = easeInOutCubic(clamp01(collapse.get()));
    const free = 1 - e;

    // Lay the X out in pixels, then convert to world units at z = 0.
    const L = heroLayout(size.width, size.height, copyBottom);
    const k = state.viewport.height / size.height;
    const widthPx = lerp(L.restW, L.iconW, e);
    g.scale.setScalar((widthPx * k) / X_W);
    g.position.set(lerp(L.restX, 0, e) * k, -lerp(L.restY, 0, e) * k, 0);
    // Keep the shadow-catching floor a fixed distance behind the X at any scale.
    if (floor.current) {
      floor.current.position.z = -g.scale.x * 24;
      (floor.current.material as THREE.ShadowMaterial).opacity = 0.28 * (1 - 0.55 * e);
    }

    const p = pointer.current ?? { x: 0, y: 0, inside: false };
    const damp = (cur: number, target: number, speed: number) => THREE.MathUtils.damp(cur, target, speed, dt);
    const idle = reduce ? 0 : 1;
    m.rx = damp(m.rx, (-p.y * 0.32 + Math.sin(now * 0.55) * 0.05 * idle) * free, 4);
    m.ry = damp(m.ry, (p.x * 0.5 + Math.sin(now * 0.37) * 0.09 * idle) * free, 4);
    g.rotation.set(m.rx + (1 - intro) * 0.5, m.ry - (1 - intro) * 1.1, (1 - intro) * 0.35);

    // Pieces start scattered, snap together, then breathe apart a little and open up under the pointer.
    m.spread = damp(m.spread, p.inside ? 1 : 0, 3);
    const breathe = reduce ? 0 : (Math.sin(now * 1.3) + 1) * 0.9;
    const spread = (1 - intro) * 70 + (2 + breathe + m.spread * 9) * free;
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const [dx, dy] = DIRS[i];
      mesh.position.set(dx * spread, dy * spread, (1 - intro) * (i === 0 ? -30 : 30));
      mesh.rotation.z = (1 - intro) * (i === 0 ? -0.6 : 0.6);
    });
  });

  return (
    <>
      <mesh ref={floor} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <shadowMaterial opacity={0.28} color="#0A1B66" />
      </mesh>
      <group ref={group}>
      {geometries.map((geo, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geo}
          material={material}
          castShadow
          receiveShadow
        />
      ))}
      </group>
    </>
  );
}

export default function HeroScene({ collapse, pointer, active, reduce, copyBottom }: Props) {
  // Phones and tablets get a lighter render: lower pixel ratio and a smaller shadow map.
  const light = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  return (
    <Canvas
      className="hero__canvas"
      frameloop={active ? 'always' : 'never'}
      dpr={light ? [1, 1.5] : [1, 2]}
      shadows
      camera={{ position: [0, 0, 12], fov: 28 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Environment />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[-4, 5, 7]}
        intensity={2.4}
        castShadow
        shadow-mapSize={light ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[5, -3, 4]} intensity={0.7} color="#AFC3FF" />
      <Pieces collapse={collapse} pointer={pointer} reduce={reduce} copyBottom={copyBottom} />
    </Canvas>
  );
}
