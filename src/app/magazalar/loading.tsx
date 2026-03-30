import React from 'react';
import Header from '@/components/Header';
import Skeleton from '@/components/ui/Skeleton';

export default function StoresLoading() {
    return (
        <main className="bg-[#0A192F] min-h-screen text-white">
            <Header />

            <div className="pt-32 lg:pt-48 pb-20 px-6 lg:px-12">
                <div className="max-w-[1400px] mx-auto">
                    {/* Header Skeleton */}
                    <div className="mb-16">
                        <Skeleton className="w-24 h-4 mb-3" />
                        <Skeleton className="w-64 h-16 lg:h-20 mb-4" />
                        <Skeleton className="w-full max-w-xl h-6" />
                    </div>

                    {/* Stores Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="glass rounded-[40px] border border-white/5 p-8 h-[320px] bg-white/[0.01] flex flex-col">
                                <div className="flex items-center gap-6 mb-8">
                                    <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
                                    <div className="flex-1">
                                        <Skeleton className="w-3/4 h-6 mb-2" />
                                        <Skeleton className="w-1/2 h-3" />
                                    </div>
                                </div>
                                <Skeleton className="w-full h-4 mb-2" />
                                <Skeleton className="w-2/3 h-4 mb-8" />
                                <div className="mt-auto flex items-center justify-between">
                                    <Skeleton className="w-24 h-3" />
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
