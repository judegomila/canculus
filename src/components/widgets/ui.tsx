"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

/** Capability toggle chip. Selected = targeted by the intervention. */
export function Chip({
  id,
  label,
  selected,
  onClick,
  tone = "cut",
  disabled,
}: {
  id: string;
  label?: string;
  selected: boolean;
  onClick: () => void;
  tone?: "cut" | "route";
  disabled?: boolean;
}) {
  const activeCls =
    tone === "cut"
      ? "border-cut bg-cut text-paper"
      : "border-route bg-route text-paper";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.8rem] font-medium transition-all duration-150 ${
        selected
          ? activeCls
          : "border-line bg-paper-inset text-ink-soft hover:border-ink-faint hover:text-ink"
      } ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
    >
      <span className="font-semibold">{id}</span>
      {label && (
        <span className={selected ? "opacity-80" : "opacity-60"}>{label}</span>
      )}
    </button>
  );
}

export function Verdict({
  ok,
  okText,
  failText,
}: {
  ok: boolean;
  okText: string;
  failText: string;
}) {
  return (
    <motion.div
      key={ok ? "ok" : "fail"}
      initial={false}
      animate={{ opacity: [0.4, 1], scale: [0.97, 1] }}
      className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[0.78rem] font-semibold tracking-wide ${
        ok
          ? "border-route bg-route-soft text-route"
          : "border-cut bg-cut-soft text-cut"
      }`}
    >
      <span aria-hidden>{ok ? "✓" : "✗"}</span>
      {ok ? okText : failText}
    </motion.div>
  );
}

/** Display caps in pathway order rather than alphabetically. */
const CAP_ORDER = ["B", "G", "R", "C", "M", "E", "AR", "AKT", "a", "b", "c"];
export const displayOrder = (route: readonly string[]): string[] =>
  [...route].sort((x, y) => {
    const ix = CAP_ORDER.indexOf(x);
    const iy = CAP_ORDER.indexOf(y);
    if (ix === -1 || iy === -1) return x.localeCompare(y);
    return ix - iy;
  });

/** A route rendered as a conjunction card. */
export function RouteCard({
  route,
  hit,
  induced,
  label,
}: {
  route: readonly string[];
  hit: boolean;
  induced?: boolean;
  label?: string;
}) {
  return (
    <motion.div
      layout
      initial={false}
      animate={{ opacity: [0.4, 1], y: [6, 0] }}
      className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
        hit
          ? "border-line bg-paper-deep/60"
          : induced
            ? "border-adapt bg-adapt-soft/60"
            : "border-route bg-route-soft/60"
      }`}
    >
      {label && (
        <span className="mr-1 font-mono text-[0.68rem] font-semibold uppercase tracking-wider text-ink-faint">
          {label}
        </span>
      )}
      <span className="font-mono text-[0.85rem]">
        {displayOrder(route).map((v, i) => (
          <span key={v}>
            {i > 0 && <span className="mx-1 text-ink-faint">∧</span>}
            <span className={hit ? "text-ink-faint line-through" : "text-ink"}>
              {v}
            </span>
          </span>
        ))}
      </span>
      <span
        className={`ml-auto font-mono text-[0.68rem] font-semibold uppercase tracking-wider ${
          hit ? "text-ink-faint" : induced ? "text-adapt" : "text-route"
        }`}
      >
        {hit ? "hit" : induced ? "induced · open" : "open"}
      </span>
    </motion.div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  fmt = (v: number) => v.toFixed(2),
  accent,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
  accent?: string;
}) {
  return (
    <label className="flex items-center gap-3 font-mono text-[0.8rem]">
      <span className="w-24 shrink-0 text-ink-soft">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span
        className="w-14 shrink-0 text-right font-semibold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {fmt(value)}
      </span>
    </label>
  );
}
