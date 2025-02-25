import React, { useMemo, useState, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Stars, PerspectiveCamera, useScroll } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Spaceship from './Spaceship';
import ContentSection from './ContentSection';
import * as THREE from 'three';

interface Section {
  title: string;
  description: string;
  color: string;
}

// スクロールに応じてカメラと宇宙船を制御するコンポーネント
const ScrollController: React.FC<{ sections: Section[] }> = ({ sections }) => {
  const { camera } = useThree();
  const scroll = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);
  const cameraPathRef = useRef({
    curve: new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 2, -15),
      new THREE.Vector3(-5, -3, -30),
      new THREE.Vector3(10, 5, -45), // 急カーブ
      new THREE.Vector3(0, 0, -60),
      new THREE.Vector3(-15, 8, -75), // 90度近い旋回
      new THREE.Vector3(-5, -5, -90),
      new THREE.Vector3(8, 3, -105),
      new THREE.Vector3(0, 0, -120),
    ]),
  });
  
  // スクロール位置に基づいて表示するセクションを決定
  const visibleSectionIndex = useMemo(() => {
    return Math.floor(scrollProgress * sections.length);
  }, [scrollProgress, sections.length]);
  
  // 宇宙の小惑星を生成（より多く、より広範囲に）
  const asteroids = useMemo(() => {
    const items = [];
    for (let i = 0; i < 80; i++) {
      const position = [
        Math.random() * 60 - 30,
        Math.random() * 60 - 30,
        -(Math.random() * 120 + 5)
      ];
      const rotation = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ];
      const scale = Math.random() * 0.5 + 0.1;
      const speed = Math.random() * 0.5 + 0.2; // 回転速度
      
      items.push({ position, rotation, scale, speed });
    }
    return items;
  }, []);
  
  // 小惑星の回転用ref
  const asteroidsRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    // スクロール進捗を更新
    const current = scroll.offset;
    setScrollProgress(current);
    
    // カーブに沿ってカメラを移動
    const curveProgress = current * 0.99; // 0-1の範囲に制限
    const point = cameraPathRef.current.curve.getPoint(curveProgress);
    
    // カメラの位置を更新
    camera.position.set(point.x, point.y, point.z);
    
    // カメラの向きをカーブの接線方向に合わせる
    const tangent = cameraPathRef.current.curve.getTangent(curveProgress);
    const lookAtPoint = new THREE.Vector3().copy(point).add(tangent.multiplyScalar(10));
    camera.lookAt(lookAtPoint);
    
    // カメラを少し傾ける（疾走感を出す）
    camera.rotation.z = Math.sin(current * Math.PI * 4) * 0.1;
    
    // 小惑星を回転させる
    if (asteroidsRef.current) {
      asteroidsRef.current.children.forEach((asteroid, i) => {
        const speed = (asteroids[i]?.speed || 0.2);
        asteroid.rotation.x += 0.01 * speed;
        asteroid.rotation.y += 0.01 * speed;
      });
    }
  });
  
  // セクションの位置をカーブに沿って配置
  const sectionPositions = useMemo(() => {
    return sections.map((_, index) => {
      const progress = (index + 0.5) / sections.length;
      return cameraPathRef.current.curve.getPoint(progress);
    });
  }, [sections]);
  
  return (
    <>
      <Spaceship 
        scrollProgress={scrollProgress} 
        position={[0, -1, camera.position.z - 5]} // カメラの少し前に配置
      />
      
      {/* 小惑星ベルト */}
      <group ref={asteroidsRef}>
        {asteroids.map((asteroid, i) => (
          <mesh 
            key={i} 
            position={asteroid.position as [number, number, number]} 
            rotation={asteroid.rotation as [number, number, number]}
            scale={asteroid.scale}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial 
              color="#888888" 
              roughness={0.8} 
              metalness={0.2} 
            />
          </mesh>
        ))}
      </group>
      
      {/* コンテンツセクションを配置（カーブに沿って） */}
      {sections.map((section, index) => (
        <ContentSection
          key={index}
          position={[
            sectionPositions[index].x,
            sectionPositions[index].y + 2, // 少し上に配置
            sectionPositions[index].z
          ]}
          title={section.title}
          description={section.description}
          color={section.color}
          visible={Math.abs(index - visibleSectionIndex) <= 1}
        />
      ))}
      
      {/* カーブの可視化（デバッグ用、必要に応じてコメントアウト） */}
      {/* <CurvePath curve={cameraPathRef.current.curve} /> */}
    </>
  );
};

// カーブを可視化するコンポーネント（デバッグ用）
export const CurvePath: React.FC<{ curve: THREE.CatmullRomCurve3 }> = ({ curve }) => {
  const points = curve.getPoints(50);
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="red" />
    </line>
  );
};

// 宇宙の星を生成するコンポーネント
const SpaceBackground: React.FC = () => {
  // 大きな星のリファレンス
  const starsRef = useRef<THREE.Group>(null);
  const sunFlareRef = useRef<THREE.Group>(null);
  
  // 大きな星を生成
  const bigStars = useMemo(() => {
    const stars = [];
    // 少ない数の大きな星を生成
    for (let i = 0; i < 8; i++) {
      const position = [
        Math.random() * 80 - 40,
        Math.random() * 80 - 40,
        -(Math.random() * 150 + 20)
      ];
      // より大きなサイズ
      const size = Math.random() * 3 + 2;
      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5 + Math.random() * 0.5);
      const type = Math.floor(Math.random() * 4); // 0: 通常の星, 1: 太陽型, 2: 木星型, 3: 月型(クレーター)
      const rotationSpeed = Math.random() * 0.002 + 0.001;
      
      stars.push({ position, size, color: color.getHexString(), type, rotationSpeed });
    }
    return stars;
  }, []);
  
  // 太陽の炎エフェクト用
  useFrame((state) => {
    if (sunFlareRef.current) {
      sunFlareRef.current.children.forEach((flare) => {
        // 炎の動きをシミュレート
        flare.scale.x = 1 + Math.sin(state.clock.elapsedTime * 2 + flare.position.x) * 0.2;
        flare.scale.y = 1 + Math.cos(state.clock.elapsedTime * 3 + flare.position.y) * 0.3;
      });
    }
    
    if (starsRef.current) {
      // 各星を個別に回転
      starsRef.current.children.forEach((star, i) => {
        if (bigStars[i]) {
          star.rotation.y += bigStars[i].rotationSpeed;
        }
      });
    }
  });
  
  return (
    <>
      <Stars radius={150} depth={80} count={8000} factor={6} saturation={0.5} fade speed={1} />
      <fog attach="fog" args={['#000', 10, 80]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* 大きな星のグループ */}
      <group ref={starsRef}>
        {bigStars.map((star, i) => (
          <group key={i} position={star.position as [number, number, number]}>
            {/* 星本体 */}
            <mesh>
              {star.type === 3 ? (
                // クレーターのある月型
                <sphereGeometry args={[star.size, 32, 32]} />
              ) : (
                <sphereGeometry args={[star.size, 32, 32]} />
              )}
              
              {star.type === 1 ? (
                // 太陽型の星
                <meshStandardMaterial 
                  color={`#${star.color}`} 
                  emissive={`#${star.color}`} 
                  emissiveIntensity={2}
                  roughness={0.4}
                />
              ) : star.type === 2 ? (
                // 木星型の縞模様
                <meshStandardMaterial 
                  color={`#${star.color}`}
                  roughness={0.7}
                  metalness={0.2}
                  bumpScale={0.5}
                />
              ) : star.type === 3 ? (
                // 月型（クレーター）
                <meshStandardMaterial 
                  color="#aaaaaa"
                  roughness={1}
                  metalness={0.1}
                  bumpScale={0.8}
                />
              ) : (
                // 通常の星
                <meshStandardMaterial 
                  color={`#${star.color}`} 
                  emissive={`#${star.color}`} 
                  emissiveIntensity={0.5} 
                />
              )}
            </mesh>
            
            {/* 太陽型の星には炎のエフェクト */}
            {star.type === 1 && (
              <group ref={sunFlareRef}>
                {Array.from({ length: 8 }).map((_, j) => (
                  <mesh 
                    key={j} 
                    position={[
                      Math.sin(j / 8 * Math.PI * 2) * (star.size + 0.5),
                      Math.cos(j / 8 * Math.PI * 2) * (star.size + 0.5),
                      0
                    ]}
                  >
                    <sphereGeometry args={[star.size * 0.4, 16, 16]} />
                    <meshBasicMaterial 
                      color={`#${star.color}`} 
                      transparent 
                      opacity={0.6} 
                    />
                  </mesh>
                ))}
                
                {/* 太陽コロナ */}
                <mesh>
                  <sphereGeometry args={[star.size * 1.5, 32, 32]} />
                  <meshBasicMaterial 
                    color={`#${star.color}`} 
                    transparent 
                    opacity={0.2} 
                  />
                </mesh>
              </group>
            )}
            
            {/* 木星型の星には環 */}
            {star.type === 2 && (
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <ringGeometry args={[star.size * 1.5, star.size * 2, 64]} />
                <meshStandardMaterial 
                  color={`#${star.color}`} 
                  transparent 
                  opacity={0.7} 
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            
            {/* 月型の星にはクレーター */}
            {star.type === 3 && Array.from({ length: 12 }).map((_, j) => (
              <mesh 
                key={j} 
                position={[
                  Math.random() * star.size * 1.5 - star.size * 0.75,
                  Math.random() * star.size * 1.5 - star.size * 0.75,
                  Math.random() * star.size * 0.5 + star.size * 0.5
                ]}
                rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
              >
                <cylinderGeometry args={[star.size * 0.2, star.size * 0.3, star.size * 0.1, 16]} />
                <meshStandardMaterial 
                  color="#666666" 
                  roughness={1}
                />
              </mesh>
            ))}
            
            {/* 星の光 */}
            <pointLight 
              distance={star.size * 20} 
              intensity={star.type === 1 ? 5 : 2} 
              color={`#${star.color}`} 
            />
          </group>
        ))}
      </group>
    </>
  );
};

// メインの宇宙シーンコンポーネント
const SpaceScene: React.FC = () => {
  // コンテンツセクションのデータ
  const sections: Section[] = [
    {
      title: "ミッション",
      description: "宇宙の謎を解き明かし、人類の可能性を広げる",
      color: "#ff9900"
    },
    {
      title: "ビジョン",
      description: "すべての人が宇宙の恩恵を受けられる未来を創造する",
      color: "#00aaff"
    },
    {
      title: "バリュー",
      description: "探求心、協力、革新、持続可能性を大切にします",
      color: "#44cc44"
    },
    {
      title: "チーム",
      description: "多様なバックグラウンドを持つ専門家たちが集結",
      color: "#ff44aa"
    },
    {
      title: "お問い合わせ",
      description: "新たな冒険に一緒に出かけましょう",
      color: "#ffffff"
    }
  ];

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
      <SpaceBackground />
      
      <ScrollController sections={sections} />
      
      {/* ポストプロセッシングエフェクト */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
      </EffectComposer>
    </>
  );
};

export default SpaceScene; 