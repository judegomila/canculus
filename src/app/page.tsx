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
import { CascadeIntro } from "@/components/widgets/CascadeIntro";
import { RouteExplorer } from "@/components/widgets/RouteExplorer";
import { FeedbackChart } from "@/components/widgets/FeedbackChart";
import { ClosureLab } from "@/components/widgets/ClosureLab";
import { PenaltyLab } from "@/components/widgets/PenaltyLab";
import { UpwardClosureToy } from "@/components/widgets/UpwardClosureToy";
import { ReciprocalTrap } from "@/components/widgets/ReciprocalTrap";
import { HorizonSlider } from "@/components/widgets/HorizonSlider";

const CAST: [string, string, string][] = [
  ["B", "BRAF", "the kinase jammed on by the mutation; the drug's target"],
  ["M", "MEK", "the next kinase in the relay, downstream of BRAF"],
  ["E", "ERK", "the last kinase; its output drives survival, and it applies the brake"],
  ["G", "EGFR", "a receptor in the membrane, held down by that brake"],
  ["R", "RAS", "the switch EGFR turns on when released"],
  ["C", "CRAF", "BRAF's sibling; carries the rerouted signal back into MEK"],
];

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
  ["Kinase", "a protein that switches another protein on by attaching a phosphate group to it. A chain of them relays a signal."],
  ["Signalling pathway", "such a relay, from a receptor at the cell membrane to a decision in the nucleus."],
  ["Negative feedback", "a downstream component suppressing an upstream one. Weakening the downstream component therefore releases the upstream one."],
  ["Capability", "a coarse-grained ability the cell either has or lacks — the unit this calculus reasons about, in place of concentrations."],
  ["Monotone", "the assumption that gaining a capability never destroys the phenotype. It makes minimal routes a complete description."],
  ["Route", "a minimal set of capabilities sufficient for a phenotype under monotone Boolean semantics."],
  ["Antichain", "a family in which no member contains another; the form a route family takes once redundant routes are removed."],
  ["Transversal (hitting set)", "a set of targets touching every route at least once — equivalently, a combination that leaves the cell no way through."],
  ["Least fixed point", "the smallest route family that stops changing when the adaptation rules are applied again; what forward chaining computes."],
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
          <h1 className="rise-in max-w-[19ch] text-[clamp(2.4rem,6vw,4.3rem)] leading-[1.06] font-semibold">
            A cell can route around the drug that is killing it.
          </h1>
          <p
            className="rise-in mt-8 max-w-[48ch] text-[1.28rem] leading-relaxed text-ink-soft"
            style={{ animationDelay: "80ms" }}
          >
            It needs no new mutation to do this. Often the treatment itself is
            what opens the detour — you break one connection, and breaking it
            releases a brake that was holding a second connection shut.
          </p>
          <p
            className="rise-in mt-5 max-w-[48ch] text-[1.28rem] leading-relaxed text-ink-soft"
            style={{ animationDelay: "140ms" }}
          >
            That makes the usual way of reasoning about such networks unsound.
            You cannot analyse a fixed diagram and then act on it, because
            acting on it produces a different diagram. The paper below builds an
            algebra in which that change is itself something you compute.
          </p>
          <div
            className="rise-in mt-8 font-mono text-[0.76rem] text-ink-faint"
            style={{ animationDelay: "200ms" }}
          >
            <span className="text-ink-soft">
              A Compositional Calculus for Adaptive Biological Pathways
            </span>
            , Jude Gomila, August 2026
          </div>
        </div>
      </header>

      <Prose>
        {/* ---------------- 1 ---------------- */}
        <SectionHeading n="1" id="puzzle" title="One mutation, two outcomes" />
        <P>
          A cell decides whether to divide by listening. Signals arrive at
          proteins embedded in its outer membrane, and a relay of proteins
          inside carries the message inward: each one, when switched on,
          chemically switches on the next. At the end of the relay the message
          reaches the nucleus and the cell commits to growing and dividing.
          The proteins doing the switching are called <Term>kinases</Term>, and
          a relay of them is a <Term>signalling pathway</Term>.
        </P>
        <P>
          Cancer often begins when a mutation jams one relay protein
          permanently in the &ldquo;on&rdquo; position. The cell then behaves
          as though it is constantly being told to divide, whether or not
          anything outside is saying so. One such mutation — a single amino
          acid substitution in a kinase called BRAF — does exactly this, and it
          is common: roughly half of melanomas carry it, and about one in ten
          colorectal cancers.
        </P>
        <P>
          That looks like an unusually clean target. A drug that plugs the
          mutant protein should silence the relay, and in melanoma it does:
          BRAF inhibitors produced some of the most dramatic tumour responses
          modern oncology had seen. So the same drug was given to patients
          whose colorectal tumours carried the identical mutation.
        </P>
        <P>
          It barely worked. Response rates collapsed to a few percent. Same
          mutation, same drug, same jammed protein — and almost no effect. The
          explanation, worked out in 2012, is the subject of this entire
          walkthrough, and it is worth stepping through before any mathematics
          appears.
        </P>
      </Prose>

      <Wide>
        <FigureShell
          title="What actually happens when the drug lands"
          caption={
            <>
              Step through the three stages. The crucial detail is the dashed
              line in stage 1: the last protein in the relay is holding the
              receptor at the top of the second relay switched off. Silence the
              relay and you also silence the thing doing the holding. In
              melanoma cells that second relay is barely present, so the drug
              keeps working; in colorectal cells it is, and the tumour recovers
              its signal within days.
            </>
          }
        >
          <CascadeIntro />
        </FigureShell>
      </Wide>

      <Prose>
        <P>
          Read that sequence carefully, because the ordinary way of describing
          it undersells the problem. It is tempting to say the tumour{" "}
          <em>had</em> a backup route and the drug failed to block it. But
          before treatment there was no backup route: the receptor was
          suppressed, and suppressed by the very protein the drug was about to
          silence. The route was not hidden. It did not exist. Applying the
          drug is what brought it into existence.
        </P>
        <Note label="Why this is hard">
          Every method that reasons about a fixed network — find the bottleneck,
          rank the nodes by centrality, compute the minimum set of edges to cut
          — is answering a question about the network as drawn. Here the act of
          cutting rewrites the drawing. The answer is computed against a system
          that stops existing the moment you act on it.
        </Note>

        {/* ---------------- 2 ---------------- */}
        <SectionHeading n="2" id="diagrams" title="What a wiring diagram will not tell you" />
        <P>
          Biologists record this knowledge in pathway diagrams: boxes for
          molecules, arrows for &ldquo;activates,&rdquo; blunt-ended lines for
          &ldquo;inhibits.&rdquo; These are excellent for representing what is
          believed to influence what. They are poor for calculating with,
          because an arrow does not say what kind of claim it is making. Does
          it mean the two molecules touch? That knocking one out reduces the
          other by half? That the effect appears in minutes, or after a day of
          transcription? Does it hold in every tissue?
        </P>
        <P>
          The questions an engineer actually needs to answer are of a different
          kind. Which part of this network can I summarise, or ignore entirely,
          without changing the prediction I care about? Which apparently
          different escape routes secretly pass through the same chokepoint?
          Which intervention will <em>release</em> a brake rather than apply
          one? Which resistance route exists only <em>after</em> treatment?
        </P>
        <P>
          The paper&apos;s comparison is to logic before algebra. A list of
          logical statements records what you believe; De Morgan&apos;s laws
          let you <em>transform</em> statements while preserving their meaning,
          which is what makes the collection into something you can compute
          with. The proposal is a small set of operators and rewriting rules
          for pathways, each carrying an explicit statement of what it
          preserves — so a simplification can never quietly discard the thing
          it was supposed to protect.
        </P>
        <Note label="Status">
          The paper is a mathematical proposal, not a clinical result. Its
          theorems are exact within the semantics it defines; the biological
          mappings and worked oncology examples are deliberately simplified
          hypotheses requiring experimental validation. Nothing here is
          treatment advice — and this walkthrough inherits that boundary.
        </Note>

        {/* ---------------- 3 ---------------- */}
        <SectionHeading n="3" id="routes" title="Turning survival into logic" />
        <P>
          To calculate, we need something coarser than chemistry. The first
          move is to stop tracking concentrations and rates, and track only
          which <em>capabilities</em> a cell currently has: is BRAF signalling
          available, is MEK available, and so on. Write <K>V</K> for the finite
          set of capabilities in play. A cell&apos;s state is then just a
          subset <K>{"x \\subseteq V"}</K> — the capabilities it currently
          possesses — and survival is a function{" "}
          <K>{"\\Phi"}</K> that reads a state and answers yes or no.
        </P>
        <P>
          One assumption makes this tractable. <Term>Monotonicity</Term>: if a
          cell survives with a given set of capabilities, it also survives with
          more. Gaining an ability never kills you. This is plainly not true of
          all biology — too much signalling can trigger senescence or death —
          and the paper is explicit that this is a controlled approximation
          rather than a universal model. But for a coarse question like
          &ldquo;can this cell still get a survival signal through,&rdquo; it is
          reasonable, and it buys a great deal.
        </P>
        <P>
          What it buys is this. If survival is monotone, it is completely
          described by its minimal recipes: the sets of capabilities that are
          just enough, with nothing to spare. Call each such minimal sufficient
          set a <Term>route</Term>. The cell survives exactly when it holds all
          the capabilities of at least one route:
        </P>
        <Eq num="14">{"\\mathrm{RNF}(\\Phi) = \\bigvee_{r \\in \\mathcal{M}(\\Phi)} \\; \\bigwedge_{v \\in r} v"}</Eq>
        <P>
          Read the symbols aloud and the formula says nothing surprising:{" "}
          <K>{"\\bigwedge"}</K> is &ldquo;and,&rdquo; <K>{"\\bigvee"}</K> is
          &ldquo;or,&rdquo; and{" "}
          <K>{"\\mathcal{M}(\\Phi)"}</K> is the collection of routes. The cell
          survives if (all of route one) <em>or</em> (all of route two) or …
          The content is in a small theorem: for a monotone survival function
          this list of routes is <em>unique</em>. Two pathway models that look
          entirely different are equivalent for survival precisely when they
          reduce to the same list. It is the biological analogue of minimising
          a logic circuit, and it gives a canonical form to compare against.
        </P>
        <P>
          One housekeeping condition: no route may contain another. If{" "}
          <K>{"\\{M\\}"}</K> is enough on its own, then{" "}
          <K>{"\\{B, M\\}"}</K> is not a minimal recipe and is struck out. A
          family with no member containing another is called an{" "}
          <Term>antichain</Term>, and reducing to it is what &ldquo;normal
          form&rdquo; means here.
        </P>
        <P>
          Now the first real payoff. Suppose you want to switch survival{" "}
          <em>off</em>. You must break every route — leaving one intact is
          leaving the cell alive. And to break a route, it is enough to remove
          any single capability in it, since a route needs all of its members.
          Written out, that is exactly De Morgan&apos;s law: the negation of an
          &ldquo;or of ands&rdquo; is an &ldquo;and of ors.&rdquo;
        </P>
        <Eq num="16">{"\\neg\\Phi = \\bigwedge_{r \\in \\mathcal{M}(\\Phi)} \\Big( \\bigvee_{v \\in r} \\neg v \\Big)"}</Eq>
        <P>
          In words: <em>for every route, at least one of its members must be
          knocked out</em>. A set of targets meeting that condition — touching
          every route at least once — is called a <Term>transversal</Term>, or
          equivalently a hitting set. So the question &ldquo;which drug
          combinations kill this cell?&rdquo; has become the question
          &ldquo;which sets of targets touch every route?&rdquo;, and the
          minimal combinations are exactly the minimal transversals. That
          translation is mechanical: survival logic in, intervention
          requirements out.
        </P>

        <div className="my-9 rounded-md border border-line bg-paper-deep/40 px-5 py-4">
          <div className="mb-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-ink-faint">
            The six capabilities used throughout
          </div>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {CAST.map(([letter, name, what]) => (
              <div key={letter} className="flex gap-3 text-[0.95rem]">
                <dt className="w-16 shrink-0 font-mono font-semibold">
                  {letter} <span className="text-ink-faint">{name}</span>
                </dt>
                <dd className="text-ink-soft">{what}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">
            These letters stand for coarse <em>capabilities</em>, not
            individual molecules or reactions. The baseline survival route is{" "}
            <span className="font-mono">B ∧ M ∧ E</span>; the route that
            treatment opens is{" "}
            <span className="font-mono">G ∧ R ∧ C ∧ M ∧ E</span>. Notice they
            share the tail <span className="font-mono">M ∧ E</span> — which,
            as the algebra will show, is why a downstream target behaves so
            differently from an upstream one.
          </p>
        </div>
      </Prose>

      <Wide>
        <FigureShell
          title="Routes, and the target sets that break them"
          caption={
            <>
              Left: grant or remove capabilities and watch whether survival
              logic still finds a complete route. Right: the routes currently
              in the model, and every minimal set of targets that touches all
              of them. Then tick &ldquo;include bypass route r₁&rdquo; — this
              is the state of the world after treatment has opened the second
              relay. Watch {" {B} "} vanish from the list of cuts. Nothing
              about B changed; the set of routes it has to touch did.
            </>
          }
        >
          <RouteExplorer />
        </FigureShell>
      </Wide>

      <Prose>
        <P>
          That last observation is the whole difficulty in miniature, and
          everything from here is an attempt to handle it honestly. The list of
          routes is not a fixed input. It is a function of what you do.
        </P>
      </Prose>

      <Prose>
        {/* ---------------- 3 ---------------- */}
        <SectionHeading n="4" id="syntax" title="Writing pathways down so they compose" />
        <P>
          Routes are a way of <em>evaluating</em> a pathway. We also need a way
          of <em>writing one down</em> — building big pathways out of small
          ones so that a claim proved about a part survives when the part is
          plugged into a larger whole. That is what a compositional language
          buys, and it is why the same discipline shows up in circuit design
          and type systems.
        </P>
        <P>
          The building block is a module with a declared input and output:{" "}
          <K>{"a : X \\to Y"}</K> reads &ldquo;module <K>a</K> consumes
          interface <K>X</K> and produces interface <K>Y</K>.&rdquo; Declaring
          the interfaces is not bureaucracy; it is what stops you from
          accidentally equating a signal that resolves in minutes with a
          population shift that takes weeks. Nine operators combine modules:
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
          The design principle that matters here is that{" "}
          <Term>writing something down does not fix what it means</Term>. The
          same expression can be interpreted three ways: as the Boolean route
          logic of the previous section; as signed gains and delays, where each
          module has a strength and a lag; or as full dynamics, with
          differential equations and simulated traces. These are the paper&apos;s
          three <em>semantic profiles</em>, and a simplification that is valid
          under one can be flatly false under another.
        </P>
        <P>
          A worked instance of that failure is worth having, because it is the
          most common informal move in pathway reasoning. If A inhibits B and B
          inhibits C, then A has a net positive effect on C — two negatives
          make a positive. True, as a statement about <em>sign</em>. But it
          does not license redrawing the picture as &ldquo;A activates C&rdquo;
          and deleting B. The redrawn version has different timing, different
          saturation behaviour, and — fatally for our purposes — no B for a
          drug to bind to. The shortcut preserved the sign and discarded the
          intervention point.
        </P>
        <P>
          So each rewriting rule in the calculus carries a{" "}
          <Term>certificate</Term> stating exactly what it is entitled to: it
          is <em>exact</em> in every model of the stated profile,{" "}
          <em>conditional</em> on listed hypotheses, <em>approximate</em>{" "}
          within a stated error, or merely <em>heuristic</em>. A reduction
          without a certificate is an assertion; with one, it is a claim you
          can audit and, if wrong, falsify.
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
        <SectionHeading n="5" id="feedback" title="How a drug arms a rule" />
        <P>
          We now have logic for routes and a language for composing modules.
          What we do not yet have is any account of <em>where new routes come
          from</em> — and that has to come from the continuous world, because
          &ldquo;the brake came off&rdquo; is a statement about quantities, not
          about logic.
        </P>
        <P>
          Model the relay as an amplifier. It has a forward gain <K>g</K> (how
          strongly input becomes output) and sits under negative feedback of
          strength <K>h</K> — the ERK-to-receptor brake from the animation
          above. A drug does not delete the relay; it attenuates it, leaving a
          fraction <K>{"\\alpha \\in [0,1]"}</K> of the original activity.{" "}
          <K>{"\\alpha = 1"}</K> is untreated, <K>{"\\alpha = 0"}</K> is a
          perfect knockout. Solving the loop for the drive arriving at the
          receptor gives
        </P>
        <Eq num="52">{"r(\\alpha) = \\frac{u}{1 + \\alpha g h}, \\qquad \\frac{dr}{d\\alpha} = -\\frac{ugh}{(1+\\alpha gh)^2} < 0"}</Eq>
        <P>
          Look at what the second expression says. The derivative of drive with
          respect to residual activity is <em>negative</em>, always. Decreasing{" "}
          <K>{"\\alpha"}</K> — inhibiting harder — <em>increases</em> the drive
          arriving upstream. This is not a quirk of the parameters; it is what
          negative feedback does when you weaken the thing providing it. The
          harder you push, the more of the brake you release.
        </P>
        <P>
          Now suppose the bypass becomes biologically available once that drive
          crosses some threshold <K>{"\\theta"}</K>. Setting{" "}
          <K>{"r(\\alpha) \\ge \\theta"}</K> and solving gives a critical dose{" "}
          <K>{"\\alpha_{\\mathrm{crit}} = (u/\\theta - 1)/gh"}</K>, and with it
          a precise, falsifiable statement: <em>below this level of inhibition,
          the escape route exists; above it, it does not</em>. The continuous
          model has handed the logical layer a fully specified trigger. That
          handoff is the joint the whole calculus is built around.
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
        <SectionHeading n="6" id="closure" title="Adaptation is an operator" />
        <P>
          We can now say the thing the whole paper is built to say. Treatment
          is not simply &ldquo;set this target to zero.&rdquo; It releases
          feedback, wakes dormant programmes, and changes which routes exist.
          So treatment gets its own operator, alongside an explicit rule for
          what it triggers.
        </P>
        <P>
          An <Term>adaptation rule</Term> is a bookkeeping tuple, and each slot
          answers an obvious question. What must already be true for this to be
          possible (prerequisites)? Under what treatment and in what tissue
          does it fire (the <em>guard</em> — this is where{" "}
          <K>{"\\alpha_{\\mathrm{crit}}"}</K> from the last section enters)?
          What new routes appear (consequences)? How long does it take
          (delay)? At what level does it operate — signalling, transcription,
          cell state, population (scale)?
        </P>
        <Eq num="29">{"\\rho = (\\underbrace{A_\\rho}_{\\text{prereqs}}, \\underbrace{\\gamma_\\rho}_{\\text{guard}}, \\underbrace{D_\\rho}_{\\text{new routes}}, \\underbrace{\\delta_\\rho}_{\\text{delay}}, \\underbrace{\\ell_\\rho}_{\\text{scale}})"}</Eq>
        <P>
          Then, given a specific intervention <K>U</K> and context{" "}
          <K>c</K>, you do the obvious thing: check which rules fire, add the
          routes they produce, check again in case the new routes enabled
          further rules, and keep going until nothing changes. That procedure
          has a name — forward chaining — and its resting point is written
        </P>
        <Eq num="31">{"R^{*}_{U,c} = \\mathrm{lfp}(F_{U,c}), \\qquad F_{U,c}(R) = R_0 \\cup R \\cup \\bigcup_{\\rho:\\, A_\\rho \\subseteq R,\\; \\gamma_\\rho(U,c)=1} D_\\rho"}</Eq>
        <P>
          <K>{"F_{U,c}"}</K> is one round of that process: keep what you had,
          add what the enabled rules produce. <K>{"\\mathrm{lfp}"}</K> means{" "}
          <em>least fixed point</em> — the smallest family that survives
          another round unchanged. &ldquo;Least&rdquo; is doing real work:
          it admits exactly the routes with a genuine derivation from the
          baseline, and refuses routes that would only justify themselves in a
          circle.
        </P>
        <P>
          Three properties make this usable rather than merely definable. It
          exists and is unique. It terminates, in at most as many rounds as
          there are routes to add, because each non-final round adds at least
          one. And it is computed by an algorithm so simple you can run it by
          hand — the same procedure that evaluates a Prolog program.
        </P>
        <P>
          With closure in hand, the criterion for a good intervention is one
          sentence. An intervention is <Term>adaptation-robust</Term> when it
          hits every route in <em>its own</em> closure — the routes that exist
          in the world that intervention creates. Compare that with the naive
          criterion (hit every route in the baseline model) and the difference
          is the entire paper: the network you must cut depends on the cut you
          are proposing to make. You cannot evaluate a candidate without first
          computing the world it produces.
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
        <SectionHeading n="7" id="penalties" title="Logic proposes, pharmacology disposes" />
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
        <SectionHeading n="8" id="upward" title="Bigger is not safer" />
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
          There is a price for all this honesty, and the paper states it
          rather than hiding it. Asking &ldquo;is there a robust intervention
          costing no more than <K>B</K>?&rdquo; is NP-complete — meaning no
          algorithm is known that solves every instance without, in the worst
          case, doing something close to trying all the combinations, and
          finding one would settle a famous open problem. This is not caused
          by adaptation; the difficulty is already there in plain hitting set,
          with no rules at all. Any method that appeared to escape it would be
          quietly restricting the question.
        </P>
        <P>
          What you do instead is search cleverly. Propose the cheapest
          candidate; compute its closure; if some route escapes, you have not
          merely failed — you have obtained a <em>specific escape route with a
          derivation</em>, which becomes a constraint ruling out that candidate
          and everything sharing its flaw. Repeat. The failures are the
          informative part: each one names a mechanism a biologist can go and
          test.
        </P>

        {/* ---------------- 8 ---------------- */}
        <SectionHeading n="9" id="time" title="Time is part of the type" />
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
        <SectionHeading n="10" id="cases" title="Three ways static reasoning fails" />
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
        <SectionHeading n="11" id="toolchain" title="From algebra to toolchain" />
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
        <SectionHeading n="12" id="honesty" title="What would falsify it" />
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
        <SectionHeading n="13" id="glossary" title="Glossary" />
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
