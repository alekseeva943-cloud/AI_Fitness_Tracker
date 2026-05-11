import React from "react";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("animate-pulse bg-white/5 rounded-md", className)} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <Skeleton className="h-4 w-1/4" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
};
