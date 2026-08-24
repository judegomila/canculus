"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface PathwayDiagramProps {
  /** capabilities currently inhibited (members of U) */
  inhibited: ReadonlySet<string>;
  /** has ρ_EGFR added the bypass route to the family? */
  bypassEnabled: boolean;
  /** dim the whole bypass strip (e.g. melanoma context) */
  bypassPossible?: boolean;
  /**
   * An induced route that runs through RAS/CRAF without the receptor —
   * melanoma's slower MAPK-reactivation escape. Rendered on the same strip
   * as the EGFR bypass, minus the receptor.
   */
  receptorFreeEscape?: boolean;
  /** caption for the induced strip, overriding the EGFR-specific default. */
  inducedLabel?: string;
  onToggle?: (cap: string) => void;
}

const TOP = [
  { id: "B", x: 120, label: "BRAF" },
  { id: "M", x: 300, label: "MEK" },
  { id: "E", x: 480, label: "ERK" },
];

const BOTTOM = [
  { id: "G", x: 120, label: "EGFR" },
  { id: "R", x: 260, label: "RAS" },
  { id: "C", x: 400, label: "CRAF" },
];

const TY = 78;
const BY = 218;

function Node({
  x,
  y,
  id,
  label,
  inhibited,
  live,
  latent,
  onToggle,
}: {
  x: number;
  y: number;
  id: string;
  label: string;
  inhibited: boolean;
  live: boolean;
  latent: boolean;
  onToggle?: (cap: string) => void;
}) {
  return (
    <g
      onClick={onToggle ? () => onToggle(id) : undefined}
      style={{ cursor: onToggle ? "pointer" : "default" }}
      aria-label={`${label}${inhibited ? " (inhibited)" : ""}`}
    >
      <circle
        cx={x}
        cy={y}
        r={26}
        fill={inhibited ? "var(--cut-soft)" : live ? "var(--route-soft)" : "var(--paper-inset)"}
        stroke={inhibited ? "var(--cut)" : live ? "var(--route)" : "var(--ink-faint)"}
        strokeWidth={2}
        strokeDasharray={latent ? "4 4" : undefined}
        opacity={latent ? 0.55 : 1}
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={15}
        fontWeight={600}
        fill={inhibited ? "var(--cut)" : "var(--ink)"}
        fontFamily="var(--font-mono)"
        opacity={latent ? 0.55 : 1}
      >
        {id}
      </text>
      <text
        x={x}
        y={y + 44}
        textAnchor="middle"
        fontSize={11}
        fill="var(--ink-soft)"
        fontFamily="var(--font-mono)"
        opacity={latent ? 0.55 : 1}
      >
        {label}
      </text>
      {inhibited && (
        <g stroke="var(--cut)" strokeWidth={2.5} strokeLinecap="round">
          <line x1={x - 12} y1={y - 12} x2={x + 12} y2={y + 12} />
          <line x1={x + 12} y1={y - 12} x2={x - 12} y2={y + 12} />
        </g>
      )}
    </g>
  );
}

function Edge({
  d,
  live,
  latent,
  dashed,
  color,
}: {
  d: string;
  live: boolean;
  latent?: boolean;
  dashed?: boolean;
  color?: string;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color ?? (live ? "var(--route)" : "var(--ink-faint)")}
      strokeWidth={live ? 2.4 : 1.6}
      strokeDasharray={dashed ? "5 5" : undefined}
      className={live ? "flow-live" : undefined}
      opacity={latent ? 0.45 : 1}
      markerEnd="url(#arrow)"
    />
  );
}

/**
 * The Section-10 worked example as a living diagram: baseline route
 * B→M→E→survival on top, the treatment-induced EGFR→RAS→CRAF prefix below,
 * ERK ⊣ EGFR negative feedback as the rust arc.
 */
export function PathwayDiagram({
  inhibited,
  bypassEnabled,
  bypassPossible = true,
  receptorFreeEscape = false,
  inducedLabel,
  onToggle,
}: PathwayDiagramProps) {
  const escapeCaps = receptorFreeEscape
    ? ["R", "C", "M", "E"]
    : ["G", "R", "C", "M", "E"];
  const baselineLive = ["B", "M", "E"].every((v) => !inhibited.has(v));
  const bypassLive =
    bypassEnabled && escapeCaps.every((v) => !inhibited.has(v));
  const survives = baselineLive || bypassLive;
  const latent = !bypassEnabled;

  return (
    <svg
      viewBox="0 0 720 300"
      className="w-full"
      role="img"
      aria-label="BRAF pathway diagram with EGFR bypass"
    >
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0 0.5 L7.5 4 L0 7.5 z" fill="context-stroke" />
        </marker>
        <marker
          id="tbar"
          viewBox="0 0 6 12"
          refX="3"
          refY="6"
          markerWidth="6"
          markerHeight="12"
          orient="auto"
        >
          <line x1="3" y1="0" x2="3" y2="12" stroke="context-stroke" strokeWidth="2.4" />
        </marker>
      </defs>

      {/* baseline route strip */}
      <rect
        x={62}
        y={26}
        width={492}
        height={106}
        rx={10}
        fill="none"
        stroke="var(--line)"
        strokeWidth={1}
      />
      <text x={72} y={44} fontSize={10.5} fontFamily="var(--font-mono)" fill="var(--ink-faint)" letterSpacing="0.14em">
        BASELINE ROUTE r0
      </text>

      {/* induced strip */}
      <g opacity={bypassPossible ? 1 : 0.35}>
        <rect
          x={62}
          y={166}
          width={400}
          height={106}
          rx={10}
          fill={bypassEnabled ? "var(--adapt-soft)" : "none"}
          fillOpacity={bypassEnabled ? 0.4 : 0}
          stroke={bypassEnabled ? "var(--adapt)" : "var(--line)"}
          strokeWidth={1}
          strokeDasharray={latent ? "6 5" : undefined}
        />
        <text x={72} y={184} fontSize={10.5} fontFamily="var(--font-mono)" fill={bypassEnabled ? "var(--adapt)" : "var(--ink-faint)"} letterSpacing="0.14em">
          {inducedLabel ??
            (bypassPossible
              ? bypassEnabled
                ? "INDUCED ROUTE r1 — IN THE FAMILY"
                : "LATENT BYPASS — NOT YET A ROUTE"
              : "BYPASS ABSENT IN THIS LINEAGE")}
        </text>
      </g>

      {/* baseline edges */}
      <Edge d={`M ${146} ${TY} H ${274}`} live={baselineLive} />
      <Edge d={`M ${326} ${TY} H ${454}`} live={baselineLive} />
      <Edge d={`M ${506} ${TY} H ${576}`} live={survives} />

      {/* bypass edges */}
      <g opacity={bypassPossible ? 1 : 0.35}>
        {!receptorFreeEscape && (
          <Edge d={`M ${146} ${BY} H ${234}`} live={bypassLive} latent={latent} />
        )}
        <Edge d={`M ${286} ${BY} H ${374}`} live={bypassLive} latent={latent} />
        {/* CRAF rejoins MEK */}
        <Edge
          d={`M ${418} ${BY - 18} C ${450} ${170}, ${360} ${130}, ${314} ${100}`}
          live={bypassLive}
          latent={latent}
        />
        {/* ERK ⊣ EGFR negative feedback — only the CRC loop uses it */}
        {!receptorFreeEscape && (
          <>
            <path
              d={`M ${480} ${TY + 30} C ${470} ${190}, ${300} ${255}, ${152} ${BY + 6}`}
              fill="none"
              stroke="var(--cut)"
              strokeWidth={1.6}
              strokeDasharray="3 5"
              markerEnd="url(#tbar)"
              opacity={0.85}
            />
            <text x={250} y={292} fontSize={10.5} fontFamily="var(--font-mono)" fill="var(--cut)">
              ERK ⊣ EGFR negative feedback
            </text>
          </>
        )}
        {receptorFreeEscape && (
          <text x={100} y={292} fontSize={10.5} fontFamily="var(--font-mono)" fill="var(--adapt)">
            MAPK reactivation via RAS/CRAF — no receptor needed, weeks to months
          </text>
        )}
      </g>

      {/* survival box */}
      <g>
        <rect
          x={580}
          y={TY - 26}
          width={112}
          height={52}
          rx={8}
          fill={survives ? "var(--route)" : "var(--paper-deep)"}
          stroke={survives ? "var(--route)" : "var(--ink-faint)"}
          strokeWidth={1.6}
        />
        <text
          x={636}
          y={TY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={13}
          fontWeight={600}
          fontFamily="var(--font-mono)"
          fill={survives ? "var(--paper)" : "var(--ink-soft)"}
        >
          {survives ? "SURVIVAL" : "BLOCKED"}
        </text>
      </g>

      {TOP.map((n) => (
        <Node
          key={n.id}
          x={n.x}
          y={TY}
          id={n.id}
          label={n.label}
          inhibited={inhibited.has(n.id)}
          live={
            (baselineLive && ["B", "M", "E"].includes(n.id)) ||
            (bypassLive && ["M", "E"].includes(n.id))
          }
          latent={false}
          onToggle={onToggle}
        />
      ))}
      <g opacity={bypassPossible ? 1 : 0.35}>
        {BOTTOM.map((n) => (
          <Node
            key={n.id}
            x={n.x}
            y={BY}
            id={n.id}
            label={n.label}
            inhibited={inhibited.has(n.id)}
            live={bypassLive && escapeCaps.includes(n.id)}
            latent={latent || !escapeCaps.includes(n.id)}
            onToggle={bypassPossible ? onToggle : undefined}
          />
        ))}
      </g>

      {/* escape verdict badge */}
      <AnimatePresence initial={false}>
        {bypassLive && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <text
              x={520}
              y={182}
              fontSize={11}
              fontFamily="var(--font-mono)"
              fill="var(--adapt)"
              fontWeight={600}
              letterSpacing="0.1em"
            >
              ESCAPE ROUTE OPEN
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
}
