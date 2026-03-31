import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/* Rotating code cube with glowing edges */
function CodeCube() {
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
          color="#8b5cf6"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      {/* Inner glowing sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <MeshDistortMaterial
          color="#a78bfa"
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

/* Particle field background */
function Particles({ count = 100 }) {
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
      <pointsMaterial color="#8b5cf6" size={0.03} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* Main 3D scene component */
export default function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ width: '100%', height: '100%' }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#a78bfa" />
      <pointLight position={[-5, -3, 3]} intensity={0.4} color="#06b6d4" />

      <CodeCube />

      {/* Floating diff panels */}
      <FloatingPanel position={[-2.5, 0.8, -1]} rotation={[0.1, 0.3, 0.05]} color="#10b981" scale={0.8} />
      <FloatingPanel position={[2.5, -0.5, -1.5]} rotation={[-0.1, -0.2, -0.05]} color="#06b6d4" scale={0.7} />
      <FloatingPanel position={[1.8, 1.2, -2]} rotation={[0.05, 0.5, 0.1]} color="#f43f5e" scale={0.6} />

      <Particles count={80} />
    </Canvas>
  );
}
