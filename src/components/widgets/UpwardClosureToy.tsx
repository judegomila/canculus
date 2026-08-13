"use client";

import { useMemo, useState } from "react";
import { adaptationClosure } from "@/lib/calculus";
import { upwardClosureCounterexample } from "@/lib/models";
import { Chip, Verdict } from "./ui";

/**
 * Prop. 7.8 live: V = {a,b,c}, R₀ = {{a}}, one rule "if b ∈ U, enable {c}".
 * {a} is robust; add b and you *create* an unblocked route.
 */
export function UpwardClosureToy() {
  const [U, setU] = useState<Set<string>>(new Set(["a"]));
  const sys = useMemo(() => upwardClosureCounterexample(), []);
  const res = useMemo(
    () => adaptationClosure(sys.baseline, sys.rules, U, sys.ctx),
    [sys, U],
  );

  const toggle = (id: string) =>
    setU((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid items-start gap-6 sm:grid-cols-[1fr_1fr]">
      <div>
        <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
          Build U — baseline family is {"{{a}}"}, rule: b ∈ U ⇒ enable {"{c}"}
        </div>
        <div className="mb-4 flex gap-2">
          {["a", "b", "c"].map((id) => (
            <Chip
              key={id}
              id={id}
              selected={U.has(id)}
              onClick={() => toggle(id)}
            />
          ))}
        </div>
        <Verdict
          ok={res.robust}
          okText={`U = {${[...U].sort().join(",")}} is robust`}
          failText={`U = {${[...U].sort().join(",")}} is NOT robust — escape {${res.escape.map((r) => r.join("")).join(", ")}}`}
        />
      </div>
      <div className="rounded-md border border-line-soft bg-paper-deep/40 px-4 py-3 font-mono text-[0.78rem] leading-relaxed text-ink-soft">
        <div>
          closure R*: {"{"}
          {res.closed.map((r) => `{${r.join(",")}}`).join(", ")}
          {"}"}
        </div>
        <div className="mt-2 text-ink-faint">
          Try {"{a}"} — robust. Now add b. The guard fires, {"{c}"} enters the
          family, and nothing in U hits it. A *bigger* intervention became
          worse: robustness is not upward closed, so superset pruning in
          branch-and-bound is unsound without Eq. 33.
        </div>
      </div>
    </div>
  );
}
