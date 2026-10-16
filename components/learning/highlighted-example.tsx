type HighlightedExampleProps = {
  example: string;
  term: string;
};

/** Renders the exact course term as text, with safe inline emphasis in its example. */
export function HighlightedExample({ example, term }: HighlightedExampleProps) {
  const normalizedTerm = term.toLocaleLowerCase();
  if (!normalizedTerm) return example;

  const normalizedExample = example.toLocaleLowerCase();
  const fragments: Array<{ text: string; highlight: boolean }> = [];
  let cursor = 0;
  let matchAt = normalizedExample.indexOf(normalizedTerm, cursor);

  while (matchAt !== -1) {
    if (matchAt > cursor)
      fragments.push({ text: example.slice(cursor, matchAt), highlight: false });
    fragments.push({ text: example.slice(matchAt, matchAt + term.length), highlight: true });
    cursor = matchAt + term.length;
    matchAt = normalizedExample.indexOf(normalizedTerm, cursor);
  }

  if (!fragments.length) return example;
  if (cursor < example.length) fragments.push({ text: example.slice(cursor), highlight: false });

  return fragments.map((fragment, index) =>
    fragment.highlight ? (
      <mark className="learning-example-highlight" key={`${fragment.text}-${index}`}>
        {fragment.text}
      </mark>
    ) : (
      <span key={`${fragment.text}-${index}`}>{fragment.text}</span>
    ),
  );
}
