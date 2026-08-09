export type JoinKind = 'inner' | 'left' | 'full' | 'cross';
export function VennJoinBadge({ kind }: { kind: JoinKind }) {
  if (kind === 'cross') return <span className="cross-badge" aria-label="Cross join"><i/><i/><i/><i/></span>;
  return <span className={`venn-badge venn-kind-${kind}`} aria-label={`${kind} join sets`}><i className="venn-left"/><i className="venn-right"/><i className="venn-overlap"/></span>;
}
