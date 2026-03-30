'use client';

import React, { useEffect, useState } from 'react';

export default function Confetti() {
    const [pieces, setPieces] = useState<{ id: number; x: number; y: number; color: string; size: number; rotation: number; speed: number }[]>([]);

    useEffect(() => {
        const colors = ['#FFBF00', '#FFFFFF', '#0A192F', '#4ADE80', '#60A5FA'];
        const newPieces = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            speed: Math.random() * 0.5 + 0.5
        }));
        setTimeout(() => setPieces(newPieces), 0);

        const interval = setInterval(() => {
            setPieces(prev => prev.map(p => ({
                ...p,
                y: p.y + p.speed,
                rotation: p.rotation + 2
            })).filter(p => p.y < 110));
        }, 16);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {pieces.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        transform: `rotate(${p.rotation}deg)`,
                        opacity: 1 - (p.y / 110)
                    }}
                />
            ))}
        </div>
    );
}
