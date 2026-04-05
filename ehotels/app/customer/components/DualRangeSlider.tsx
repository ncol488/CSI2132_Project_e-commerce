"use client";

import { useRef } from "react";
export default function DualRangeSlider({
  min,
  max,
  low,
  high,
  onChange,
}: {
  min: number;
  max: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const val = Math.round(min + pct * (max - min));
    const midpoint = (low + high) / 2;
    if (val < midpoint) onChange(Math.min(val, high - 1), high);
    else onChange(low, Math.max(val, low + 1));
  };

  return (
    <div
      className="relative h-5 flex items-center"
      ref={trackRef}
      onClick={handleTrackClick}
    >
      <div className="absolute w-full h-1.5 rounded-full bg-gray-200" />
      <div
        className="absolute h-1.5 rounded-full bg-blue-600"
        style={{
          left: `${getPercent(low)}%`,
          width: `${getPercent(high) - getPercent(low)}%`,
        }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={low}
        onChange={(e) => {
          const v = Math.min(Number(e.target.value), high - 1);
          onChange(v, high);
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={high}
        onChange={(e) => {
          const v = Math.max(Number(e.target.value), low + 1);
          onChange(low, v);
        }}
        onClick={(e) => e.stopPropagation()}
        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}
