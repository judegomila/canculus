import { ReactNode } from "react";

/** Narrow reading measure. */
export function Prose({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[42rem] px-5">{children}</div>;
}

/** Wide breakout for interactive figures. */
export function Wide({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[64rem] px-5">{children}</div>;
}

export function SectionHeading({
  n,
  title,
  id,
}: {
  n: string;
  title: string;
  id: string;
}) {
  return (
    <h2
      id={id}
      className="essay-h mt-24 mb-6 scroll-mt-24 text-[2rem] leading-tight font-medium"
    >
      <span className="mr-3 font-mono text-sm font-normal text-cut align-middle tracking-widest">
        §{n}
      </span>
      {title}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mb-5">{children}</p>;
}

/** Callout note, like the paper's status boxes. */
export function Note({
  label,
  children,
  tone = "neutral",
}: {
  label: string;
  children: ReactNode;
  tone?: "neutral" | "warn";
}) {
  return (
    <aside
      className={`my-8 border-l-2 px-5 py-4 text-[1.02rem] leading-relaxed ${
        tone === "warn"
          ? "border-cut bg-cut-soft/50"
          : "border-ink-faint bg-paper-deep/60"
      }`}
    >
      <span className="mr-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-soft">
        {label}
      </span>
      <span className="text-ink-soft">{children}</span>
    </aside>
  );
}

/** Term definition chip used in running text. */
export function Term({ children }: { children: ReactNode }) {
  return (
    <span className="font-display font-semibold tracking-tight">{children}</span>
  );
}

export function FigureShell({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="my-10 rounded-md border border-line bg-paper-inset shadow-[0_1px_0_rgba(34,30,24,0.04),0_12px_30px_-18px_rgba(34,30,24,0.25)]">
      <figcaption className="flex items-baseline gap-3 border-b border-line-soft px-5 py-3">
        <span className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cut">
          Interactive
        </span>
        <span className="font-display text-[1.05rem] font-medium">{title}</span>
      </figcaption>
      <div className="p-5">{children}</div>
      {caption && (
        <div className="border-t border-line-soft px-5 py-3 text-[0.95rem] leading-relaxed text-ink-soft">
          {caption}
        </div>
      )}
    </figure>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="my-8 overflow-x-auto rounded-md border border-line bg-[#241f18] px-5 py-4 font-mono text-[0.82rem] leading-relaxed text-[#e8e0cf]">
      {children}
    </pre>
  );
}
