import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, PresentationControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, percentage }) {
    const { scene, nodes } = useGLTF(url);
    const liquidRef = useRef();

    // Tampilkan daftar nama objek di console biar lu bisa cek nama "Air"-nya
    useEffect(() => {
        console.log("DAFTAR OBJEK 3D LU (Cari nama airnya):", nodes);
    }, [nodes]);

    // Hitung faktor skala (0.01 sampai 1.0)
    const targetScale = Math.max(percentage / 100, 0.01);

    useFrame(() => {
        // --- GANTI "Liquid" DI BAWAH DENGAN NAMA OBJEK AIR LU ---
        // Kalau di console namanya "Cylinder002", ganti jadi nodes.Cylinder002
        const liquidMesh = nodes.Liquid || nodes.Cylinder || nodes.Object_4;

        if (liquidMesh) {
            // 1. Animasi Scaling Y (Bikin air menyusut)
            liquidMesh.scale.y = THREE.MathUtils.lerp(
                liquidMesh.scale.y, 
                targetScale, 
                0.05 // Kecepatan animasi (makin kecil makin halus)
            );

            // 2. Koreksi Posisi (Pivot Point Fix)
            // Biasanya model 3D kalo di-scale y, dia ngecil ke tengah.
            // Baris di bawah ini maksa airnya tetep nempel di dasar botol.
            // Angka 1.1 di bawah ini adalah tinggi setengah botol, lu bisa adjust.
            liquidMesh.position.y = - (1 - liquidMesh.scale.y) * 1.1;
        }
    });

    return <primitive object={scene} scale={1.5} position={[0, -0.5, 0]} />;
}

export default function InfusionModel({ percentage = 100 }) {
    return (
        <div className="w-full h-[450px] bg-slate-900 rounded-[32px] overflow-hidden relative border-4 border-slate-800 shadow-2xl">
            <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white text-xs font-black animate-pulse uppercase">Syncing Digital Twin...</div>}>
                <Canvas shadows dpr={[1, 2]}>
                    <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    
                    <PresentationControls global rotation={[0, 0.3, 0]} polar={[-Math.PI / 3, Math.PI / 3]}>
                        <Stage environment="city" intensity={0.5} contactShadow={false}>
                            <Model url="/Infus3D_brader.glb" percentage={percentage} />
                        </Stage>
                    </PresentationControls>
                    
                    <OrbitControls enableZoom={true} enablePan={false} />
                </Canvas>
            </Suspense>

            {/* Label Status */}
            <div className="absolute bottom-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-lg shadow-lg border-2 border-emerald-400">
                {Math.round(percentage)}%
            </div>
            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Live IoT Feedback</p>
            </div>
        </div>
    );
}