import { MotiView } from "moti";
import React from "react";

export const SkeletonPulsar = ({ className }: { className?: string }) => (
    <MotiView
        from={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{
            type: 'timing',
            duration: 1000,
            loop: true,
        }}
        className={className}
    />
);
