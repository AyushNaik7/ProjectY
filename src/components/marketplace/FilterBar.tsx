"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  ChevronDown,
} from "lucide-react";
import type { MarketplaceFilters, ViewMode } from "@/lib/marketplace-types";
import {
  DEFAULT_FILTERS,
  PLATFORM_OPTIONS,
  CATEGORY_OPTIONS,
} from "@/lib/marketplace-types";

interface FilterBarProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalResults: number;
  className?: string;
}

export function FilterBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalResults,
  className,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const activeFilterCount = [
    filters.budgetMin > 0 || filters.budgetMax < 500000,
    filters.platforms.length > 0,
    filters.categories.length > 0,
    filters.highMatchOnly,
    filters.negotiableOnly,
  ].filter(Boolean).length;

  const update = useCallback(
    (patch: Partial<MarketplaceFilters>) => {
      onFiltersChange({ ...filters, ...patch });
    },
    [filters, onFiltersChange],
  );

  const togglePlatform = (p: string) => {
    const next = filters.platforms.includes(p)
      ? filters.platforms.filter((x) => x !== p)
      : [...filters.platforms, p];
    update({ platforms: next });
  };

  const toggleCategory = (c: string) => {
    const next = filters.categories.includes(c)
      ? filters.categories.filter((x) => x !== c)
      : [...filters.categories, c];
    update({ categories: next });
  };

  const resetFilters = () => onFiltersChange(DEFAULT_FILTERS);

  // Debounced search
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.searchQuery) {
        update({ searchQuery: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.searchQuery, update]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                update({ searchQuery: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className={cn("gap-1.5", expanded && "border-primary text-primary")}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {/* View toggle */}
        <div className="flex items-center border border-border rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Results count */}
        <span className="text-xs text-muted-foreground ml-auto">
          {totalResults} campaign{totalResults !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Expanded filters */}
      {expanded && (
        <div className="p-4 rounded-xl border border-border bg-card space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Row 1: Budget slider */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Budget Range
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={filters.budgetMin}
                  onChange={(e) =>
                    update({ budgetMin: Number(e.target.value) || 0 })
                  }
                  className="w-28 h-8 text-xs"
                  min={0}
                  step={1000}
                />
              </div>
              <span className="text-xs text-muted-foreground">to</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={filters.budgetMax}
                  onChange={(e) =>
                    update({ budgetMax: Number(e.target.value) || 500000 })
                  }
                  className="w-28 h-8 text-xs"
                  min={0}
                  step={1000}
                />
              </div>
              {/* Quick presets */}
              <div className="flex gap-1.5 ml-2">
                {[
                  { label: "< ₹10K", min: 0, max: 10000 },
                  { label: "₹10K–50K", min: 10000, max: 50000 },
                  { label: "₹50K–2L", min: 50000, max: 200000 },
                  { label: "₹2L+", min: 200000, max: 500000 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      update({ budgetMin: preset.min, budgetMax: preset.max })
                    }
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-medium border transition-colors",
                      filters.budgetMin === preset.min &&
                        filters.budgetMax === preset.max
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Platform + Toggles */}
          <div className="flex items-start gap-6 flex-wrap">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Platform
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PLATFORM_OPTIONS.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                      filters.platforms.includes(p)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Quick Filters
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    update({ highMatchOnly: !filters.highMatchOnly })
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    filters.highMatchOnly
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "border-border text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  ✨ High Match Only
                </button>
                <button
                  onClick={() =>
                    update({ negotiableOnly: !filters.negotiableOnly })
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    filters.negotiableOnly
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "border-border text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  🤝 Negotiable Only
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Categories dropdown */}
          <div className="space-y-2">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-1 text-xs font-semibold text-foreground"
            >
              Category
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  showCategories && "rotate-180",
                )}
              />
              {filters.categories.length > 0 && (
                <span className="text-[10px] text-primary font-semibold">
                  ({filters.categories.length})
                </span>
              )}
            </button>
            {showCategories && (
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggleCategory(c)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                      filters.categories.includes(c)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active filters + Reset */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">Active:</span>
              {filters.platforms.map((p) => (
                <Badge
                  key={p}
                  variant="secondary"
                  className="text-[10px] gap-1"
                >
                  {p}
                  <button onClick={() => togglePlatform(p)}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
              {filters.categories.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="text-[10px] gap-1"
                >
                  {c}
                  <button onClick={() => toggleCategory(c)}>
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              ))}
              <button
                onClick={resetFilters}
                className="ml-auto text-xs text-destructive hover:underline"
              >
                Reset all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
