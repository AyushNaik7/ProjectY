"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Star, ShieldCheck, Users } from "lucide-react";
import type { BrandInfo } from "@/lib/marketplace-types";

interface BrandInfoCardProps {
  brand: BrandInfo;
  compact?: boolean;
  className?: string;
}

export function BrandInfoCard({
  brand,
  compact = false,
  className,
}: BrandInfoCardProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Avatar */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 overflow-hidden",
          compact ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm",
        )}
      >
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={compact ? 28 : 36}
            height={compact ? 28 : 36}
            className="w-full h-full object-cover"
          />
        ) : (
          brand.name.charAt(0).toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "font-semibold truncate",
              compact ? "text-xs" : "text-sm",
            )}
          >
            {brand.name}
          </span>
          {brand.isVerified && (
            <ShieldCheck
              className={cn(
                "text-blue-500 shrink-0",
                compact ? "w-3 h-3" : "w-3.5 h-3.5",
              )}
            />
          )}
        </div>

        {!compact && (
          <div className="flex items-center gap-2.5 mt-0.5">
            {brand.rating > 0 && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-medium text-foreground">
                  {brand.rating.toFixed(1)}
                </span>
                {brand.totalRatings > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    ({brand.totalRatings})
                  </span>
                )}
              </div>
            )}
            {brand.creatorsWorkedWith > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <Users className="w-3 h-3" />
                {brand.creatorsWorkedWith} creator
                {brand.creatorsWorkedWith !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
