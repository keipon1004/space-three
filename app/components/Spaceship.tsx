import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpaceshipProps {
  scrollProgress: number;
  position: [number, number, number];
}

const Spaceship: React.FC<SpaceshipProps> = ({ scrollProgress, position }) => {
  const shipRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);

  useFrame(() => {
    if (shipRef.current) {
      // 宇宙船の傾きをスクロールに応じて変更
      shipRef.current.rotation.z = Math.sin(scrollProgress * Math.PI * 4) * 0.2;
      shipRef.current.rotation.x = Math.sin(scrollProgress * Math.PI * 2) * 0.1;
      
      // エンジンの光を点滅させる
      if (engineGlowRef.current) {
        engineGlowRef.current.intensity = 2 + Math.sin(Date.now() * 0.01) * 0.5;
      }
    }
  });

  return (
    <group ref={shipRef} position={position} rotation={[0, Math.PI / 2, 0]}>
      {/* 機体本体 */}
      <mesh>
        <coneGeometry args={[0.2, 1, 4]} /> {/* 先端部分 */}
        <meshStandardMaterial color="#e8e8e8" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* コックピット */}
      <mesh position={[0.1, 0.15, 0]}>
        <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 主翼 */}
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.05, 0.6]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 垂直尾翼 */}
      <mesh position={[-0.4, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.05]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* エンジン部分 */}
      <mesh position={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.3, 16]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* エンジンの炎 */}
      <mesh position={[-0.65, 0, 0]}>
        <coneGeometry args={[0.1, 0.4, 16]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff4400"
          emissiveIntensity={2}
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* エンジンの光 */}
      <pointLight
        ref={engineGlowRef}
        position={[-0.65, 0, 0]}
        color="#ff4400"
        intensity={2}
        distance={3}
      />

      {/* 装飾的なパネルライン */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[0.6, 0.02, 0.02]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.2]}>
        <boxGeometry args={[0.6, 0.02, 0.02]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

export default Spaceship; 