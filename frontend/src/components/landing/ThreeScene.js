import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../ThemeContext';

/* Color palettes per theme */
const PALETTES = {
  dark: {
    cube: '#8b5cf6',
    sphere: '#a78bfa',
    panel1: '#10b981',
    panel2: '#06b6d4',
    panel3: '#f43f5e',
    particles: '#8b5cf6',
    ring: '#06b6d4',
    torus: '#a78bfa',
    light1: '#a78bfa',
    light2: '#06b6d4',
    ambient: 0.4,
    particleOpacity: 0.6,
  },
  light: {
    cube: '#7c3aed',
    sphere: '#8b5cf6',
    panel1: '#059669',
    panel2: '#0891b2',
    panel3: '#e11d48',
    particles: '#7c3aed',
    ring: '#0891b2',
    torus: '#8b5cf6',
    light1: '#8b5cf6',
    light2: '#0891b2',
    ambient: 0.7,
    particleOpacity: 0.45,
  },
};

/* Rotating code cube with glowing edges */
function CodeCube({ colors }) {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + 0.3;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshStandardMaterial
          color={colors.cube}
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      {/* Inner glowing sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color={colors.sphere}
          transparent
          opacity={0.3}
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

/* Floating code card panels */
function FloatingPanel({ position, rotation, color, scale = 1 }) {
  const meshRef = useRef();
  useFrame((state) => {
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[1.6, 1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.12}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* Orbiting ring */
function OrbitRing({ colors }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.3 + 0.8;
    ref.current.rotation.z = state.clock.elapsedTime * 0.15;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <torusGeometry args={[3, 0.02, 16, 100]} />
      <meshStandardMaterial color={colors.ring} transparent opacity={0.25} />
    </mesh>
  );
}

/* Small floating torus knot */
function FloatingKnot({ colors }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y += 0.008;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    ref.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 0.6) * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={ref} position={[2.8, -1.5, -0.5]} scale={0.3}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <MeshDistortMaterial
          color={colors.torus}
          transparent
          opacity={0.2}
          distort={0.2}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

/* Orbiting small spheres */
function OrbitingSpheres({ colors }) {
  const groupRef = useRef();
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        const r = 2.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, Math.sin(angle) * 0.5, Math.sin(angle) * r]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color={colors.sphere} emissive={colors.sphere} emissiveIntensity={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

/* Particle field background */
function Particles({ count = 100, colors }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, [count]);

  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={colors.particles} size={0.03} transparent opacity={colors.particleOpacity} sizeAttenuation />
    </points>
  );
}

/* Main 3D scene component */
export default function ThreeScene() {
  const { theme } = useTheme();
  const colors = PALETTES[theme] || PALETTES.dark;

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={colors.ambient} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color={colors.light1} />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color={colors.light2} />

      <CodeCube colors={colors} />
      <OrbitRing colors={colors} />
      <FloatingKnot colors={colors} />
      <OrbitingSpheres colors={colors} />

      {/* Floating diff panels */}
      <FloatingPanel position={[-2.5, 0.8, -1]} rotation={[0.1, 0.3, 0.05]} color={colors.panel1} scale={0.8} />
      <FloatingPanel position={[2.5, -0.5, -1.5]} rotation={[-0.1, -0.2, -0.05]} color={colors.panel2} scale={0.7} />
      <FloatingPanel position={[1.8, 1.2, -2]} rotation={[0.05, 0.5, 0.1]} color={colors.panel3} scale={0.6} />

      <Particles count={100} colors={colors} />
    </Canvas>
  );
}
