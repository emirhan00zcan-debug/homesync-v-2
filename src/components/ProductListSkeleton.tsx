import React from 'react';

export default function ProductListSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-[24px] bg-foreground/5 animate-pulse border border-foreground/5 p-4 flex flex-col">
                    <div className="w-16 h-4 bg-foreground/10 rounded-full mb-2" />
                    <div className="w-24 h-4 bg-foreground/10 rounded-full mb-auto" />
                    <div className="w-full h-1/2 bg-foreground/5 rounded-[12px] my-4" />
                    <div className="w-3/4 h-6 bg-foreground/10 rounded-md mb-2" />
                    <div className="w-1/2 h-4 bg-foreground/10 rounded-md mb-4" />
                    <div className="w-full h-12 bg-foreground/10 rounded-[16px]" />
                </div>
            ))}
        </div>
    );
}
