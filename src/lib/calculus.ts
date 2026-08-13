/**
 * A minimal executable kernel for the route-level fragment of
 * "A Compositional Calculus for Adaptive Biological Pathways" (Gomila, 2026).
 *
 * Implements: monotone Boolean route semantics (Profile B), canonical route
 * normal form (minimal-route antichains), De Morgan intervention duality
 * (hypergraph transversals), intervention-dependent adaptation closure
 * (least fixed point by forward chaining, Algorithm 1), escape sets,
 * adaptation-robust cuts, penalty-optimal robust cut search, the linear
 * feedback-release calculation (Eqs. 22–24, 52–53), and earliest activation
 * times with horizon-limited closure (Eqs. 41–42).
 *
 * Everything is exact: the worked models are small (|V| <= 8), so subset
 * enumeration and fixed-point iteration terminate quickly in the browser.
 */

export type Cap = string;

/** A route is a set of capabilities, canonically stored sorted. */
export type Route = readonly Cap[];

export const routeKey = (r: Route): string => [...r].sort().join("+");

export const sameRoute = (a: Route, b: Route): boolean =>
  routeKey(a) === routeKey(b);

export const isSubset = (a: Route, b: Route): boolean => {
  const bs = new Set(b);
  return a.every((v) => bs.has(v));
};

/** r is unblocked by intervention U when r ∩ U = ∅ (Def. 7.4). */
export const disjoint = (r: Route, U: ReadonlySet<Cap>): boolean =>
  r.every((v) => !U.has(v));

/**
 * Canonical route normal form: keep only inclusion-minimal routes
 * (Prop. 6.2 — the antichain M(Φ) is unique).
 */
export function minimalAntichain(routes: readonly Route[]): Route[] {
  const uniq = new Map<string, Route>();
  for (const r of routes) uniq.set(routeKey(r), [...r].sort());
  const all = [...uniq.values()];
  return all.filter(
    (r) => !all.some((s) => !sameRoute(s, r) && isSubset(s, r)),
  );
}

/** Monotone phenotype Φ(x) = ∨_routes ∧_caps (Eq. 14). */
export function phenotype(routes: readonly Route[], state: ReadonlySet<Cap>): boolean {
  return routes.some((r) => r.every((v) => state.has(v)));
}

/* ------------------------------------------------------------------ */
/* Adaptation rules and closure                                        */
/* ------------------------------------------------------------------ */

export interface AdaptationRule {
  id: string;
  /** A_ρ: prerequisite routes that must already be in the family. */
  prereqRoutes: Route[];
  /** γ_ρ(U, c): treatment-and-context guard. */
  guard: (U: ReadonlySet<Cap>, ctx: Context) => boolean;
  /** Human-readable guard description, for derivation certificates. */
  guardLabel: string;
  /** D_ρ: consequence routes made admissible when the rule fires. */
  consequences: Route[];
  /** δ_ρ: delay before consequences activate (arbitrary time units). */
  delay: number;
  /** ℓ_ρ: scale label (L0 signaling … L3 population). */
  level: string;
}

export interface Context {
  name: string;
  /** free-form flags, e.g. { lineage: "CRC" } */
  flags: Record<string, string | number | boolean>;
}

export interface ClosureStep {
  round: number;
  ruleId: string;
  guardLabel: string;
  added: Route[];
}

export interface ClosureResult {
  /** R*_{U,c}: the adaptation-closed route family (least fixed point). */
  closed: Route[];
  /** Derivation trace: which rule fired in which round, what it added. */
  trace: ClosureStep[];
  /** Esc(U, c): closed routes disjoint from U (Def. 7.4). */
  escape: Route[];
  /** Esc(U, c) = ∅ (Def. 7.5). */
  robust: boolean;
}

/**
 * Algorithm 1: AdaptationClosure(R0, ρ, U, c).
 * Forward chaining to the least fixed point of F_{U,c} (Thm. 7.3).
 */
export function adaptationClosure(
  R0: readonly Route[],
  rules: readonly AdaptationRule[],
  U: ReadonlySet<Cap>,
  ctx: Context,
): ClosureResult {
  const family = new Map<string, Route>();
  for (const r of R0) family.set(routeKey(r), [...r].sort());
  const trace: ClosureStep[] = [];
  const fired = new Set<string>();

  let round = 0;
  let changed = true;
  while (changed) {
    changed = false;
    round += 1;
    for (const rule of rules) {
      if (fired.has(rule.id)) continue;
      const prereqOk = rule.prereqRoutes.every((p) => family.has(routeKey(p)));
      if (!prereqOk || !rule.guard(U, ctx)) continue;
      const added: Route[] = [];
      for (const q of rule.consequences) {
        const k = routeKey(q);
        if (!family.has(k)) {
          family.set(k, [...q].sort());
          added.push([...q].sort());
        }
      }
      fired.add(rule.id);
      if (added.length > 0) changed = true;
      trace.push({ round, ruleId: rule.id, guardLabel: rule.guardLabel, added });
    }
  }

  const closed = [...family.values()];
  const escape = closed.filter((r) => disjoint(r, U));
  return { closed, trace, escape, robust: escape.length === 0 };
}

/* ------------------------------------------------------------------ */
/* De Morgan duality: hypergraph transversals                          */
/* ------------------------------------------------------------------ */

function* subsetsBySize(universe: readonly Cap[]): Generator<Cap[]> {
  const n = universe.length;
  for (let size = 0; size <= n; size++) {
    // enumerate all subsets of a given size
    const idx = Array.from({ length: size }, (_, i) => i);
    if (size === 0) {
      yield [];
      continue;
    }
    while (true) {
      yield idx.map((i) => universe[i]);
      let i = size - 1;
      while (i >= 0 && idx[i] === n - size + i) i--;
      if (i < 0) break;
      idx[i]++;
      for (let j = i + 1; j < size; j++) idx[j] = idx[j - 1] + 1;
    }
  }
}

export const isTransversal = (
  U: readonly Cap[],
  routes: readonly Route[],
): boolean => {
  const us = new Set(U);
  return routes.every((r) => !disjoint(r, us));
};

/**
 * Minimal transversals of the route hypergraph (Thm. 6.4): the
 * inclusion-minimal exact interventions for a *static* route family.
 */
export function minimalTransversals(
  routes: readonly Route[],
  universe: readonly Cap[],
): Cap[][] {
  const found: Cap[][] = [];
  for (const U of subsetsBySize(universe)) {
    if (!isTransversal(U, routes)) continue;
    if (found.some((m) => isSubset(m, U))) continue; // a smaller hit set exists
    found.push(U);
  }
  return found;
}

/* ------------------------------------------------------------------ */
/* Adaptation-robust cuts (intervention-dependent hypergraph)          */
/* ------------------------------------------------------------------ */

export interface RouteRuleSystem {
  universe: Cap[];
  baseline: Route[];
  rules: AdaptationRule[];
  ctx: Context;
}

/**
 * Inclusion-minimal adaptation-robust interventions (Thm. 7.6): U such
 * that U hits every route in its own closure R*_{U,c}, and no proper
 * subset does. Note robustness need not be upward closed (Prop. 7.8),
 * so each candidate's closure must be computed separately.
 */
export function minimalRobustCuts(sys: RouteRuleSystem): Cap[][] {
  const robustSets: Cap[][] = [];
  const minimal: Cap[][] = [];
  for (const U of subsetsBySize(sys.universe)) {
    const res = adaptationClosure(sys.baseline, sys.rules, new Set(U), sys.ctx);
    if (!res.robust) continue;
    robustSets.push(U);
    if (!robustSets.some((m) => !sameRoute(m, U) && isSubset(m, U))) {
      minimal.push(U);
    }
  }
  return minimal;
}

export interface ScoredCut {
  cut: Cap[];
  cost: number;
  robust: boolean;
}

export const cutCost = (
  U: readonly Cap[],
  costs: Record<Cap, number>,
): number => U.reduce((s, v) => s + (costs[v] ?? 0), 0);

/**
 * Exact penalty-optimal search (the small-model analogue of Algorithm 2):
 * enumerate every admissible intervention, compute its closure, and rank.
 */
export function rankedRobustCuts(
  sys: RouteRuleSystem,
  costs: Record<Cap, number>,
): ScoredCut[] {
  const out: ScoredCut[] = [];
  for (const U of subsetsBySize(sys.universe)) {
    if (U.length === 0) continue;
    const res = adaptationClosure(sys.baseline, sys.rules, new Set(U), sys.ctx);
    if (res.robust) out.push({ cut: U, cost: cutCost(U, costs), robust: true });
  }
  // keep only inclusion-minimal robust cuts, then sort by cost
  const minimal = out.filter(
    (a) => !out.some((b) => !sameRoute(b.cut, a.cut) && isSubset(b.cut, a.cut)),
  );
  return minimal.sort((a, b) => a.cost - b.cost);
}

/* ------------------------------------------------------------------ */
/* Linear feedback release (Eqs. 20–24, 52–53)                          */
/* ------------------------------------------------------------------ */

export interface FeedbackParams {
  u: number; // upstream ligand drive
  g: number; // forward gain of the MAPK module
  h: number; // negative feedback strength
  theta: number; // bypass activation threshold on r(α)
}

/** y(α) = αg·u / (1 + αgh): pathway output under residual activity α. */
export const outputY = (alpha: number, p: FeedbackParams): number =>
  (alpha * p.g * p.u) / (1 + alpha * p.g * p.h);

/** r(α) = u / (1 + αgh): upstream receptor drive (Eq. 52). */
export const receptorDrive = (alpha: number, p: FeedbackParams): number =>
  p.u / (1 + alpha * p.g * p.h);

/** dr/dα = −ugh/(1+αgh)² < 0 (Eq. 24): stronger inhibition ⇒ more drive. */
export const driveSlope = (alpha: number, p: FeedbackParams): number =>
  (-p.u * p.g * p.h) / Math.pow(1 + alpha * p.g * p.h, 2);

/**
 * α_crit = (u/θ − 1)/(gh) (Eq. 53). Returns the threshold below which the
 * bypass guard r(α) ≥ θ becomes true, clamped to the three regimes:
 * never reached (u < θ), always reached (u ≥ θ(1+gh)), or intermediate.
 */
export function alphaCrit(p: FeedbackParams): {
  regime: "never" | "always" | "intermediate";
  value: number | null;
} {
  if (p.u < p.theta) return { regime: "never", value: null };
  if (p.u >= p.theta * (1 + p.g * p.h)) return { regime: "always", value: null };
  return { regime: "intermediate", value: (p.u / p.theta - 1) / (p.g * p.h) };
}

/* ------------------------------------------------------------------ */
/* Earliest activation times and horizon-limited closure (Eqs. 41–42)  */
/* ------------------------------------------------------------------ */

export interface TimedRoute {
  route: Route;
  /** earliest activation time; 0 for baseline, +∞ if underivable. */
  time: number;
}

/**
 * t(q) = min over enabled rules producing q of (max prereq time + δ_ρ),
 * computed by relaxation (a generalized shortest-hyperpath).
 */
export function earliestActivationTimes(
  sys: RouteRuleSystem,
  U: ReadonlySet<Cap>,
): TimedRoute[] {
  const t = new Map<string, number>();
  const routes = new Map<string, Route>();
  for (const r of sys.baseline) {
    t.set(routeKey(r), 0);
    routes.set(routeKey(r), [...r].sort());
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of sys.rules) {
      if (!rule.guard(U, sys.ctx)) continue;
      const prereqTimes = rule.prereqRoutes.map((p) => t.get(routeKey(p)));
      if (prereqTimes.some((x) => x === undefined)) continue;
      const start = Math.max(0, ...(prereqTimes as number[])) + rule.delay;
      for (const q of rule.consequences) {
        const k = routeKey(q);
        const cur = t.get(k);
        if (cur === undefined || start < cur) {
          t.set(k, start);
          routes.set(k, [...q].sort());
          changed = true;
        }
      }
    }
  }
  return [...routes.entries()].map(([k, route]) => ({
    route,
    time: t.get(k)!,
  }));
}

/** R*_{U,c}(T): routes activatable within horizon T (Eq. 42). */
export function horizonClosure(
  sys: RouteRuleSystem,
  U: ReadonlySet<Cap>,
  T: number,
): Route[] {
  return earliestActivationTimes(sys, U)
    .filter((x) => x.time <= T)
    .map((x) => x.route);
}

/**
 * An intervention robust at horizon T: hits every route available by T.
 */
export function robustAtHorizon(
  sys: RouteRuleSystem,
  U: ReadonlySet<Cap>,
  T: number,
): boolean {
  return horizonClosure(sys, U, T).every((r) => !disjoint(r, U));
}
