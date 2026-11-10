import type { FragranceNotes } from '@/types';

const TIERS: { key: keyof FragranceNotes; label: string; hint: string }[] = [
  { key: 'top', label: 'Top notes', hint: 'The first impression · ~15 minutes' },
  { key: 'middle', label: 'Heart notes', hint: 'The character · 2–4 hours' },
  { key: 'base', label: 'Base notes', hint: 'The lasting trail · 6+ hours' },
];

export function NotesPyramid({ notes }: { notes?: FragranceNotes }) {
  if (!notes) return null;
  const hasNotes = TIERS.some((tier) => notes[tier.key]?.length);
  if (!hasNotes) return null;

  return (
    <section className="mt-14 border-t border-navy/10 pt-10 sm:mt-20">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">
        Olfactory pyramid
      </p>
      <h2 className="mt-2 text-2xl font-medium sm:text-3xl">Fragrance notes</h2>
      <div className="mt-3 h-0.5 w-14 bg-gold" />

      <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
        {TIERS.map((tier, i) =>
          notes[tier.key]?.length ? (
            <div key={tier.key} className="border-t-4 border-gold bg-surface p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center bg-navy font-serif text-sm font-bold text-gold">
                  {i + 1}
                </span>
                <h3 className="text-lg font-medium">{tier.label}</h3>
              </div>
              <p className="mt-2 text-xs text-navy/55">{tier.hint}</p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {notes[tier.key].map((note) => (
                  <li
                    key={note}
                    className="border border-gold/50 bg-gold/15 px-3 py-1.5 text-xs font-medium text-navy sm:text-sm"
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>
    </section>
  );
}