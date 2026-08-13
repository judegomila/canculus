"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { adaptationClosure, disjoint, minimalRobustCuts } from "@/lib/calculus";
import { reciprocalPairSystem } from "@/lib/models";
import { RouteCard, Verdict } from "./ui";

function Arm({
  id,
  x,
  inhibited,
  enabled,
  onClick,
}: {
  id: "AR" | "AKT";
  x: number;
  inhibited: boolean;
  enabled: boolean;
  onClick: () => void;
}) {
  const open = enabled && !inhibited;
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <motion.rect
        x={x - 62}
        y={60}
        width={124}
        height={56}
        rx={10}
        animate={{
          fill: inhibited
            ? "var(--cut-soft)"
            : open
              ? "var(--route-soft)"
              : "var(--paper-deep)",
          stroke: inhibited
            ? "var(--cut)"
            : open
              ? "var(--route)"
              : "var(--ink-faint)",
        }}
        strokeWidth={2}
        strokeDasharray={enabled ? undefined : "5 5"}
      />
      <text
        x={x}
        y={82}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={14}
        fontWeight={600}
        fill={inhibited ? "var(--cut)" : "var(--ink)"}
      >
        {id === "AR" ? "AR arm" : "PI3K/AKT arm"}
      </text>
      <text
        x={x}
        y={102}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={10.5}
        fill="var(--ink-soft)"
      >
        {inhibited ? "inhibited ✗" : open ? "route open" : "latent"}
      </text>
    </g>
  );
}

/**
 * §11.3, PTEN-deficient prostate cancer: AR and PI3K/AKT signalling form a
 * reciprocal escape pair — inhibiting either arm enables the other. The
 * intervention-response graph has a directed 2-cycle, and the only minimal
 * robust cut covers both arms.
 */
export function ReciprocalTrap() {
  const [U, setU] = useState<Set<string>>(new Set(["AR"]));
  const sys = useMemo(() => reciprocalPairSystem(), []);
  const res = useMemo(
    () => adaptationClosure(sys.baseline, sys.rules, U, sys.ctx),
    [sys, U],
  );
  const cuts = useMemo(() => minimalRobustCuts(sys), [sys]);

  const toggle = (id: string) =>
    setU((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const armProps = (id: "AR" | "AKT") => ({
    id,
    inhibited: U.has(id),
    enabled: res.closed.some((r) => r.includes(id)),
    onClick: () => toggle(id),
  });

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <div>
        <svg viewBox="0 0 460 190" className="w-full" role="img" aria-label="Reciprocal escape pair between AR and AKT arms">
          <defs>
            <marker id="arrow2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0.5 L7.5 4 L0 7.5 z" fill="context-stroke" />
            </marker>
          </defs>
          <Arm {...armProps("AR")} x={110} />
          <Arm {...armProps("AKT")} x={350} />
          {/* cross-activation arcs */}
          <path
            d="M 176 70 C 220 40, 260 40, 282 66"
            fill="none"
            stroke={U.has("AR") ? "var(--adapt)" : "var(--ink-faint)"}
            strokeWidth={U.has("AR") ? 2.4 : 1.4}
            strokeDasharray="4 4"
            markerEnd="url(#arrow2)"
            className={U.has("AR") ? "pulse-soft" : undefined}
          />
          <text x={230} y={38} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10.5} fill={U.has("AR") ? "var(--adapt)" : "var(--ink-faint)"}>
            inhibit AR ⇒ enable AKT
          </text>
          <path
            d="M 284 112 C 250 140, 205 140, 178 112"
            fill="none"
            stroke={U.has("AKT") ? "var(--adapt)" : "var(--ink-faint)"}
            strokeWidth={U.has("AKT") ? 2.4 : 1.4}
            strokeDasharray="4 4"
            markerEnd="url(#arrow2)"
            className={U.has("AKT") ? "pulse-soft" : undefined}
          />
          <text x={230} y={162} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10.5} fill={U.has("AKT") ? "var(--adapt)" : "var(--ink-faint)"}>
            inhibit PI3K/AKT ⇒ enable AR
          </text>
        </svg>
        <p className="mt-1 font-mono text-[0.72rem] text-ink-faint">
          click an arm to inhibit it · the dashed arcs are adaptation rules,
          i.e. a directed 2-cycle in the intervention-response graph
        </p>
      </div>

      <div>
        <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
          Closed survival family S = AR ∨ AKT
        </div>
        <div className="flex flex-col gap-1.5">
          {res.closed.map((r) => (
            <RouteCard
              key={`${[...U].sort().join()}-${r.join()}`}
              route={r}
              hit={!disjoint(r, U)}
              induced={!sys.baseline.some((b) => b.join() === r.join())}
            />
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Verdict
            ok={res.robust}
            okText="robust — both escape channels covered"
            failText={
              U.size === 0
                ? "no intervention — the baseline AR route survives"
                : "not robust — the untreated arm escapes"
            }
          />
          <p className="font-mono text-[0.74rem] leading-relaxed text-ink-soft">
            Minimal robust cut:{" "}
            <span className="font-semibold text-ink">
              {cuts.map((c) => `{${c.join(", ")}}`).join(" ")}
            </span>{" "}
            — the calculus derives the combination requirement (Carver et
            al.&apos;s preclinical finding) from two guarded rules, before any
            optimization.
          </p>
        </div>
      </div>
    </div>
  );
}
