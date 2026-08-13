"use client";

import { useMemo, useState } from "react";
import {
  minimalAntichain,
  minimalTransversals,
  phenotype,
} from "@/lib/calculus";
import { BRAF_CAPS, r0, r1 } from "@/lib/models";
import { Chip, Verdict, displayOrder } from "./ui";

/**
 * Static route semantics and De Morgan duality (§5.1, §6.2–6.3):
 * toggle which capabilities the cell currently has, watch Φ(x); include
 * the bypass route in the family and watch every minimal cut set change.
 */
export function RouteExplorer() {
  const [state, setState] = useState<Set<string>>(new Set(["B", "M", "E"]));
  const [withBypass, setWithBypass] = useState(false);

  const family = useMemo(
    () => minimalAntichain(withBypass ? [r0, r1] : [r0]),
    [withBypass],
  );
  const phi = phenotype(family, state);
  const cuts = useMemo(
    () => minimalTransversals(family, BRAF_CAPS.map((c) => c.id)),
    [family],
  );

  const toggle = (id: string) =>
    setState((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
          Cell state x ⊆ V — click to grant / remove a capability
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {BRAF_CAPS.map((c) => (
            <Chip
              key={c.id}
              id={c.id}
              label={c.name}
              tone="route"
              selected={state.has(c.id)}
              onClick={() => toggle(c.id)}
            />
          ))}
        </div>

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setWithBypass((b) => !b)}
            aria-pressed={withBypass}
            className={`rounded-md border px-3 py-1.5 font-mono text-[0.78rem] font-medium transition-colors ${
              withBypass
                ? "border-adapt bg-adapt-soft text-adapt"
                : "border-line bg-paper-inset text-ink-soft hover:border-ink-faint"
            }`}
          >
            {withBypass ? "✓ " : ""}include bypass route r₁ in the family
          </button>
        </div>

        <Verdict
          ok={!phi}
          okText="Φ(x) = 0 — phenotype off"
          failText="Φ(x) = 1 — cell survives"
        />
      </div>

      <div className="grid gap-5">
        <div>
          <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-route">
            Minimal sufficient routes M(Φ)
          </div>
          <div className="flex flex-col gap-1.5">
            {family.map((r) => (
              <div
                key={r.join("+")}
                className="rounded border border-route/40 bg-route-soft/50 px-3 py-1.5 font-mono text-[0.85rem]"
              >
                {displayOrder(r).join(" ∧ ")}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-cut">
            Minimal cut sets = minimal transversals (De Morgan dual)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {cuts.map((c) => (
              <div
                key={c.join("+")}
                className="rounded border border-cut/40 bg-cut-soft/60 px-3 py-1.5 font-mono text-[0.85rem] text-cut"
              >
                {"{" + c.join(", ") + "}"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
