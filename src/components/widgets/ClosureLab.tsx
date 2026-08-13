"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { adaptationClosure, disjoint, routeKey } from "@/lib/calculus";
import {
  BRAF_CAPS,
  CRC_CONTEXT,
  MELANOMA_CONTEXT,
  brafSystem,
  r1,
} from "@/lib/models";
import { PathwayDiagram } from "../PathwayDiagram";
import { Chip, RouteCard, Verdict, displayOrder } from "./ui";

/** Table 4 rows, for orientation. */
const TABLE4: { U: string[]; note: string }[] = [
  { U: [], note: "no treatment" },
  { U: ["B"], note: "static optimum" },
  { U: ["M"], note: "downstream bottleneck" },
  { U: ["B", "G"], note: "combination" },
  { U: ["B", "R"], note: "combination" },
];

/**
 * The paper's central experiment (§7, §10, Appendix C): choose an
 * intervention U, compute the least-fixed-point closure R*_{U,c} by
 * forward chaining, inspect the escape set, and see whether U is
 * adaptation-robust — all live, in the lineage of your choice.
 */
export function ClosureLab() {
  const [U, setU] = useState<Set<string>>(new Set(["B"]));
  const [lineage, setLineage] = useState<"CRC" | "melanoma">("CRC");

  const ctx = lineage === "CRC" ? CRC_CONTEXT : MELANOMA_CONTEXT;
  const sys = useMemo(() => brafSystem(ctx), [ctx]);

  const res = useMemo(
    () => adaptationClosure(sys.baseline, sys.rules, U, sys.ctx),
    [sys, U],
  );

  const bypassInFamily = res.closed.some((r) => routeKey(r) === routeKey(r1));

  const toggle = (id: string) =>
    setU((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const uKey = [...U].sort().join("+");

  return (
    <div className="grid gap-6">
      {/* controls */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <div className="mb-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-cut">
            Intervention U — targets to inhibit
          </div>
          <div className="flex flex-wrap gap-2">
            {BRAF_CAPS.map((c) => (
              <Chip
                key={c.id}
                id={c.id}
                label={c.name}
                selected={U.has(c.id)}
                onClick={() => toggle(c.id)}
              />
            ))}
          </div>
        </div>
        <div className="ml-auto">
          <div className="mb-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
            Context c
          </div>
          <div className="flex overflow-hidden rounded-md border border-line font-mono text-[0.78rem]">
            {(["CRC", "melanoma"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLineage(l)}
                aria-pressed={lineage === l}
                className={`px-3 py-1.5 transition-colors ${
                  lineage === l
                    ? "bg-ink text-paper"
                    : "bg-paper-inset text-ink-soft hover:text-ink"
                }`}
              >
                {l === "CRC" ? "colorectal" : "melanoma"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* diagram */}
      <div className="rounded-md border border-line-soft bg-paper p-2">
        <PathwayDiagram
          inhibited={U}
          bypassEnabled={bypassInFamily}
          bypassPossible={lineage === "CRC"}
          onToggle={toggle}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* closure + escape */}
        <div>
          <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
            Adaptation-closed family R*
            <sub className="lowercase">U,c</sub> and escape set
          </div>
          <div className="flex flex-col gap-1.5">
            <AnimatePresence mode="popLayout">
              {res.closed.map((r) => (
                <RouteCard
                  key={`${uKey}-${routeKey(r)}`}
                  route={r}
                  hit={!disjoint(r, U)}
                  induced={routeKey(r) === routeKey(r1)}
                  label={routeKey(r) === routeKey(r1) ? "r₁" : "r₀"}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-4">
            <Verdict
              ok={res.robust}
              okText="Esc(U,c) = ∅ — adaptation-robust"
              failText={`Esc(U,c) = { ${res.escape.map((r) => displayOrder(r).join("∧")).join(", ")} } — escape open`}
            />
          </div>

          {/* derivation trace */}
          <div className="mt-4 rounded-md border border-line-soft bg-paper-deep/40 px-4 py-3 font-mono text-[0.75rem] leading-relaxed text-ink-soft">
            <div className="mb-1 font-semibold uppercase tracking-[0.13em] text-ink-faint">
              Forward-chaining trace
            </div>
            {res.trace.length === 0 ? (
              <div>
                round 1 · no rule enabled — least fixed point is R₀ itself
              </div>
            ) : (
              res.trace.map((s) => (
                <motion.div
                  key={`${uKey}-${s.ruleId}`}
                  initial={false}
                  animate={{ opacity: [0.4, 1], x: [-6, 0] }}
                >
                  round {s.round} ·{" "}
                  <span className="text-adapt">{s.ruleId}</span> fired (
                  {s.guardLabel}) → added{" "}
                  {s.added.map((r) => displayOrder(r).join("∧")).join(", ") ||
                    "nothing new"}
                </motion.div>
              ))
            )}
            <div className="mt-1 text-ink-faint">
              fixed point reached · Thm 7.3 guarantees ≤ |R∖R₀| rounds
            </div>
          </div>
        </div>

        {/* Table 4 */}
        <div>
          <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
            The paper&apos;s Table 4 — click a row to load it
          </div>
          <table className="w-full border-collapse font-mono text-[0.78rem]">
            <thead>
              <tr className="border-b border-line text-left text-[0.68rem] uppercase tracking-wider text-ink-faint">
                <th className="py-1.5 pr-2 font-semibold">U</th>
                <th className="py-1.5 pr-2 font-semibold">closure</th>
                <th className="py-1.5 font-semibold">robust?</th>
              </tr>
            </thead>
            <tbody>
              {TABLE4.map((row) => {
                const rowRes = adaptationClosure(
                  sys.baseline,
                  sys.rules,
                  new Set(row.U),
                  sys.ctx,
                );
                const active =
                  [...U].sort().join() === [...row.U].sort().join();
                return (
                  <tr
                    key={row.U.join() || "none"}
                    onClick={() => setU(new Set(row.U))}
                    className={`cursor-pointer border-b border-line-soft transition-colors ${
                      active ? "bg-adapt-soft/60" : "hover:bg-paper-deep/50"
                    }`}
                  >
                    <td className="py-2 pr-2">
                      {row.U.length ? `{${row.U.join(",")}}` : "∅"}
                    </td>
                    <td className="py-2 pr-2 text-ink-soft">
                      {rowRes.closed.length === 1 ? "{r₀}" : "{r₀, r₁}"}
                    </td>
                    <td className="py-2">
                      {rowRes.robust ? (
                        <span className="font-semibold text-route">✓ yes</span>
                      ) : (
                        <span className="font-semibold text-cut">✗ no</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 font-mono text-[0.72rem] leading-relaxed text-ink-faint">
            In melanoma context the guard c_CRC is false: every row&apos;s
            closure stays {"{r₀}"} and {"{B}"} alone is robust (Eq. 58) — same
            mutation, different control problem.
          </p>
        </div>
      </div>
    </div>
  );
}
