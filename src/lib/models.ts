/**
 * The paper's worked models, encoded against the kernel in calculus.ts.
 * All are deliberately small abstractions of published mechanisms — they
 * illustrate the calculus, they are not patient-specific models.
 */

import {
  AdaptationRule,
  Cap,
  Context,
  FeedbackParams,
  Route,
  RouteRuleSystem,
  alphaCrit,
  receptorDrive,
} from "./calculus";

/* ------------------------------------------------------------------ */
/* Section 10: feedback-mediated MAPK escape (BRAF-mutant CRC)          */
/* ------------------------------------------------------------------ */

/** V = {B, G, R, C, M, E} (Eq. 51 vocabulary). */
export const BRAF_CAPS: { id: Cap; name: string; role: string }[] = [
  { id: "B", name: "BRAF", role: "BRAF-dependent signaling capability" },
  { id: "G", name: "EGFR", role: "EGFR capability" },
  { id: "R", name: "RAS", role: "RAS capability" },
  { id: "C", name: "CRAF", role: "CRAF capability" },
  { id: "M", name: "MEK", role: "MEK capability" },
  { id: "E", name: "ERK", role: "ERK-dependent survival output" },
];

export const r0: Route = ["B", "M", "E"]; // baseline route (Eq. 51)
export const r1: Route = ["G", "R", "C", "M", "E"]; // induced bypass (Eq. 54)

export const CRC_CONTEXT: Context = {
  name: "BRAF-V600E colorectal",
  flags: { lineage: "CRC" },
};

export const MELANOMA_CONTEXT: Context = {
  name: "BRAF-V600E melanoma (low EGFR)",
  flags: { lineage: "melanoma" },
};

export const DEFAULT_FEEDBACK: FeedbackParams = {
  u: 1.0,
  g: 3.0,
  h: 2.0,
  theta: 0.55,
};

/**
 * ρ_EGFR (Eq. 54): fires when B is targeted, the lineage supports the
 * EGFR bypass, and the released receptor drive crosses the threshold.
 * The continuous profile supplies the guard for the discrete rule.
 */
export function egfrRule(
  fb: FeedbackParams = DEFAULT_FEEDBACK,
  alphaUnderTreatment = 0.1,
): AdaptationRule {
  return {
    id: "rho_EGFR",
    prereqRoutes: [r0],
    guard: (U, ctx) =>
      U.has("B") &&
      ctx.flags.lineage === "CRC" &&
      receptorDrive(alphaUnderTreatment, fb) >= fb.theta,
    guardLabel: "I_B ∧ r(α) ≥ θ ∧ c_CRC",
    consequences: [r1],
    delay: 12, // ~hours: transcriptional receptor feedback
    level: "L1",
  };
}

export function brafSystem(
  ctx: Context = CRC_CONTEXT,
  fb: FeedbackParams = DEFAULT_FEEDBACK,
  alphaUnderTreatment = 0.1,
): RouteRuleSystem {
  return {
    universe: BRAF_CAPS.map((c) => c.id),
    baseline: [r0],
    rules: [egfrRule(fb, alphaUnderTreatment)],
    ctx,
  };
}

/** Illustrative penalties (Eq. 57) — invented, not clinical estimates. */
export const DEFAULT_PENALTIES: Record<Cap, number> = {
  B: 0.6,
  G: 0.7,
  R: 2.0,
  C: 2.0,
  M: 1.6,
  E: 2.2,
};

/** Whether the EGFR bypass guard holds for the current parameters. */
export function bypassGuardHolds(
  fb: FeedbackParams,
  alphaUnderTreatment: number,
): boolean {
  return receptorDrive(alphaUnderTreatment, fb) >= fb.theta;
}

export { alphaCrit };

/* ------------------------------------------------------------------ */
/* Prop. 7.8: robustness need not be upward closed                      */
/* ------------------------------------------------------------------ */

/**
 * V = {a, b, c}, R0 = {{a}}, one rule whose guard is true exactly when
 * b ∈ U and whose consequence is {c}. Then {a} is robust while {a, b}
 * is not: adding a target created an obligation.
 */
export function upwardClosureCounterexample(): RouteRuleSystem {
  return {
    universe: ["a", "b", "c"],
    baseline: [["a"]],
    rules: [
      {
        id: "rho_b",
        prereqRoutes: [],
        guard: (U) => U.has("b"),
        guardLabel: "b ∈ U",
        consequences: [["c"]],
        delay: 1,
        level: "L1",
      },
    ],
    ctx: { name: "toy", flags: {} },
  };
}

/* ------------------------------------------------------------------ */
/* Section 11.3: reciprocal escape pair (PTEN-deficient prostate)       */
/* ------------------------------------------------------------------ */

/**
 * S = AR ∨ AKT with guarded rules ρ_A: I_AR ⇒ AKT and ρ_P: I_AKT ⇒ AR
 * (a coarse rendering of Eq. 66–67 with the PI3K arm collapsed to AKT).
 * Baseline: the AR arm is dominant; each inhibition enables the other arm.
 */
export function reciprocalPairSystem(): RouteRuleSystem {
  return {
    universe: ["AR", "AKT"],
    baseline: [["AR"]],
    rules: [
      {
        id: "rho_A",
        prereqRoutes: [],
        guard: (U, ctx) => U.has("AR") && ctx.flags.pten === "deficient",
        guardLabel: "I_AR ∧ c_PTEN−",
        consequences: [["AKT"]],
        delay: 24,
        level: "L1",
      },
      {
        id: "rho_P",
        prereqRoutes: [],
        guard: (U, ctx) => U.has("AKT") && ctx.flags.pten === "deficient",
        guardLabel: "I_PI3K/AKT ∧ c_PTEN−",
        consequences: [["AR"]],
        delay: 24,
        level: "L1",
      },
    ],
    ctx: { name: "PTEN-deficient prostate", flags: { pten: "deficient" } },
  };
}
