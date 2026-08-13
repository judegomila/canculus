import { K, Eq } from "@/components/math";
import {
  CodeBlock,
  FigureShell,
  Note,
  P,
  Prose,
  SectionHeading,
  Term,
  Wide,
} from "@/components/prose";
import { RouteExplorer } from "@/components/widgets/RouteExplorer";
import { FeedbackChart } from "@/components/widgets/FeedbackChart";
import { ClosureLab } from "@/components/widgets/ClosureLab";
import { PenaltyLab } from "@/components/widgets/PenaltyLab";
import { UpwardClosureToy } from "@/components/widgets/UpwardClosureToy";
import { ReciprocalTrap } from "@/components/widgets/ReciprocalTrap";
import { HorizonSlider } from "@/components/widgets/HorizonSlider";

const OPERATORS: [string, string, string][] = [
  ["P;Q", "serial composition", "output of P feeds input of Q"],
  ["P \\otimes Q", "parallel composition", "modules coexist with separate ports"],
  ["P \\oplus Q", "sufficient alternative", "either branch can realize the phenotype"],
  ["P \\wedge Q", "joint requirement", "both branches are required"],
  ["\\mathrm{Fb}_Z(P)", "feedback closure", "an output is looped back to an input"],
  ["[c]P", "context guard", "admissible only when c holds"],
  ["\\mathsf{D}_\\delta P", "delay", "shift activation by δ"],
  ["\\mathsf{I}_u P", "intervention", "apply a target / dose / schedule map"],
  ["\\mathsf{A}_\\rho P", "adaptation", "close P under adaptive rule set ρ"],
];

const GLOSSARY: [string, string][] = [
  ["Route", "a minimal set of capabilities sufficient for a phenotype under monotone Boolean semantics."],
  ["Route normal form", "the canonical antichain of minimal sufficient routes of a finite monotone phenotype."],
  ["Intervention", "a transformation representing target modulation, dose, or schedule; exact knockout is one semantic case."],
  ["Adaptation rule", "a guarded rule that makes new routes admissible after treatment and prerequisite conditions."],
  ["Adaptation closure", "the least fixed point obtained by repeatedly applying all enabled adaptation rules."],
  ["Escape set", "adaptation-closed routes left unblocked by a candidate intervention."],
  ["Robust cut", "an intervention that hits every route in its own intervention-dependent adaptation closure."],
  ["Rewrite certificate", "a record of semantic profile, objective, assumptions, error, proof, and provenance for a reduction."],
];

export default function Home() {
  return (
    <main className="essay pb-32">
      {/* ---------------- hero ---------------- */}
      <header className="relative overflow-hidden border-b border-line">
        <div className="mx-auto max-w-[64rem] px-5 pt-24 pb-16">
          <div className="rise-in font-mono text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cut">
            An interactive walkthrough · with live simulations
          </div>
          <h1
            className="rise-in mt-6 max-w-[17ch] text-[clamp(2.6rem,6.5vw,4.6rem)] leading-[1.04] font-semibold"
            style={{ animationDelay: "80ms" }}
          >
            The pathway map is not the territory.
          </h1>
          <p
            className="rise-in mt-8 max-w-[46ch] text-[1.28rem] leading-relaxed text-ink-soft"
            style={{ animationDelay: "160ms" }}
          >
            Cancer cells rewrite their own wiring in response to treatment.{" "}
            <em>A Compositional Calculus for Adaptive Biological Pathways</em>{" "}
            proposes an algebra in which that rewriting is an operator you can
            compute with — and cutting the network becomes a theorem, with a
            certificate saying exactly when it holds.
          </p>
          <div
            className="rise-in mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-1 font-mono text-[0.78rem] text-ink-soft"
            style={{ animationDelay: "240ms" }}
          >
            <span>
              Paper: <span className="text-ink">Jude Gomila</span>, August 2026
            </span>
            <span className="text-ink-faint">·</span>
            <span>every widget below runs the paper&apos;s actual algorithms</span>
          </div>
        </div>
      </header>

      <Prose>
        {/* ---------------- 1 ---------------- */}
        <SectionHeading n="1" id="problem" title="Maps that can’t calculate" />
        <P>
          A molecular pathway diagram answers a <em>representational</em>{" "}
          question: which components are believed to influence which others?
          An engineer facing adaptive cancer needs a stronger object. The
          questions that matter are <em>calculational</em>: Which subnetworks
          can be replaced without changing the control objective? Which
          apparently distinct escape routes share a bottleneck? Which
          intervention <em>releases</em> a feedback loop? Which resistance
          route exists only <em>after</em> treatment?
        </P>
        <P>
          The paper&apos;s analogy is De Morgan&apos;s laws: they didn&apos;t
          merely draw logic, they made logical statements{" "}
          <em>transformable</em>. The ambition here is a small, typed set of
          operators and reduction laws for pathways — with explicit semantic
          guarantees, so a simplification can never quietly discard the thing
          it was supposed to preserve.
        </P>
        <Note label="Status">
          The paper is a mathematical proposal. Its theorems are exact within
          the stated semantics; the biological mappings and the worked oncology
          examples are hypotheses requiring empirical validation. Nothing here
          is clinical advice — and this page inherits that boundary.
        </Note>

        {/* ---------------- 2 ---------------- */}
        <SectionHeading n="2" id="routes" title="Survival as a Boolean of routes" />
        <P>
          The simplest of the paper&apos;s three semantic profiles —{" "}
          <Term>Profile B</Term> — forgets kinetics entirely. Fix a finite set{" "}
          <K>V</K> of capabilities (targetable components). A cell state is a
          subset <K>{"x \\subseteq V"}</K>, and a phenotype is a monotone map{" "}
          <K>{"\\Phi : 2^V \\to \\mathbb{B}"}</K>: gaining a capability never
          destroys survival. Every such phenotype has a unique{" "}
          <Term>canonical route normal form</Term> — the antichain{" "}
          <K>{"\\mathcal{M}(\\Phi)"}</K> of minimal sufficient routes:
        </P>
        <Eq num="14">{"\\mathrm{RNF}(\\Phi) = \\bigvee_{r \\in \\mathcal{M}(\\Phi)} \\; \\bigwedge_{v \\in r} v"}</Eq>
        <P>
          And here is the first payoff. To force <K>{"\\Phi"}</K> false, an
          intervention must break <em>every</em> sufficient route. De
          Morgan&apos;s law turns the disjunction of routes into a conjunction
          of obligations:
        </P>
        <Eq num="16">{"\\neg\\Phi = \\bigwedge_{r \\in \\mathcal{M}(\\Phi)} \\Big( \\bigvee_{v \\in r} \\neg v \\Big)"}</Eq>
        <P>
          Minimal interventions are exactly the minimal{" "}
          <Term>transversals</Term> (hitting sets) of the route hypergraph
          (Theorem 6.4). Sufficient survival logic in, intervention
          constraints out — a compiler pass, not a metaphor.
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="Routes and their De Morgan dual"
          caption={
            <>
              The vocabulary of the paper&apos;s worked example: B (BRAF), M
              (MEK), E (ERK) form the baseline survival route; G∧R∧C∧M∧E is
              the bypass. Toggle capabilities to evaluate Φ(x); include the
              bypass route and watch every minimal cut set recompute. Note
              {" {B} "} stops being a cut the moment r₁ joins the family.
            </>
          }
        >
          <RouteExplorer />
        </FigureShell>
      </Wide>

      <Prose>
        {/* ---------------- 3 ---------------- */}
        <SectionHeading n="3" id="syntax" title="A typed syntax, three meanings" />
        <P>
          Above the Boolean picture sits a typed term language. Modules are
          arrows <K>{"a : X \\to Y"}</K> between interfaces, and nine operators
          build pathways from them:
        </P>

        <div className="my-8 overflow-x-auto">
          <table className="w-full border-collapse text-[0.95rem]">
            <thead>
              <tr className="border-b-2 border-ink/20 text-left font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-faint">
                <th className="py-2 pr-4 font-semibold">term</th>
                <th className="py-2 pr-4 font-semibold">name</th>
                <th className="py-2 font-semibold">reading</th>
              </tr>
            </thead>
            <tbody>
              {OPERATORS.map(([term, name, reading]) => (
                <tr key={name} className="border-b border-line-soft align-baseline">
                  <td className="py-2 pr-4"><K>{term}</K></td>
                  <td className="py-2 pr-4 font-medium">{name}</td>
                  <td className="py-2 text-ink-soft">{reading}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <P>
          The crucial design principle: <Term>syntax is not semantics</Term>.
          The same term can be read as Boolean route logic (Profile B), as
          signed local gains with delays (Profile G), or as full hybrid traces
          (Profile H). A rewrite valid in one profile may be false in another —
          so every rewrite carries a <Term>certificate</Term>: exact,
          conditional, approximate, or heuristic, with the hypotheses that make
          it valid. Two inhibitions compose to a positive <em>sign</em>, but
          that never certifies replacing the chain by an activating edge — the
          sign law preserves neither delay, saturation, nor the effect of
          drugging the intermediate node.
        </P>
        <Note label="Key idea">
          Equivalence is <em>indexed by purpose</em>. Two modules are
          interchangeable relative to a control specification{" "}
          <K>{"C = (\\mathcal{K}, \\mathcal{U}, \\mathcal{O}, \\varphi, d)"}</K>{" "}
          — admissible contexts, interventions, observations, target property,
          error metric. A kinase cascade and a threshold gate can be equivalent
          for terminal viability and inequivalent for transient toxicity. That
          is not a defect; it is the reason reduction is possible at all.
        </Note>

        {/* ---------------- 4 ---------------- */}
        <SectionHeading n="4" id="feedback" title="How a drug arms a rule" />
        <P>
          Here is the paper&apos;s bridge from continuous dynamics to discrete
          logic — the move that makes &ldquo;treatment-induced escape&rdquo;
          computable. Take a module with forward gain <K>g</K> under negative
          feedback of strength <K>h</K> (ERK suppressing receptor drive). A
          therapy attenuates the forward gain to <K>{"\\alpha g"}</K>, with{" "}
          <K>{"\\alpha \\in [0,1]"}</K> the residual activity. The upstream
          drive entering the module is then
        </P>
        <Eq num="52">{"r(\\alpha) = \\frac{u}{1 + \\alpha g h}, \\qquad \\frac{dr}{d\\alpha} = -\\frac{ugh}{(1+\\alpha gh)^2} < 0"}</Eq>
        <P>
          The derivative is negative: <em>the harder you inhibit, the more
          upstream drive you release</em>. If an EGFR-mediated bypass becomes
          biologically available when <K>{"r(\\alpha) \\ge \\theta"}</K>, the
          continuous profile has generated a fully specified guard for a
          discrete rule, with a closed-form critical dose{" "}
          <K>{"\\alpha_{\\mathrm{crit}} = (u/\\theta - 1)/gh"}</K>.
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="Feedback release — the continuous trigger of a discrete escape"
          caption={
            <>
              Drag α (or click the plot). Pushing the drug harder lowers output
              y(α) — and simultaneously raises receptor drive r(α) toward the
              bypass threshold θ. The shaded region is where the adaptation
              rule ρ<sub>EGFR</sub> is armed. Increase feedback strength h and
              watch the trap deepen: stronger feedback means more drive
              released per unit of inhibition.
            </>
          }
        >
          <FeedbackChart />
        </FigureShell>
      </Wide>

      <Prose>
        {/* ---------------- 5 ---------------- */}
        <SectionHeading n="5" id="closure" title="Adaptation is an operator" />
        <P>
          Treatment does not merely set a target to zero. It can release
          feedback, activate latent programs, and change which routes exist.
          The calculus makes this a first-class object: an{" "}
          <Term>adaptation rule</Term>{" "}
          <K>{"\\rho = (A_\\rho, \\gamma_\\rho, D_\\rho, \\delta_\\rho, \\ell_\\rho)"}</K>{" "}
          — prerequisites, a treatment-and-context guard, consequence routes, a
          delay, a scale label. Given an intervention <K>U</K> and context{" "}
          <K>c</K>, forward chaining closes the route family:
        </P>
        <Eq num="31">{"R^{*}_{U,c} = \\mathrm{lfp}(F_{U,c}), \\qquad F_{U,c}(R) = R_0 \\cup R \\cup \\bigcup_{\\rho:\\, A_\\rho \\subseteq R,\\; \\gamma_\\rho(U,c)=1} D_\\rho"}</Eq>
        <P>
          The least fixed point exists, is unique, and terminates in at most{" "}
          <K>{"|\\mathscr{R} \\setminus R_0|"}</K> rounds (Theorem 7.3) — the
          same mathematics as Horn-clause forward chaining. Then everything
          reduces to one clean criterion (Theorem 7.6):{" "}
          <em>an intervention is adaptation-robust iff it hits every route in
          its own closure</em>. The subtlety — and the paper&apos;s
          mathematical center — is that the hypergraph being cut{" "}
          <em>depends on the cut being tested</em>.
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="The closure laboratory — feedback-mediated MAPK escape"
          caption={
            <>
              The paper&apos;s worked example (§10, Table 4), live. Inhibit B
              alone: the baseline route dies, the guard fires, and the
              EGFR→RAS→CRAF bypass enters the family untouched — the
              &ldquo;cheapest&rdquo; static cut fails its own consequences.
              Switch the context to melanoma (low EGFR): same mutation, the
              guard never fires, and {"{B}"} alone is robust. Same driver
              mutation ≠ same control problem (Eq. 58).
            </>
          }
        >
          <ClosureLab />
        </FigureShell>
      </Wide>

      <Prose>
        <P>
          Running the closure for every candidate reproduces the paper&apos;s
          inclusion-minimal robust interventions (Eq. 56):
        </P>
        <Eq>{"\\{M\\}, \\quad \\{E\\}, \\quad \\{B,G\\}, \\quad \\{B,R\\}, \\quad \\{B,C\\}"}</Eq>
        <P>
          The algebra has separated two design patterns a tumor board would
          recognize instantly: <em>hit a common downstream bottleneck</em> (M
          or E), or <em>keep the upstream target and add a blocker specific to
          the induced bypass</em> (B plus G, R, or C). Which is preferable is
          not a question logic can answer — which is exactly the point of the
          next section.
        </P>

        {/* ---------------- 6 ---------------- */}
        <SectionHeading n="6" id="penalties" title="Logic proposes, pharmacology disposes" />
        <P>
          Assign each target a penalty aggregating toxicity, druggability,
          confidence, and burden. The static model — which sees only the
          baseline route — picks <K>{"\\{B\\}"}</K> at cost 0.6 and calls it a
          day. The adaptation-closed model rejects it outright and re-ranks
          the survivors.
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="Penalty-sensitive choice"
          caption={
            <>
              With the paper&apos;s illustrative penalties (Eq. 57), the
              preferred design flips from a single upstream drug to the
              combination {"{B,G}"} — cheaper than the bottleneck {"{M}"}.
              Drag the penalties: make MEK inhibition cheap and the bottleneck
              wins; make EGFR expensive and {"{B,R}"} takes over. The algebra
              enumerates the logically sufficient patterns once; ranking is a
              separate, swappable concern.
            </>
          }
        >
          <PenaltyLab />
        </FigureShell>
      </Wide>

      <Prose>
        {/* ---------------- 7 ---------------- */}
        <SectionHeading n="7" id="upward" title="Bigger is not safer" />
        <P>
          Static hitting sets have a comfortable property: any superset of a
          cut is still a cut. Adaptation destroys this (Proposition 7.8).
          Because guards test the intervention itself, <em>adding a drug can
          create the escape route you didn&apos;t block</em>.
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="Robustness is not upward closed"
          caption={
            <>
              The paper&apos;s three-element counterexample, live. This is not
              a curiosity: it means branch-and-bound pruning that discards all
              supersets of a failed (or successful) cut is unsound for
              adaptive systems, unless the rule system satisfies the
              monotonicity condition of Eq. 33. It is also the formal shadow
              of a real clinical anxiety — combination regimens can activate
              programs that monotherapy would not.
            </>
          }
        >
          <UpwardClosureToy />
        </FigureShell>
      </Wide>

      <Prose>
        <P>
          The price of all this honesty is complexity: deciding whether an
          admissible robust intervention exists within budget is NP-complete
          even with <em>no</em> adaptation rules (Theorem 7.9 — it contains
          Hitting Set). The paper&apos;s response is an exact
          counterexample-guided search: a master proposes the cheapest
          candidate, the closure oracle either certifies it or returns a{" "}
          <em>biologically interpretable escape route</em>, and that route
          becomes a new constraint. Every widget on this page is the
          small-model limit of that loop.
        </P>

        {/* ---------------- 8 ---------------- */}
        <SectionHeading n="8" id="time" title="Time is part of the type" />
        <P>
          Rules carry delays; routes acquire{" "}
          <Term>earliest activation times</Term> (Eq. 41), and the closure
          becomes horizon-indexed: <K>{"R^*_{U,c}(T)"}</K> contains only what
          can exist by time <K>T</K>. An intervention can be genuinely robust
          over a pharmacodynamic window and genuinely fail a week later —
          both statements are true, at different horizons.
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="Horizon-limited closure"
          caption={
            <>
              U = {"{B}"} with the transcriptional rule&apos;s delay at 12
              hours. Slide the observation horizon: the verdict flips exactly
              when the induced route&apos;s earliest activation time enters
              the window — why a short assay can bless a cut that a longer
              objective condemns.
            </>
          }
        >
          <HorizonSlider />
        </FigureShell>
      </Wide>

      <Prose>
        <P>
          Order matters too. Intervening then adapting is not adapting then
          intervening —{" "}
          <K>{"\\mathsf{A}_\\rho \\mathsf{I}_u P \\not\\simeq_C \\mathsf{I}_u \\mathsf{A}_\\rho P"}</K>{" "}
          (Eq. 28) — and two scheduled interventions need not commute, because
          the first changes the route family the second encounters. Schedules
          form a noncommutative algebra of timed words; &ldquo;does order
          matter for objective C?&rdquo; becomes a computable discrepancy{" "}
          <K>{"\\Delta_C"}</K> rather than a vague claim about synergy.
        </P>

        {/* ---------------- 9 ---------------- */}
        <SectionHeading n="9" id="cases" title="Three ways static reasoning fails" />
        <P>
          The paper stress-tests the calculus against three canonical
          adaptive-resistance mechanisms — not to claim it would have
          discovered the biology, but to check that the representation turns
          published mechanisms into reusable control deductions.
        </P>
        <P>
          <Term>Context-guarded route creation.</Term> BRAF-V600E colorectal
          cancer versus melanoma — the closure laboratory above, where the
          lineage flag changes the entire cut structure. The formalism&apos;s
          upgrade is the explicit inequality{" "}
          <K>{"\\mathrm{MinCut}(R_0) \\ne \\mathrm{MinCut}(\\mathrm{Cl}_{\\Gamma,c}(R_0, U))"}</K>.
        </P>
        <P>
          <Term>Feedback-port reopening.</Term> mTOR inhibition relieves
          S6K-mediated suppression of IRS-1 and thereby reactivates upstream
          AKT — the intervention removes an inhibitory edge the pathway had
          created itself. The engineering rule extracted: a module may be
          black-boxed only if its interface retains every feedback port whose
          sign or gain an admissible intervention can change; and a
          feedback-sensitive certificate should report an upstream rebound
          vector, not just the downstream marker.
        </P>
        <P>
          <Term>Reciprocal intervention-induced escape.</Term> In
          PTEN-deficient prostate cancer, AR and PI3K signaling suppress each
          other: inhibit either and the other rises. Two individually
          plausible controllers, each arming the other&apos;s escape:
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="The two-controller trap"
          caption={
            <>
              A directed 2-cycle in the intervention-response graph — the
              paper&apos;s proposed pre-optimization diagnostic. Strongly
              connected components of this graph identify escape coalitions
              that must be covered together; combination design then targets
              the component, not a ranked list of individual nodes.
            </>
          }
        >
          <ReciprocalTrap />
        </FigureShell>
      </Wide>

      <Prose>
        {/* ---------------- 10 ---------------- */}
        <SectionHeading n="10" id="toolchain" title="From algebra to toolchain" />
        <P>
          The intended implementation is a compiler: pathway sources (SBML,
          BioPAX, rule-based models, perturbation tables) in; typed terms with
          provenance out; then objective-relevant abstraction, route normal
          form, adaptation closure, robust cuts, and a counterexample-or-
          certificate report. The paper even sketches a surface syntax:
        </P>
        <CodeBlock>{`context CRC_BRAF_V600E
level L0 signaling

route basal_mapk  = BRAF & MEK & ERK -> survival
route egfr_bypass = EGFR & RAS & CRAF & MEK & ERK -> survival

intervention i_braf targets BRAF mode=attenuation residual=alpha
feedback ERK -| EGFR gain=h

adapt when i_braf and receptor_drive(alpha) >= theta
      enable egfr_bypass delay=30min evidence=Corcoran2012

objective suppress survival over [0,72h]
          preserve normal_epithelium >= safety_threshold

solve robust_cut minimize toxicity + uncertainty + cardinality`}</CodeBlock>
        <P>
          The language separates <code className="font-mono text-[0.85em]">route</code>,{" "}
          <code className="font-mono text-[0.85em]">feedback</code>,{" "}
          <code className="font-mono text-[0.85em]">intervention</code>,{" "}
          <code className="font-mono text-[0.85em]">adapt</code>, and{" "}
          <code className="font-mono text-[0.85em]">objective</code> — five
          things a plain pathway arrow silently conflates.
        </P>

        {/* ---------------- 11 ---------------- */}
        <SectionHeading n="11" id="honesty" title="What would falsify it" />
        <P>
          The proposal comes with its own failure criteria: if
          objective-equivalent reductions routinely fail under held-out
          interventions; if adaptation rules can&apos;t be learned even within
          narrow contexts; if closure-aware cuts never beat static cuts under
          matched information; if uncertainty-aware solutions collapse to
          &ldquo;inhibit nearly everything&rdquo; — the abstraction has failed
          at an identifiable level. A high compression ratio without objective
          fidelity is failure, not success.
        </P>
        <P>
          And the boundary is explicit: a robust cut is robust{" "}
          <em>relative to its declared route universe, rules, and contexts</em>.
          Unknown bypasses, spatial structure, immune interactions, and
          pharmacology live outside the model family. The calculus is a
          preclinical reasoning framework — a way to make pathway
          simplification carry its assumptions on its sleeve.
        </P>

        <Note label="Takeaway">
          Treat the pathway map as source code. Compile it to a typed term,
          reduce it relative to a declared objective, close it under
          adaptation, and only then ask for cuts, schedules, or experiments —
          each step carrying a certificate of what it preserved. Intervention
          changes the model; the calculus makes that change explicit and
          computable.
        </Note>

        {/* ---------------- glossary ---------------- */}
        <SectionHeading n="12" id="glossary" title="Glossary" />
        <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {GLOSSARY.map(([term, def]) => (
            <div key={term}>
              <dt className="font-display text-[1.05rem] font-semibold">{term}</dt>
              <dd className="mt-1 text-[0.98rem] leading-relaxed text-ink-soft">{def}</dd>
            </div>
          ))}
        </dl>
      </Prose>

      <footer className="mt-28 border-t border-line">
        <div className="mx-auto max-w-[64rem] px-5 py-12 font-mono text-[0.78rem] leading-relaxed text-ink-soft">
          <p className="max-w-[70ch]">
            An interactive exposition of{" "}
            <em>A Compositional Calculus for Adaptive Biological Pathways:
            objective-relative reduction, intervention duality, feedback, and
            multiscale escape in oncology control networks</em> (Jude Gomila,
            2026). The simulations implement the paper&apos;s Profile-B kernel
            — route normal form, De Morgan duality, forward-chaining
            adaptation closure, robust-cut search, feedback release, timed
            closure — and are verified against the paper&apos;s Table 4,
            Eq. 56, and Prop. 7.8 in the test suite.
          </p>
          <p className="mt-4 text-ink-faint">
            Preprint-status caveats apply throughout: formal results are exact
            within the stated semantics; biological mappings are hypotheses;
            nothing here is clinical treatment advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
