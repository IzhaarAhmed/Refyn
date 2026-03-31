import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../ThemeContext';

const PALETTES = {
  dark: {
    primary: '#8b5cf6', secondary: '#06b6d4', accent: '#a78bfa',
    warm: '#f43f5e', green: '#10b981',
    ambient: 0.3, lightIntensity: 0.6, particleOpacity: 0.5, shapeOpacity: 0.12,
  },
  light: {
    primary: '#7c3aed', secondary: '#0891b2', accent: '#8b5cf6',
    warm: '#e11d48', green: '#059669',
    ambient: 0.6, lightIntensity: 0.5, particleOpacity: 0.35, shapeOpacity: 0.1,
  },
};

/* Shared scroll ref — updated from a useEffect, read inside useFrame */
const scrollState = { progress: 0 };

function ScrollTracker() {
  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollState.progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}

/* Slowly drifting wireframe icosahedron */
function DriftingIcosahedron({ startPos, color, scale = 1, speed = 0.3 }) {
  const ref = useRef();
  const base = useRef(startPos);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollState.progress;
    ref.current.rotation.x = Math.sin(t * speed) * 0.5 + s * 2;
    ref.current.rotation.y += 0.003;
    ref.current.position.x = base.current[0] + Math.sin(t * 0.15 + base.current[0]) * 0.5;
    ref.current.position.y = base.current[1] + Math.sin(t * 0.2 + base.current[1]) * 0.4 - s * 3;
  });

  return (
    <mesh ref={ref} position={startPos} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} wireframe transparent opacity={0.15} />
    </mesh>
  );
}

/* Rotating octahedron */
function DriftingOctahedron({ startPos, color, scale = 1 }) {
  const ref = useRef();
  const base = useRef(startPos);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollState.progress;
    ref.current.rotation.y += 0.004;
    ref.current.rotation.z = Math.sin(t * 0.3) * 0.6 + s * 1.5;
    ref.current.position.x = base.current[0] + Math.cos(t * 0.12) * 0.4;
    ref.current.position.y = base.current[1] + Math.sin(t * 0.25) * 0.3 + s * 2;
  });

  return (
    <mesh ref={ref} position={startPos} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} wireframe transparent opacity={0.13} />
    </mesh>
  );
}

/* Pulsing distorted sphere */
function PulsingSphere({ startPos, color, scale = 1 }) {
  const ref = useRef();
  const base = useRef(startPos);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollState.progress;
    const sc = scale + Math.sin(t * 0.6) * 0.15;
    ref.current.scale.setScalar(sc);
    ref.current.position.x = base.current[0] + Math.sin(t * 0.1) * 0.3;
    ref.current.position.y = base.current[1] + Math.cos(t * 0.15) * 0.3 - s * 1.5;
    ref.current.rotation.y = t * 0.1 + s * 2;
  });

  return (
    <mesh ref={ref} position={startPos}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshDistortMaterial color={color} transparent opacity={0.09} distort={0.35} speed={1.5} />
    </mesh>
  );
}

/* Rotating torus ring */
function DriftingTorus({ startPos, color, scale = 1 }) {
  const ref = useRef();
  const base = useRef(startPos);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollState.progress;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.8 + s * 3;
    ref.current.rotation.z = t * 0.15;
    ref.current.position.x = base.current[0] + Math.sin(t * 0.08) * 0.5;
    ref.current.position.y = base.current[1] + Math.cos(t * 0.12) * 0.4 + s * 2;
  });

  return (
    <mesh ref={ref} position={startPos} scale={scale}>
      <torusGeometry args={[1, 0.03, 16, 80]} />
      <meshStandardMaterial color={color} transparent opacity={0.22} />
    </mesh>
  );
}

/* Torus knot */
function DriftingKnot({ startPos, color, scale = 0.4 }) {
  const ref = useRef();
  const base = useRef(startPos);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollState.progress;
    ref.current.rotation.y += 0.005;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.4;
    ref.current.position.x = base.current[0] + Math.cos(t * 0.1) * 0.3;
    ref.current.position.y = base.current[1] + Math.sin(t * 0.18) * 0.3 - s * 2;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
      <mesh ref={ref} position={startPos} scale={scale}>
        <torusKnotGeometry args={[1, 0.3, 100, 16]} />
        <MeshDistortMaterial color={color} transparent opacity={0.12} distort={0.15} speed={1} />
      </mesh>
    </Float>
  );
}

/* Orbiting dots around center */
function OrbitDots({ color, radius = 4, count = 6, opacity = 0.6 }) {
  const groupRef = useRef();

  useFrame((state) => {
    const s = scrollState.progress;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15 + s * 4;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.3;
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, Math.sin(angle) * 0.8, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={opacity} />
          </mesh>
        );
      })}
    </group>
  );
}

/* Wide particle field */
function BackgroundParticles({ count = 180, color, opacity = 0.4 }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return arr;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    const s = scrollState.progress;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015 + s * 0.5;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.03} transparent opacity={opacity} sizeAttenuation />
    </points>
  );
}

/* Subtle connecting lines */
function ConnectionLines({ color, opacity = 0.06 }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const x1 = (Math.random() - 0.5) * 18;
      const y1 = (Math.random() - 0.5) * 12;
      const z1 = (Math.random() - 0.5) * 8 - 2;
      pts.push(
        new THREE.Vector3(x1, y1, z1),
        new THREE.Vector3(x1 + (Math.random() - 0.5) * 6, y1 + (Math.random() - 0.5) * 5, z1 + (Math.random() - 0.5) * 4)
      );
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame((state) => {
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.03) * 0.15 + scrollState.progress * 0.5;
  });

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
}

export default function ThreeBackground() {
  const { theme } = useTheme();
  const c = PALETTES[theme] || PALETTES.dark;

  return (
    <div className="lp-three-bg">
      <ScrollTracker />
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={c.ambient} />
        <pointLight position={[8, 6, 8]} intensity={c.lightIntensity} color={c.primary} />
        <pointLight position={[-8, -4, 5]} intensity={c.lightIntensity * 0.6} color={c.secondary} />

        {/* Scattered shapes — visible in viewport, drift with scroll */}
        <DriftingIcosahedron startPos={[-7, 3, -3]} color={c.primary} scale={1.2} speed={0.25} />
        <DriftingIcosahedron startPos={[8, -2, -5]} color={c.accent} scale={0.8} speed={0.35} />
        <DriftingOctahedron startPos={[6, 4, -4]} color={c.secondary} scale={0.9} />
        <DriftingOctahedron startPos={[-8, -3, -3]} color={c.green} scale={0.7} />
        <PulsingSphere startPos={[-5, -4, -5]} color={c.warm} scale={0.8} />
        <PulsingSphere startPos={[7, 1, -6]} color={c.primary} scale={0.6} />
        <DriftingTorus startPos={[-6, 1, -2]} color={c.accent} scale={1.5} />
        <DriftingTorus startPos={[5, -3, -3]} color={c.secondary} scale={1.2} />
        <DriftingKnot startPos={[-4, -5, -3]} color={c.primary} scale={0.45} />
        <DriftingKnot startPos={[6, 5, -4]} color={c.warm} scale={0.35} />

        {/* Orbiting dots */}
        <OrbitDots color={c.primary} radius={5} count={8} opacity={c.particleOpacity} />
        <OrbitDots color={c.secondary} radius={3.5} count={5} opacity={c.particleOpacity * 0.7} />

        {/* Particles & lines */}
        <BackgroundParticles count={200} color={c.primary} opacity={c.particleOpacity} />
        <ConnectionLines color={c.primary} opacity={c.shapeOpacity * 0.6} />
        <ConnectionLines color={c.secondary} opacity={c.shapeOpacity * 0.4} />
      </Canvas>
    </div>
  );
}
