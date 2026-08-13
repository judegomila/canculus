"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * The whole paper's story in three beats, told with no mathematics:
 * a signaling cascade keeps a cell alive; a drug breaks it; the break
 * itself releases a brake and a second route carries the same signal.
 */

type Stage = 0 | 1 | 2;

const STAGES: {
  title: string;
  clock: string;
  body: string;
}[] = [
  {
    title: "Before treatment",
    clock: "day 0",
    body:
      "A relay of proteins carries a “keep growing” signal down to the nucleus. In this tumour the relay is jammed on: a mutation in BRAF makes it fire without waiting to be told. The cell survives because the signal arrives. Notice the dashed line curving back up — the last protein in the relay, ERK, actively suppresses the receptor at the top. The pathway holds its own upstream input down.",
  },
  {
    title: "The drug lands",
    clock: "hours",
    body:
      "A BRAF inhibitor blocks the jammed protein. The relay breaks, the signal stops arriving, and the tumour starts to die. Every static analysis you could run on the wiring diagram says you are finished: you cut the only path from the top to the bottom.",
  },
  {
    title: "The pathway reroutes",
    clock: "days",
    body:
      "But ERK was the thing holding the receptor down. With ERK silent the brake comes off, EGFR wakes up, and it drives RAS and CRAF — a second relay into the very same downstream stretch you left intact. The signal returns. No new mutation was needed; the cell only had to stop being suppressed. Your cut did not merely fail. Your cut is what opened the route.",
  },
];

const NODES: {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  row: "top" | "bottom";
}[] = [
  { id: "EGFR", label: "EGFR", sub: "receptor", x: 96, y: 214, row: "bottom" },
  { id: "RAS", label: "RAS", sub: "switch", x: 246, y: 214, row: "bottom" },
  { id: "CRAF", label: "CRAF", sub: "kinase", x: 396, y: 214, row: "bottom" },
  { id: "BRAF", label: "BRAF", sub: "mutant kinase", x: 96, y: 80, row: "top" },
  { id: "MEK", label: "MEK", sub: "kinase", x: 288, y: 80, row: "top" },
  { id: "ERK", label: "ERK", sub: "output kinase", x: 470, y: 80, row: "top" },
];

export function CascadeIntro() {
  const [stage, setStage] = useState<Stage>(0);

  const brafBlocked = stage >= 1;
  const topLive = stage === 0;
  const bypassLive = stage === 2;
  const erkActive = stage === 0 || stage === 2;
  const surviving = stage === 0 || stage === 2;
  const feedbackHolding = stage === 0;

  const nodeState = (id: string): "live" | "blocked" | "quiet" => {
    if (id === "BRAF") return brafBlocked ? "blocked" : "live";
    if (id === "MEK" || id === "ERK") return topLive || bypassLive ? "live" : "quiet";
    return bypassLive ? "live" : "quiet";
  };

  const fill = (s: string) =>
    s === "blocked"
      ? "var(--cut-soft)"
      : s === "live"
        ? "var(--route-soft)"
        : "var(--paper-deep)";
  const stroke = (s: string) =>
    s === "blocked"
      ? "var(--cut)"
      : s === "live"
        ? "var(--route)"
        : "var(--ink-faint)";

  return (
    <div className="grid gap-5">
      {/* stage stepper */}
      <div className="flex flex-wrap items-center gap-2">
        {STAGES.map((s, i) => (
          <button
            key={s.title}
            onClick={() => setStage(i as Stage)}
            aria-pressed={stage === i}
            className={`flex items-baseline gap-2 rounded-md border px-3 py-1.5 text-left font-mono text-[0.76rem] transition-colors ${
              stage === i
                ? "border-ink bg-ink text-paper"
                : "border-line bg-paper-inset text-ink-soft hover:border-ink-faint hover:text-ink"
            }`}
          >
            <span className={stage === i ? "opacity-60" : "opacity-50"}>
              {i + 1}
            </span>
            {s.title}
          </button>
        ))}
        <span className="ml-auto font-mono text-[0.72rem] text-ink-faint">
          {STAGES[stage].clock}
        </span>
      </div>

      <div className="rounded-md border border-line-soft bg-paper p-2">
        <svg viewBox="0 0 720 300" className="w-full" role="img" aria-label="Signaling cascade before treatment, under treatment, and after rerouting">
          <defs>
            <marker id="c-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0.5 L7.5 4 L0 7.5 z" fill="context-stroke" />
            </marker>
            <marker id="c-tbar" viewBox="0 0 6 12" refX="3" refY="6" markerWidth="6" markerHeight="12" orient="auto">
              <line x1="3" y1="0" x2="3" y2="12" stroke="context-stroke" strokeWidth="2.4" />
            </marker>
          </defs>

          {/* the mutation: this relay fires without waiting to be told */}
          {!brafBlocked && (
            <>
              <text x={16} y={70} fontFamily="var(--font-mono)" fontSize={10.5} fill="var(--ink-faint)">
                jammed
              </text>
              <text x={16} y={84} fontFamily="var(--font-mono)" fontSize={10.5} fill="var(--ink-faint)">
                on
              </text>
            </>
          )}

          {/* top relay edges */}
          <motion.path
            d="M 128 80 H 254"
            fill="none"
            animate={{ stroke: topLive ? "var(--route)" : "var(--ink-faint)" }}
            strokeWidth={topLive ? 2.4 : 1.4}
            markerEnd="url(#c-arrow)"
            className={topLive ? "flow-live" : undefined}
          />
          <motion.path
            d="M 322 80 H 436"
            fill="none"
            animate={{
              stroke: topLive || bypassLive ? "var(--route)" : "var(--ink-faint)",
            }}
            strokeWidth={topLive || bypassLive ? 2.4 : 1.4}
            markerEnd="url(#c-arrow)"
            className={topLive || bypassLive ? "flow-live" : undefined}
          />
          <motion.path
            d="M 504 80 H 566"
            fill="none"
            animate={{ stroke: surviving ? "var(--route)" : "var(--ink-faint)" }}
            strokeWidth={surviving ? 2.4 : 1.4}
            markerEnd="url(#c-arrow)"
            className={surviving ? "flow-live" : undefined}
          />

          {/* bypass relay edges */}
          <motion.path
            d="M 128 214 H 214"
            fill="none"
            animate={{ stroke: bypassLive ? "var(--route)" : "var(--ink-faint)" }}
            strokeWidth={bypassLive ? 2.4 : 1.4}
            strokeDasharray={bypassLive ? undefined : "5 5"}
            markerEnd="url(#c-arrow)"
            className={bypassLive ? "flow-live" : undefined}
          />
          <motion.path
            d="M 278 214 H 364"
            fill="none"
            animate={{ stroke: bypassLive ? "var(--route)" : "var(--ink-faint)" }}
            strokeWidth={bypassLive ? 2.4 : 1.4}
            strokeDasharray={bypassLive ? undefined : "5 5"}
            markerEnd="url(#c-arrow)"
            className={bypassLive ? "flow-live" : undefined}
          />
          {/* CRAF rejoins MEK */}
          <motion.path
            d="M 404 188 C 400 150, 372 108, 326 92"
            fill="none"
            animate={{ stroke: bypassLive ? "var(--route)" : "var(--ink-faint)" }}
            strokeWidth={bypassLive ? 2.4 : 1.4}
            strokeDasharray={bypassLive ? undefined : "5 5"}
            markerEnd="url(#c-arrow)"
            className={bypassLive ? "flow-live" : undefined}
          />

          {/* ERK ⊣ EGFR feedback */}
          <motion.path
            d="M 504 92 C 528 190, 320 258, 136 224"
            fill="none"
            animate={{
              stroke: feedbackHolding ? "var(--cut)" : "var(--ink-faint)",
              opacity: feedbackHolding ? 1 : 0.4,
            }}
            strokeWidth={feedbackHolding ? 2 : 1.2}
            strokeDasharray="3 5"
            markerEnd="url(#c-tbar)"
          />
          <motion.text
            x={252}
            y={286}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={10.5}
            animate={{ fill: feedbackHolding ? "var(--cut)" : "var(--ink-faint)" }}
          >
            {feedbackHolding
              ? "ERK suppresses EGFR — the brake is on"
              : stage === 1
                ? "ERK is silent — the brake is coming off"
                : "brake released"}
          </motion.text>

          {/* nodes */}
          {NODES.map((n) => {
            const s = nodeState(n.id);
            return (
              <g key={n.id}>
                <motion.rect
                  x={n.x - 32}
                  y={n.y - 22}
                  width={64}
                  height={44}
                  rx={9}
                  animate={{ fill: fill(s), stroke: stroke(s) }}
                  strokeWidth={2}
                  strokeDasharray={s === "quiet" && n.row === "bottom" ? "4 4" : undefined}
                />
                <text
                  x={n.x}
                  y={n.y - 1}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={12.5}
                  fontWeight={600}
                  fill={s === "blocked" ? "var(--cut)" : "var(--ink)"}
                >
                  {n.label}
                </text>
                <text
                  x={n.x}
                  y={n.y + 34}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={9.5}
                  fill="var(--ink-faint)"
                >
                  {n.sub}
                </text>
                {n.id === "BRAF" && brafBlocked && (
                  <motion.g
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                    stroke="var(--cut)"
                    strokeWidth={3}
                    strokeLinecap="round"
                  >
                    <line x1={n.x - 14} y1={n.y - 14} x2={n.x + 14} y2={n.y + 14} />
                    <line x1={n.x + 14} y1={n.y - 14} x2={n.x - 14} y2={n.y + 14} />
                  </motion.g>
                )}
              </g>
            );
          })}

          {/* drug label */}
          {brafBlocked && (
            <motion.text
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              x={96}
              y={30}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10.5}
              fontWeight={600}
              fill="var(--cut)"
            >
              BRAF inhibitor
            </motion.text>
          )}

          {/* outcome */}
          <motion.rect
            x={570}
            y={56}
            width={126}
            height={48}
            rx={9}
            animate={{
              fill: surviving ? "var(--route)" : "var(--paper-deep)",
              stroke: surviving ? "var(--route)" : "var(--ink-faint)",
            }}
            strokeWidth={1.8}
          />
          <motion.text
            x={633}
            y={84}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={12}
            fontWeight={600}
            animate={{ fill: surviving ? "var(--paper)" : "var(--ink-soft)" }}
          >
            {surviving ? "CELL SURVIVES" : "CELL DIES"}
          </motion.text>
          <text
            x={633}
            y={124}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={9.5}
            fill="var(--ink-faint)"
          >
            proliferation programme
          </text>

          {!erkActive && (
            <text
              x={470}
              y={132}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10}
              fill="var(--ink-faint)"
            >
              ERK off
            </text>
          )}
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-5">
        <div className="font-display text-[1.15rem] font-semibold sm:w-40">
          {STAGES[stage].title}
        </div>
        <p className="text-[1.02rem] leading-relaxed text-ink-soft">
          {STAGES[stage].body}
        </p>
      </div>

      {stage < 2 && (
        <button
          onClick={() => setStage((s) => (s + 1) as Stage)}
          className="self-start rounded-md border border-ink px-4 py-1.5 font-mono text-[0.78rem] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          {stage === 0 ? "give the drug →" : "wait a few days →"}
        </button>
      )}
      {stage === 2 && (
        <button
          onClick={() => setStage(0)}
          className="self-start rounded-md border border-line px-4 py-1.5 font-mono text-[0.78rem] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
        >
          ↺ start over
        </button>
      )}
    </div>
  );
}
