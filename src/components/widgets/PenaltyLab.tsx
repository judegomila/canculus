"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cutCost, minimalTransversals, rankedRobustCuts } from "@/lib/calculus";
import { BRAF_CAPS, DEFAULT_PENALTIES, brafSystem } from "@/lib/models";
import { Slider } from "./ui";

function Podium({
  title,
  tone,
  rows,
  maxCost,
}: {
  title: string;
  tone: "static" | "adaptive";
  rows: { cut: readonly string[]; cost: number }[];
  maxCost: number;
}) {
  return (
    <div>
      <div
        className={`mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] ${
          tone === "static" ? "text-ink-faint" : "text-adapt"
        }`}
      >
        {title}
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map(({ cut, cost }, i) => (
          <motion.div
            key={cut.join("+")}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className={`flex items-center gap-3 rounded-md border px-3 py-1.5 font-mono text-[0.8rem] ${
              i === 0
                ? tone === "static"
                  ? "border-ink-faint bg-paper-deep"
                  : "border-adapt bg-adapt-soft"
                : "border-line-soft bg-paper-inset"
            }`}
          >
            <span className="w-6 text-ink-faint">{i + 1}.</span>
            <span className="font-semibold">{"{" + cut.join(",") + "}"}</span>
            <span className="relative ml-auto h-[6px] w-28 overflow-hidden rounded bg-paper-deep">
              <motion.span
                layout
                className="absolute inset-y-0 left-0 rounded"
                style={{
                  width: `${(cost / maxCost) * 100}%`,
                  background:
                    i === 0 && tone === "adaptive"
                      ? "var(--adapt)"
                      : "var(--ink-faint)",
                }}
              />
            </span>
            <span className="w-10 text-right tabular-nums text-ink-soft">
              {cost.toFixed(1)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * §10.4: the algebra enumerates the logically sufficient patterns;
 * penalties (toxicity, druggability, confidence) pick among them.
 * Drag the penalties and watch the static and adaptive optima diverge.
 */
export function PenaltyLab() {
  const [costs, setCosts] = useState<Record<string, number>>({
    ...DEFAULT_PENALTIES,
  });
  const sys = useMemo(() => brafSystem(), []);

  const staticRanked = useMemo(() => {
    return minimalTransversals(sys.baseline, sys.universe)
      .map((cut) => ({ cut, cost: cutCost(cut, costs) }))
      .sort((a, b) => a.cost - b.cost);
  }, [sys, costs]);

  const adaptiveRanked = useMemo(
    () => rankedRobustCuts(sys, costs),
    [sys, costs],
  );

  const maxCost = Math.max(
    ...staticRanked.map((x) => x.cost),
    ...adaptiveRanked.map((x) => x.cost),
    0.1,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-ink-faint">
          penalties c_v (toxicity + druggability + burden)
        </div>
        {BRAF_CAPS.map((c) => (
          <Slider
            key={c.id}
            label={`${c.id} ${c.name}`}
            value={costs[c.id]}
            min={0.1}
            max={3}
            step={0.1}
            fmt={(v) => v.toFixed(1)}
            onChange={(v) => setCosts((s) => ({ ...s, [c.id]: v }))}
          />
        ))}
        <button
          onClick={() => setCosts({ ...DEFAULT_PENALTIES })}
          className="mt-1 self-start rounded border border-line px-2.5 py-1 font-mono text-[0.72rem] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
        >
          reset to Eq. 57
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Podium
          title="Static model — cuts of R₀ only"
          tone="static"
          rows={staticRanked}
          maxCost={maxCost}
        />
        <Podium
          title="Adaptation-closed — robust cuts (Eq. 56)"
          tone="adaptive"
          rows={adaptiveRanked}
          maxCost={maxCost}
        />
        <p className="font-mono text-[0.74rem] leading-relaxed text-ink-soft sm:col-span-2">
          The static model happily recommends its top pick — but if that pick
          is {"{B}"}, the closure adds r₁ and the recommendation silently
          fails. The adaptive column only ranks interventions that survive
          their own consequences. With the paper&apos;s penalties, {"{B,G}"}{" "}
          (1.3) beats {"{M}"} (1.6): the symbolic design changed from one
          upstream drug to a combination that blocks the induced bypass.
        </p>
      </div>
    </div>
  );
}
