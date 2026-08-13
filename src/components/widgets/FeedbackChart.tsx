"use client";

import { useMemo, useRef, useState } from "react";
import {
  FeedbackParams,
  alphaCrit,
  outputY,
  receptorDrive,
} from "@/lib/calculus";
import { DEFAULT_FEEDBACK } from "@/lib/models";
import { Slider, Verdict } from "./ui";

const W = 640;
const H = 320;
const PAD = { l: 46, r: 16, t: 18, b: 40 };
const PW = W - PAD.l - PAD.r;
const PH = H - PAD.t - PAD.b;

const DRIVE = "#a06b0a"; // r(α) — receptor drive (validated palette)
const OUTPUT = "#0d6da1"; // y(α) — pathway output

/**
 * Eqs. 22–24 and 52–53: how deepening inhibition (smaller α) *raises*
 * upstream receptor drive r(α) until it crosses θ and arms the discrete
 * adaptation rule. One α slider, live curves, the α_crit boundary.
 */
export function FeedbackChart() {
  const [alpha, setAlpha] = useState(0.85);
  const [p, setP] = useState<FeedbackParams>(DEFAULT_FEEDBACK);
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const yMax = useMemo(
    () => Math.max(p.u, outputY(1, p), p.theta) * 1.15,
    [p],
  );

  const sx = (a: number) => PAD.l + a * PW;
  const sy = (v: number) => PAD.t + PH - (v / yMax) * PH;

  const N = 120;
  const drivePath = useMemo(
    () =>
      Array.from({ length: N + 1 }, (_, i) => {
        const a = i / N;
        return `${i === 0 ? "M" : "L"} ${sx(a).toFixed(1)} ${sy(receptorDrive(a, p)).toFixed(1)}`;
      }).join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p, yMax],
  );
  const outPath = useMemo(
    () =>
      Array.from({ length: N + 1 }, (_, i) => {
        const a = i / N;
        return `${i === 0 ? "M" : "L"} ${sx(a).toFixed(1)} ${sy(outputY(a, p)).toFixed(1)}`;
      }).join(" "),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [p, yMax],
  );

  const crit = alphaCrit(p);
  const armed = receptorDrive(alpha, p) >= p.theta;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const a = Math.min(1, Math.max(0, (px - PAD.l) / PW));
    setHover(a);
  };

  const gridY = [0.25, 0.5, 0.75, 1].map((f) => f * yMax);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none select-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onPointerDown={(e) => {
            onMove(e);
            const rect = svgRef.current!.getBoundingClientRect();
            const px = ((e.clientX - rect.left) / rect.width) * W;
            setAlpha(Math.min(1, Math.max(0, (px - PAD.l) / PW)));
          }}
          role="img"
          aria-label="Receptor drive and pathway output versus residual activity alpha"
        >
          {/* guard-true region */}
          {crit.regime !== "never" && (
            <rect
              x={sx(0)}
              y={PAD.t}
              width={
                (crit.regime === "always" ? 1 : (crit.value ?? 0)) * PW
              }
              height={PH}
              fill="var(--adapt-soft)"
              opacity={0.5}
            />
          )}

          {/* grid */}
          {gridY.map((v) => (
            <g key={v}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={sy(v)}
                y2={sy(v)}
                stroke="var(--line-soft)"
                strokeWidth={1}
              />
              <text
                x={PAD.l - 8}
                y={sy(v) + 3.5}
                textAnchor="end"
                fontSize={10.5}
                fontFamily="var(--font-mono)"
                fill="var(--ink-faint)"
              >
                {v.toFixed(2)}
              </text>
            </g>
          ))}
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={sy(0)}
            y2={sy(0)}
            stroke="var(--ink-faint)"
            strokeWidth={1}
          />
          {[0, 0.25, 0.5, 0.75, 1].map((a) => (
            <text
              key={a}
              x={sx(a)}
              y={H - PAD.b + 18}
              textAnchor="middle"
              fontSize={10.5}
              fontFamily="var(--font-mono)"
              fill="var(--ink-faint)"
            >
              {a}
            </text>
          ))}
          <text
            x={PAD.l + PW / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="var(--ink-soft)"
          >
            residual MAPK activity α (1 = untreated, 0 = full knockout)
          </text>

          {/* threshold */}
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={sy(p.theta)}
            y2={sy(p.theta)}
            stroke="var(--ink-soft)"
            strokeWidth={1.2}
            strokeDasharray="6 4"
          />
          <text
            x={W - PAD.r - 4}
            y={sy(p.theta) - 6}
            textAnchor="end"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="var(--ink-soft)"
          >
            bypass threshold θ
          </text>

          {/* curves */}
          <path d={outPath} fill="none" stroke={OUTPUT} strokeWidth={2} />
          <path d={drivePath} fill="none" stroke={DRIVE} strokeWidth={2.4} />

          {/* direct labels */}
          <text
            x={sx(0.045)}
            y={sy(receptorDrive(0.045, p)) - 10}
            fontSize={11.5}
            fontWeight={600}
            fontFamily="var(--font-mono)"
            fill={DRIVE}
          >
            r(α) receptor drive
          </text>
          <text
            x={sx(0.62)}
            y={sy(outputY(0.62, p)) + 18}
            fontSize={11.5}
            fontWeight={600}
            fontFamily="var(--font-mono)"
            fill={OUTPUT}
          >
            y(α) pathway output
          </text>

          {/* α_crit marker */}
          {crit.regime === "intermediate" && crit.value !== null && (
            <g>
              <line
                x1={sx(crit.value)}
                x2={sx(crit.value)}
                y1={PAD.t}
                y2={PAD.t + PH}
                stroke="var(--adapt)"
                strokeWidth={1.4}
                strokeDasharray="2 4"
              />
              <text
                x={sx(crit.value)}
                y={PAD.t + 12}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                fill="var(--adapt)"
              >
                α_crit = {crit.value.toFixed(2)}
              </text>
            </g>
          )}

          {/* current α marker */}
          <g>
            <line
              x1={sx(alpha)}
              x2={sx(alpha)}
              y1={PAD.t}
              y2={PAD.t + PH}
              stroke="var(--ink)"
              strokeWidth={1.4}
            />
            <circle
              cx={sx(alpha)}
              cy={sy(receptorDrive(alpha, p))}
              r={5.5}
              fill={DRIVE}
              stroke="var(--paper-inset)"
              strokeWidth={2}
            />
            <circle
              cx={sx(alpha)}
              cy={sy(outputY(alpha, p))}
              r={5.5}
              fill={OUTPUT}
              stroke="var(--paper-inset)"
              strokeWidth={2}
            />
          </g>

          {/* crosshair tooltip */}
          {hover !== null && (
            <g pointerEvents="none">
              <line
                x1={sx(hover)}
                x2={sx(hover)}
                y1={PAD.t}
                y2={PAD.t + PH}
                stroke="var(--ink-faint)"
                strokeWidth={1}
              />
              {(() => {
                const bx = Math.min(sx(hover) + 10, W - 172);
                const by = PAD.t + 8;
                return (
                  <g>
                    <rect
                      x={bx}
                      y={by}
                      width={158}
                      height={64}
                      rx={6}
                      fill="var(--paper-inset)"
                      stroke="var(--line)"
                    />
                    <text x={bx + 10} y={by + 18} fontSize={11} fontFamily="var(--font-mono)" fill="var(--ink-soft)">
                      α = {hover.toFixed(2)}
                    </text>
                    <text x={bx + 10} y={by + 36} fontSize={11} fontFamily="var(--font-mono)" fill={DRIVE} fontWeight={600}>
                      r = {receptorDrive(hover, p).toFixed(3)}
                    </text>
                    <text x={bx + 10} y={by + 54} fontSize={11} fontFamily="var(--font-mono)" fill={OUTPUT} fontWeight={600}>
                      y = {outputY(hover, p).toFixed(3)}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}
        </svg>
        <div className="mt-1 flex items-center gap-5 px-1 font-mono text-[0.72rem] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-5 rounded" style={{ background: DRIVE }} />
            r(α) = u / (1 + αgh)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-5 rounded" style={{ background: OUTPUT }} />
            y(α) = αgu / (1 + αgh)
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Slider
          label="drug: α"
          value={alpha}
          min={0}
          max={1}
          step={0.01}
          onChange={setAlpha}
          accent="var(--ink)"
        />
        <div className="border-t border-line-soft pt-4">
          <div className="mb-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-ink-faint">
            module parameters
          </div>
          <div className="flex flex-col gap-3">
            <Slider label="drive u" value={p.u} min={0.2} max={2} step={0.05} onChange={(u) => setP({ ...p, u })} />
            <Slider label="gain g" value={p.g} min={0.5} max={6} step={0.1} onChange={(g) => setP({ ...p, g })} />
            <Slider label="feedback h" value={p.h} min={0} max={4} step={0.1} onChange={(h) => setP({ ...p, h })} />
            <Slider label="threshold θ" value={p.theta} min={0.1} max={1.5} step={0.01} onChange={(theta) => setP({ ...p, theta })} />
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 border-t border-line-soft pt-4">
          <Verdict
            ok={!armed}
            okText={`r(α) = ${receptorDrive(alpha, p).toFixed(2)} < θ — rule dormant`}
            failText={`r(α) = ${receptorDrive(alpha, p).toFixed(2)} ≥ θ — ρ_EGFR ARMED`}
          />
          <p className="font-mono text-[0.72rem] leading-relaxed text-ink-soft">
            {crit.regime === "intermediate" &&
              `guard true exactly when α ≤ α_crit = ${crit.value!.toFixed(2)}`}
            {crit.regime === "never" && "u < θ: the bypass can never arm"}
            {crit.regime === "always" && "u ≥ θ(1+gh): armed even untreated"}
          </p>
        </div>
      </div>
    </div>
  );
}
