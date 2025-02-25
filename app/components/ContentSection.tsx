import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ContentSectionProps {
  position: [number, number, number];
  title: string;
  description: string;
  color?: string;
  visible?: boolean;
}

const ContentSection: React.FC<ContentSectionProps> = ({ 
  position, 
  title, 
  description, 
  color = "#ffffff", 
  visible = true 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // コンテンツをゆっくり回転
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (planetRef.current) {
      // 惑星自体をゆっくり回転
      planetRef.current.rotation.y += 0.002;
    }
  });

  // タイトルに基づいて惑星の種類を決定
  const getPlanetMaterial = () => {
    switch (title.toLowerCase()) {
      case 'vision':
        // 太陽風のような効果
        return (
          <meshStandardMaterial
            color="#ff6b00"
            emissive="#ff4400"
            emissiveIntensity={2}
            roughness={0.7}
          />
        );
      case 'value':
        // 木星風の縞模様
        return (
          <meshStandardMaterial
            color="#cd8500"
            metalness={0.3}
            roughness={0.7}
          />
        );
      default:
        // その他の惑星（火星風）
        return (
          <meshStandardMaterial
            color="#c1440e"
            metalness={0.2}
            roughness={0.8}
          />
        );
    }
  };

  return (
    <group ref={groupRef} position={position} visible={visible}>
      {/* タイトル */}
      <Text
        position={[0, 1, 0]}
        fontSize={1}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {title}
      </Text>
      
      {/* 説明文 */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        maxWidth={5}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {description}
      </Text>
      
      {/* 惑星の装飾 */}
      <group position={[0, -1, 0]}>
        {/* 惑星本体 */}
        <mesh ref={planetRef}>
          <sphereGeometry args={[0.8, 32, 32]} />
          {getPlanetMaterial()}
        </mesh>

        {/* 光の輪（太陽の場合） */}
        {title.toLowerCase() === 'vision' && (
          <mesh position={[0, 0, -0.1]}>
            <ringGeometry args={[1.2, 1.4, 32]} />
            <meshBasicMaterial
              color="#ff6b00"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 木星の輪（Valueの場合） */}
        {title.toLowerCase() === 'value' && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.1, 1.3, 64]} />
            <meshStandardMaterial
              color="#a67000"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default ContentSection; 