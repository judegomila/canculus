"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { earliestActivationTimes, robustAtHorizon } from "@/lib/calculus";
import { brafSystem } from "@/lib/models";
import { Slider, Verdict } from "./ui";

/**
 * §9.1–9.2: earliest activation times and horizon-limited closure.
 * U = {B} is "robust" inside a short pharmacodynamic window and fails
 * once the transcriptional rule's delay elapses.
 */
export function HorizonSlider() {
  const [T, setT] = useState(6);
  const sys = useMemo(() => brafSystem(), []);
  const U = useMemo(() => new Set(["B"]), []);
  const timed = useMemo(() => earliestActivationTimes(sys, U), [sys, U]);
  const robust = robustAtHorizon(sys, U, T);
  const MAX = 36;

  return (
    <div className="grid gap-5">
      <Slider
        label={<span>horizon T</span>}
        value={T}
        min={0}
        max={MAX}
        step={1}
        fmt={(v) => `${v}h`}
        onChange={setT}
      />

      {/* timeline */}
      <div className="relative h-24 rounded-md border border-line-soft bg-paper p-3">
        <div className="absolute inset-x-3 top-1/2 h-px bg-line" />
        {/* observation window */}
        <motion.div
          className="absolute top-3 bottom-3 left-3 rounded bg-chart-blue-soft/70"
          animate={{ width: `calc(${(T / MAX) * 100}% - ${(T / MAX) * 24}px)` }}
          transition={{ type: "tween", duration: 0.15 }}
        />
        {timed.map(({ route, time }) => {
          const isBase = time === 0;
          const visible = time <= T;
          return (
            <div
              key={route.join()}
              className="absolute top-0 bottom-0"
              style={{ left: `calc(${(time / MAX) * 100}% + ${12 - (time / MAX) * 24}px)` }}
            >
              <div
                className={`absolute top-3 bottom-3 w-px ${isBase ? "bg-route" : "bg-adapt"}`}
              />
              <span
                className={`absolute top-1 whitespace-nowrap font-mono text-[0.66rem] font-semibold ${
                  isBase ? "left-0 text-route" : "-translate-x-1/2"
                } ${!isBase && (visible ? "text-adapt" : "text-ink-faint")}`}
              >
                {isBase ? "r₀ · t=0" : `r₁ · t=${time}h`}
              </span>
            </div>
          );
        })}
        <span className="absolute right-3 bottom-1 font-mono text-[0.66rem] text-ink-faint">
          observation window [0, T]
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Verdict
          ok={robust}
          okText={`no escape route within [0, ${T}h] — bypass not yet activatable`}
          failText={`{B} fails over [0, ${T}h] — r₁ activates at t = 12h`}
        />
        <p className="max-w-md font-mono text-[0.74rem] leading-relaxed text-ink-soft">
          A cut can pass a 6-hour phospho-flow readout and still fail the
          72-hour objective. Robustness is horizon-indexed: R*(T) grows with T.
        </p>
      </div>
    </div>
  );
}
