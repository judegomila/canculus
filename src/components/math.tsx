import katex from "katex";

/** Server-rendered KaTeX. Inline by default; block with display. */
export function K({ children, display = false }: { children: string; display?: boolean }) {
  const html = katex.renderToString(children, {
    displayMode: display,
    throwOnError: false,
    strict: false,
  });
  return display ? (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function Eq({ children, num }: { children: string; num?: string }) {
  return (
    <div className="relative">
      <K display>{children}</K>
      {num && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-faint">
          ({num})
        </span>
      )}
    </div>
  );
}
