"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { adaptationClosure, disjoint, routeKey } from "@/lib/calculus";
import {
  BRAF_CAPS,
  CRC_CONTEXT,
  MELANOMA_CONTEXT,
  brafSystem,
  r0,
  r1,
  rMel,
} from "@/lib/models";
import { PathwayDiagram } from "../PathwayDiagram";
import { Chip, ClosureVerdict, RouteCard, displayOrder } from "./ui";

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
    () => adaptationClosure(sys.baseline, sys.rules, U, sys.ctx, sys.universe),
    [sys, U],
  );

  const bypassInFamily = res.closed.some((r) => routeKey(r) === routeKey(r1));
  const melEscapeInFamily = res.closed.some(
    (r) => routeKey(r) === routeKey(rMel),
  );
  const inducedInFamily = bypassInFamily || melEscapeInFamily;

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
          bypassEnabled={inducedInFamily}
          bypassPossible
          receptorFreeEscape={lineage === "melanoma"}
          inducedLabel={
            lineage === "melanoma"
              ? melEscapeInFamily
                ? "INDUCED ROUTE — MAPK REACTIVATION, IN THE FAMILY"
                : "LATENT MELANOMA ESCAPE — NOT YET A ROUTE"
              : undefined
          }
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
                  induced={routeKey(r) !== routeKey(r0)}
                  label={
                    routeKey(r) === routeKey(r0)
                      ? "r₀"
                      : routeKey(r) === routeKey(r1)
                        ? "r₁"
                        : "r_mel"
                  }
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-4">
            <ClosureVerdict
              status={
                !res.robust
                  ? "escape"
                  : res.rulesEncoded === 0
                    ? "unknown"
                    : "covered"
              }
              text={
                !res.robust
                  ? `Esc(U,c) = { ${res.escape.map((r) => displayOrder(r).join("∧")).join(", ")} } — escape open`
                  : res.rulesEncoded === 0
                    ? "no escape route found — but 0 rules are encoded here"
                    : `no escape route found — given ${res.rulesEncoded} rule${res.rulesEncoded === 1 ? "" : "s"} for this context`
              }
              detail={
                res.robust && res.rulesEncoded === 0
                  ? "This is ignorance, not coverage. An empty rule set makes every intervention trivially robust. The model is silent about this tissue, and silence is not evidence of safety."
                  : undefined
              }
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
                      {rowRes.closed.length === 1
                        ? "{r₀}"
                        : lineage === "melanoma"
                          ? "{r₀, r_mel}"
                          : "{r₀, r₁}"}
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
            {lineage === "CRC" ? (
              <>
                The EGFR guard c_CRC holds here, so inhibiting B opens r₁
                within hours. Switch lineage to compare.
              </>
            ) : (
              <>
                The EGFR guard is false in melanoma — but that does not make{" "}
                {"{B}"} safe. A second rule encodes MAPK reactivation through
                RAS/CRAF, which needs no receptor and runs on a scale of weeks
                rather than hours. The escape is slower and mechanistically
                different, not absent.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
