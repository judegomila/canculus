# canculus

An interactive walkthrough of **"A Compositional Calculus for Adaptive Biological Pathways"** (Jude Gomila, 2026) — an essay-length exposition with live simulations that run the paper's actual algorithms in the browser.

## What this is

The paper proposes a typed, compositional algebra for pathway reasoning in which
*intervention changes the model*: treating a network can release feedback and
open escape routes that a static cut set never accounted for. This site explains
that idea from first principles and lets you compute with it.

Every widget is backed by a real implementation of the paper's Profile-B kernel —
nothing is faked or pre-rendered:

| Section | Widget | What it computes |
|---|---|---|
| §2 | Routes and their De Morgan dual | monotone phenotype Φ(x), minimal-route antichain, minimal transversals (Thm 6.4) |
| §4 | Feedback release | r(α) = u/(1+αgh), y(α), α_crit and its three regimes (Eqs. 52–53) |
| §5 | The closure laboratory | forward-chaining least fixed point R*_{U,c}, escape set, robustness verdict, derivation trace (Alg. 1, Thm 7.6) |
| §6 | Penalty-sensitive choice | static vs adaptation-closed optima under live penalties (Eq. 57) |
| §7 | Robustness is not upward closed | the Prop. 7.8 counterexample |
| §8 | Horizon-limited closure | earliest activation times, R*(T) (Eqs. 41–42) |
| §9 | The two-controller trap | reciprocal escape pair, minimal robust cut (§11.3) |

## The kernel

`src/lib/calculus.ts` is a dependency-free TypeScript implementation of:

- **Route normal form** — inclusion-minimal antichains of a finite monotone phenotype (Prop. 6.2)
- **De Morgan intervention duality** — minimal hitting sets of the route hypergraph (Thm 6.4)
- **Adaptation closure** — least fixed point of the forward-chaining operator F_{U,c} (Def. 7.2, Thm 7.3), with a derivation trace
- **Escape sets and robust cuts** — Esc(U,c), adaptation-robust interventions (Def. 7.4–7.5, Thm 7.6)
- **Penalty-ranked robust cut search** — the small-model limit of the closure-oracle loop (Alg. 2)
- **Linear feedback release** — closed-loop gain, receptor drive, critical residual activity (Eqs. 20–24)
- **Timed closure** — earliest activation times by relaxation, horizon-limited robustness (Eqs. 41–42)

`src/lib/models.ts` encodes the paper's worked examples: the BRAF–EGFR MAPK
escape model (§10), the upward-closure counterexample (Prop. 7.8), and the
PTEN-deficient prostate reciprocal pair (§11.3).

## Verification

The test suite checks the kernel against the paper's stated results — Table 4's
closure calculation row by row, the Eq. 56 robust-cut family, the §10.4 penalty
ranking, the Eq. 58 context dependence, Prop. 7.8, and the α_crit closed form.

```bash
npm test        # 17 tests
npm run lint
npm run build
```

## Development

```bash
npm install
npm run dev     # http://localhost:3000
```

Built with Next.js (App Router), Tailwind CSS v4, KaTeX, and Motion.
Chart colors were validated for colorblind separation and contrast against the
page surface.

## Scope

The paper is a preprint proposing a mathematical language. Its theorems are
exact within the stated semantics; the biological mappings and worked oncology
examples are hypotheses requiring empirical validation. Neither the paper nor
this site provides clinical treatment advice.
