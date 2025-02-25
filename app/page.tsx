'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import SpaceScene from './components/SpaceScene';
import './globals.css';

export default function Home() {
  return (
    <main className="app">
      <Canvas style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh' }} shadows>
        <ScrollControls pages={5} damping={0.25} distance={1}>
          <SpaceScene />
        </ScrollControls>
      </Canvas>
      
      {/* スクロール用のダミーコンテンツ - スクロール可能な領域を作成 */}
      <div style={{ height: '500vh', position: 'relative', pointerEvents: 'none' }} />
      
      {/* オプション: スクロールガイド */}
      <div className="scroll-guide">
        スクロールして宇宙を探検しよう
      </div>
    </main>
  );
}
