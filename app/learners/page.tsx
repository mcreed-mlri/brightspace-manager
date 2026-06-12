import { PageHeader } from "@/components/page-header";
import { IconLearners } from "@/components/icons";

/* Placeholder per design handoff v3 — needs real learner progress data
   from Supabase before this becomes a working screen. */
export default function LearnersPage() {
  return (
    <div className="max-w-[820px]">
      <PageHeader
        title="How everyone's doing"
        description="Progress across all active learners enrolled in LACE courses."
      />
      <div className="editorial-card px-10 py-10 text-center">
        <IconLearners size={28} className="mx-auto mb-3 text-ink-soft" />
        <p className="mb-1 font-bold text-ink">Learner progress screen</p>
        <p className="text-[13px] text-ink-muted">
          Coming soon — this will read learner progress from Supabase once courses report it.
        </p>
      </div>
    </div>
  );
}
