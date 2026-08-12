import Link from "next/link";
import { IconCopy, IconFile, IconStudio } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

const lessonSections = [
  {
    marker: "S1",
    name: "Set the scene",
    label: "Scenario",
    purpose: "Start with a real client moment so the learner knows why the rule matters.",
    useWhen: "The lesson needs context, urgency, or a realistic fact pattern.",
    example: "A tenant brings in a notice and asks whether they have to leave this week.",
  },
  {
    marker: "S2",
    name: "State the rule",
    label: "Rule",
    purpose: "Explain the law, policy, or process in plain language.",
    useWhen: "The learner needs the actual standard, deadline, checklist, or decision rule.",
    example: "A notice must include the required language, timing, and delivery method.",
  },
  {
    marker: "S3",
    name: "What changed",
    label: "Law update",
    purpose: "Call out a recent change without rebuilding the whole lesson around it.",
    useWhen: "A rule, form, deadline, policy, or court practice recently moved.",
    example: "The filing deadline changed, so older advice needs a quick correction.",
  },
  {
    marker: "S4",
    name: "Media",
    label: "Visual aid",
    purpose: "Reserve a place for screenshots, diagrams, forms, or other visual helpers.",
    useWhen: "Seeing the thing is faster than describing it.",
    example: "Show the part of a form where the learner should check the date.",
  },
  {
    marker: "S5",
    name: "Interactive",
    label: "Practice support",
    purpose: "Add expandable notes, callouts, timelines, quotes, or reveal moments.",
    useWhen: "The learner needs to explore details without reading one long wall of text.",
    example: "Use an accordion for common exceptions or a timeline for procedural steps.",
  },
  {
    marker: "S6",
    name: "Try it",
    label: "Application",
    purpose: "Ask one focused question and explain the correct answer.",
    useWhen: "The learner should practice applying the rule before moving on.",
    example: "Which deadline controls if the notice was served on Friday afternoon?",
  },
  {
    marker: "S7",
    name: "Remember",
    label: "Takeaways",
    purpose: "Close with the two or three points the learner should carry into practice.",
    useWhen: "The lesson has several details and needs a final memory anchor.",
    example: "Check the date, confirm service, and compare the notice language to the rule.",
  },
];

const interactiveBlocks = [
  {
    name: "Accordion",
    bestFor: "Expandable lists",
    detail:
      "Use for exceptions, FAQs, defenses, or optional detail that should not interrupt the main flow.",
  },
  {
    name: "Click and reveal",
    bestFor: "Self-check moments",
    detail: "Use when learners should pause, predict, then reveal an answer or explanation.",
  },
  {
    name: "Callout",
    bestFor: "Warnings and tips",
    detail: "Use for a practice warning, filing tip, policy note, or common mistake.",
  },
  {
    name: "Timeline",
    bestFor: "Ordered steps",
    detail:
      "Use for deadlines, case stages, client workflows, or any process where sequence matters.",
  },
  {
    name: "Stylized quote",
    bestFor: "Voice and emphasis",
    detail: "Use for a memorable principle, instructor note, or quoted guidance with attribution.",
  },
];

const templates = [
  {
    name: "Standard lesson",
    sections: "Scenario + Rule + Try it",
    use: "Best default for most practical legal training.",
  },
  {
    name: "Law update",
    sections: "Scenario + Rule + What changed + Try it",
    use: "Use when the main reason for the lesson is a recent change.",
  },
  {
    name: "Quick reference",
    sections: "Rule + Remember",
    use: "Use for short refreshers, checklists, or policy reminders.",
  },
];

export default function BuildingBlocksPage() {
  return (
    <div className="fade-up min-w-0 max-w-[1040px] break-words">
      <PageHeader
        eyebrow="Author / Building blocks"
        title="Building blocks"
        description="A starter catalog of the sections and interactive elements you can use in Course Studio. Use this page to choose the right shape before you write."
        actions={<StatusBadge tone="ok">Starter catalog</StatusBadge>}
      />

      <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="editorial-card border-[var(--accent-tint)] bg-brand-tint px-4 py-5 sm:px-6">
          <p className="eyebrow mb-2">How to use this</p>
          <h2 className="mb-2 font-display text-[24px] font-bold leading-tight text-ink">
            Pick the blocks that serve the lesson.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
            You do not need every block in every lesson. Most strong lessons start with a scenario,
            state the rule, ask the learner to apply it, and close with what to remember. Add media,
            updates, or interactive elements when they make the lesson clearer.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/guide/"
              className="btn-primary max-[520px]:w-full max-[520px]:justify-center"
            >
              <IconFile size={15} />
              Read the guide
            </Link>
            <Link
              href="/course-studio/"
              className="btn-secondary max-[520px]:w-full max-[520px]:justify-center"
            >
              <IconStudio size={15} />
              Open Studio
            </Link>
            <Link
              href="/publish/"
              className="btn-secondary max-[520px]:w-full max-[520px]:justify-center"
            >
              Publish workflow
            </Link>
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[var(--accent-tint)] text-accent">
              <IconCopy size={20} />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.11em] text-ink-soft">
                Basic recipe
              </p>
              <h2 className="mt-1 font-display text-[18px] font-semibold text-ink">
                Start simple, then add depth
              </h2>
            </div>
          </div>
          <div className="space-y-2">
            {["Scenario", "Rule", "Try it", "Remember"].map((item, index) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-surface-sunken font-mono text-[10px] font-semibold text-accent">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-ink">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
            If a block does not help the learner make a better decision, skip it.
          </p>
        </aside>
      </section>

      <section className="mb-7">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">Lesson sections</p>
            <h2 className="section-title text-ink">The main building blocks</h2>
          </div>
          <StatusBadge tone="info">7 sections</StatusBadge>
        </div>

        <div className="grid gap-3">
          {lessonSections.map((section) => (
            <article key={section.name} className="editorial-card px-4 py-5 sm:px-5">
              <div className="grid gap-4 md:grid-cols-[86px_minmax(0,1fr)_minmax(220px,280px)]">
                <div>
                  <span className="inline-flex rounded-[7px] bg-[var(--accent-tint)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                    {section.marker}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                    {section.label}
                  </p>
                  <h3 className="mt-1 font-display text-[20px] font-semibold leading-snug text-ink">
                    {section.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{section.purpose}</p>
                </div>
                <div className="rounded-[10px] border border-line bg-surface-sunken px-3 py-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Use when
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {section.useWhen}
                  </p>
                  <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Example
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">
                    {section.example}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Interactive elements</p>
          <h2 className="section-title mb-3 text-ink">Use interaction for clarity</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {interactiveBlocks.map((block) => (
              <div
                key={block.name}
                className="rounded-[10px] border border-line bg-surface-sunken px-3 py-3 sm:px-4"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                  {block.bestFor}
                </p>
                <h3 className="mt-1 font-display text-[16px] font-semibold text-ink">
                  {block.name}
                </h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{block.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Templates</p>
          <h2 className="section-title mb-3 text-ink">Fast starting points</h2>
          <div className="grid gap-3">
            {templates.map((template) => (
              <div
                key={template.name}
                className="border-b border-line-soft pb-3 last:border-b-0 last:pb-0"
              >
                <h3 className="font-display text-[16px] font-semibold text-ink">{template.name}</h3>
                <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-accent">
                  {template.sections}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{template.use}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="editorial-card px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow mb-2">Mobile note</p>
            <h2 className="section-title text-ink">Good for reading, not authoring</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              This reference is meant to be readable on a phone when you need a quick reminder.
              Course Studio itself is still desktop-only because the builder needs the outline,
              editor, and learner preview side by side.
            </p>
          </div>
          <Link
            href="/courses/"
            className="btn-secondary max-[520px]:w-full max-[520px]:justify-center"
          >
            Check course inventory
          </Link>
        </div>
      </section>
    </div>
  );
}
