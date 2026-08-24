import { describe, expect, it } from "vitest";
import {
  adaptationClosure,
  alphaCrit,
  horizonClosure,
  minimalAntichain,
  minimalRobustCuts,
  minimalTransversals,
  phenotype,
  rankedRobustCuts,
  receptorDrive,
  robustAtHorizon,
  routeKey,
} from "./calculus";
import {
  DEFAULT_FEEDBACK,
  DEFAULT_PENALTIES,
  MELANOMA_CONTEXT,
  brafSystem,
  r0,
  r1,
  rMel,
  reciprocalPairSystem,
  upwardClosureCounterexample,
} from "./models";

const keys = (routes: readonly (readonly string[])[]) =>
  routes.map(routeKey).sort();

describe("route normal form (Prop. 6.2)", () => {
  it("removes routes containing a strictly smaller sufficient route", () => {
    const nf = minimalAntichain([
      ["B", "M", "E"],
      ["B", "M", "E", "G"], // redundant superset
      ["M"],
    ]);
    expect(keys(nf)).toEqual(["M"]); // {M} absorbs both
  });

  it("keeps incomparable routes (antichain)", () => {
    const nf = minimalAntichain([r0, r1]);
    expect(keys(nf)).toEqual(keys([r0, r1]));
  });

  it("phenotype is monotone: adding capabilities never destroys it", () => {
    const routes = [r0];
    expect(phenotype(routes, new Set(["B", "M", "E"]))).toBe(true);
    expect(phenotype(routes, new Set(["B", "M", "E", "G"]))).toBe(true);
    expect(phenotype(routes, new Set(["B", "M"]))).toBe(false);
  });
});

describe("static De Morgan duality (Thm. 6.4)", () => {
  it("minimal transversals of the baseline are the singletons {B},{M},{E}", () => {
    const cuts = minimalTransversals([r0], ["B", "G", "R", "C", "M", "E"]);
    expect(cuts.map((c) => c.join("+")).sort()).toEqual(["B", "E", "M"]);
  });
});

describe("feedback release (Eqs. 52–53)", () => {
  it("drive rises as inhibition deepens: r(0.1) > r(1)", () => {
    expect(receptorDrive(0.1, DEFAULT_FEEDBACK)).toBeGreaterThan(
      receptorDrive(1, DEFAULT_FEEDBACK),
    );
  });

  it("α_crit matches the closed form in the intermediate regime", () => {
    const { u, g, h, theta } = DEFAULT_FEEDBACK;
    const res = alphaCrit(DEFAULT_FEEDBACK);
    expect(res.regime).toBe("intermediate");
    expect(res.value).toBeCloseTo((u / theta - 1) / (g * h), 10);
    // guard true exactly below the critical residual activity
    expect(receptorDrive(res.value! - 0.01, DEFAULT_FEEDBACK)).toBeGreaterThan(theta);
    expect(receptorDrive(res.value! + 0.01, DEFAULT_FEEDBACK)).toBeLessThan(theta);
  });

  it("never / always regimes", () => {
    expect(alphaCrit({ u: 0.4, g: 3, h: 2, theta: 0.55 }).regime).toBe("never");
    expect(alphaCrit({ u: 5, g: 3, h: 2, theta: 0.55 }).regime).toBe("always");
  });
});

describe("adaptation closure reproduces Table 4", () => {
  const sys = brafSystem();

  const closureFor = (U: string[]) =>
    adaptationClosure(sys.baseline, sys.rules, new Set(U), sys.ctx);

  it("∅: closure {r0}, escape {r0}", () => {
    const res = closureFor([]);
    expect(keys(res.closed)).toEqual(keys([r0]));
    expect(keys(res.escape)).toEqual(keys([r0]));
    expect(res.robust).toBe(false);
  });

  it("{B}: guard fires, closure {r0, r1}, escape {r1} — static cut fails", () => {
    const res = closureFor(["B"]);
    expect(keys(res.closed)).toEqual(keys([r0, r1]));
    expect(keys(res.escape)).toEqual(keys([r1]));
    expect(res.robust).toBe(false);
    expect(res.trace).toHaveLength(1);
    expect(res.trace[0].ruleId).toBe("rho_EGFR");
  });

  it("{M}: no rule fires, robust", () => {
    const res = closureFor(["M"]);
    expect(keys(res.closed)).toEqual(keys([r0]));
    expect(res.robust).toBe(true);
  });

  it("{B,G} and {B,R}: rule fires but bypass is hit — robust", () => {
    for (const U of [["B", "G"], ["B", "R"]]) {
      const res = closureFor(U);
      expect(keys(res.closed)).toEqual(keys([r0, r1]));
      expect(res.robust).toBe(true);
    }
  });

  it("melanoma: the EGFR guard is false, so r1 never enters the family", () => {
    const mel = brafSystem(MELANOMA_CONTEXT);
    const res = adaptationClosure(
      mel.baseline,
      mel.rules,
      new Set(["B"]),
      mel.ctx,
      mel.universe,
    );
    expect(keys(res.closed)).not.toContain(routeKey(r1));
  });

  /**
   * Guards against regressing to the paper's Eq. 58 reading, where melanoma
   * looked adaptation-robust under {B}. That verdict came from an empty rule
   * set, not from biology: relapse on BRAF-inhibitor monotherapy in melanoma
   * is near-universal. With the reactivation rule encoded, {B} correctly
   * fails — just on a slower clock.
   */
  it("melanoma: {B} is NOT robust — it opens MAPK reactivation instead", () => {
    const mel = brafSystem(MELANOMA_CONTEXT);
    const res = adaptationClosure(
      mel.baseline,
      mel.rules,
      new Set(["B"]),
      mel.ctx,
      mel.universe,
    );
    expect(keys(res.closed)).toEqual(keys([r0, rMel]));
    expect(res.robust).toBe(false);
    expect(keys(res.escape)).toEqual([routeKey(rMel)]);
  });

  it("melanoma escape is slow: {B} holds for weeks, then fails", () => {
    const mel = brafSystem(MELANOMA_CONTEXT);
    const U = new Set(["B"]);
    expect(robustAtHorizon(mel, U, 168)).toBe(true); // one week
    expect(robustAtHorizon(mel, U, 2160)).toBe(false); // three months
  });

  it("reports how many rules are encoded, so silence is not read as safety", () => {
    const mel = brafSystem(MELANOMA_CONTEXT);
    const crc = brafSystem();
    const melRes = adaptationClosure(
      mel.baseline,
      mel.rules,
      new Set(["B"]),
      mel.ctx,
      mel.universe,
    );
    const crcRes = adaptationClosure(
      crc.baseline,
      crc.rules,
      new Set(["B"]),
      crc.ctx,
      crc.universe,
    );
    expect(melRes.rulesEncoded).toBe(1);
    expect(crcRes.rulesEncoded).toBe(1);

    // A context with no encoded mechanisms must not report coverage.
    const bare = brafSystem({ name: "unmodelled tissue", flags: {} });
    const bareRes = adaptationClosure(
      bare.baseline,
      bare.rules,
      new Set(["B"]),
      bare.ctx,
      bare.universe,
    );
    expect(bareRes.robust).toBe(true);
    expect(bareRes.rulesEncoded).toBe(0);
  });
});

describe("inclusion-minimal robust cuts (Eq. 56)", () => {
  it("are exactly {M}, {E}, {B,G}, {B,R}, {B,C}", () => {
    const cuts = minimalRobustCuts(brafSystem());
    expect(cuts.map((c) => c.join("+")).sort()).toEqual(
      ["B+C", "B+G", "B+R", "E", "M"].sort(),
    );
  });
});

describe("penalty-sensitive choice (Section 10.4)", () => {
  it("static optimum is {B} at 0.6; adaptive optimum is {B,G} at 1.3 < {M} at 1.6", () => {
    const sys = brafSystem();
    const staticCuts = minimalTransversals(sys.baseline, sys.universe);
    const staticBest = staticCuts
      .map((c) => ({ c, cost: c.reduce((s, v) => s + DEFAULT_PENALTIES[v], 0) }))
      .sort((a, b) => a.cost - b.cost)[0];
    expect(staticBest.c).toEqual(["B"]);
    expect(staticBest.cost).toBeCloseTo(0.6);

    const ranked = rankedRobustCuts(sys, DEFAULT_PENALTIES);
    expect(ranked[0].cut).toEqual(["B", "G"]);
    expect(ranked[0].cost).toBeCloseTo(1.3);
    const mCut = ranked.find((x) => x.cut.join("") === "M")!;
    expect(mCut.cost).toBeCloseTo(1.6);
  });
});

describe("robustness is not upward closed (Prop. 7.8)", () => {
  it("{a} robust, superset {a,b} not robust", () => {
    const sys = upwardClosureCounterexample();
    const a = adaptationClosure(sys.baseline, sys.rules, new Set(["a"]), sys.ctx);
    const ab = adaptationClosure(sys.baseline, sys.rules, new Set(["a", "b"]), sys.ctx);
    expect(a.robust).toBe(true);
    expect(ab.robust).toBe(false);
    expect(keys(ab.escape)).toEqual(["c"]);
  });
});

describe("reciprocal escape pair (Section 11.3)", () => {
  it("blocking either arm alone enables the other; only {AR,AKT} is robust", () => {
    const sys = reciprocalPairSystem();
    const ar = adaptationClosure(sys.baseline, sys.rules, new Set(["AR"]), sys.ctx);
    expect(ar.robust).toBe(false);
    expect(keys(ar.escape)).toEqual(["AKT"]);
    const cuts = minimalRobustCuts(sys);
    expect(cuts.map((c) => [...c].sort().join("+"))).toEqual(["AKT+AR"]);
  });
});

describe("timed closure (Eqs. 41–42)", () => {
  it("{B} is robust before the rule delay elapses and fails after", () => {
    const sys = brafSystem(); // ρ_EGFR delay = 12
    const U = new Set(["B"]);
    expect(robustAtHorizon(sys, U, 6)).toBe(true); // pharmacodynamic window
    expect(robustAtHorizon(sys, U, 24)).toBe(false); // transcription caught up
    expect(keys(horizonClosure(sys, U, 24))).toEqual(keys([r0, r1]));
  });
});
