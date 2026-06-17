import Link from "next/link";
import { IconCopy, IconFile, IconStudio } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

const steps = [
  {
    label: "Plan",
    title: "Plan the course",
    description:
      "Decide who the course is for, what they should be able to do afterward, and the few ideas that deserve their own lessons.",
    items: [
      "Name the audience in plain language.",
      "Write one practical outcome for the course.",
      "Choose a course title, practice area, and rough module outline.",
      "Keep each lesson focused on one client moment, rule, skill, or decision.",
    ],
  },
  {
    label: "Draft",
    title: "Start the draft",
    description:
      "Open Course Studio, then start a new course or continue an existing draft. Course details can be adjusted later from the builder menu.",
    items: [
      "Use a short, recognizable course title.",
      "Set the practice area so the course is easy to find later.",
      "Add modules only when they help authors and learners scan the course.",
      "Let autosave do its work while you write.",
    ],
  },
  {
    label: "Build",
    title: "Build the lessons",
    description:
      "Treat each lesson like a guided conversation: title the lesson, add a hook, choose the lesson type, estimate the time, then write the content blocks.",
    items: [
      "Use lesson titles that describe the legal task or choice.",
      "Write the hook as the reason this lesson matters.",
      "Set Concept, Practice, or Reflection so the lesson's purpose is clear.",
      "Estimate minutes conservatively; shorter is usually kinder.",
    ],
  },
  {
    label: "Teach",
    title: "Use teaching sections",
    description:
      "Pick only the sections the lesson needs. A strong lesson usually moves from a realistic scene to the rule, then gives the learner a chance to apply it.",
    items: [
      "Scenario: ground the learner in a real client moment.",
      "Rule: explain the law without technical clutter.",
      "What changed: use only when a policy, law, or process moved.",
      "Interactive, Try it, Remember: turn reading into practice and retention.",
    ],
  },
  {
    label: "Review",
    title: "Preview and export",
    description:
      "Preview as a learner before sharing. The preview is the best place to catch missing context, unclear answers, and lessons that feel too long.",
    items: [
      "Preview every lesson at least once.",
      "Check that the correct Try it answer is selected.",
      "Read the course out loud for plain-English flow.",
      "Use Share with learners only when the package is ready.",
    ],
  },
];

const recipe = ["Scenario", "Rule", "Try it", "Remember"];

const exportChecks = [
  "Course title and details are complete.",
  "Every lesson has been previewed as a learner.",
  "Each Try it question has one correct answer selected.",
  "Plain-English review is done.",
  "The final package is ready to share with learners.",
];

export default function GuidePage() {
  return (
    <div className="fade-up min-w-0 max-w-[1040px] break-words">
      <PageHeader
        eyebrow="Author / Guide"
        title="How to build a course"
        description="A practical checklist for turning legal expertise into a Brightspace-ready course. No wrapper code, no LMS click-path scavenger hunt."
        actions={<StatusBadge tone="ok">Ready to use</StatusBadge>}
      />

      <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="editorial-card border-[var(--accent-tint)] bg-brand-tint px-4 py-5 sm:px-6">
          <p className="eyebrow mb-2">Course Studio</p>
          <h2 className="mb-2 font-display text-[24px] font-bold leading-tight text-ink">
            Build from the learner&apos;s first real decision.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
            Start with the moment where a learner needs judgment: a client asks a
            question, a deadline appears, a form is confusing, or a rule changed.
            Course Studio turns that plain-English teaching plan into a package learners
            can open in Brightspace.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/course-studio/" className="btn-primary max-[520px]:w-full max-[520px]:justify-center">
              <IconStudio size={15} />
              Open Course Studio
            </Link>
            <Link href="/building-blocks/" className="btn-secondary max-[520px]:w-full max-[520px]:justify-center">
              <IconCopy size={15} />
              View building blocks
            </Link>
            <Link href="/publish/" className="btn-secondary max-[520px]:w-full max-[520px]:justify-center">
              Publish workflow
            </Link>
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[var(--accent-tint)] text-accent">
              <IconFile size={20} />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.11em] text-ink-soft">
                Good course recipe
              </p>
              <h2 className="mt-1 font-display text-[18px] font-semibold text-ink">
                One useful lesson pattern
              </h2>
            </div>
          </div>
          <div className="grid gap-2">
            {recipe.map((item, index) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-surface-sunken font-mono text-[10px] font-semibold text-accent">
                  S{index + 1}
                </span>
                <span className="text-sm font-semibold text-ink">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
            Add more sections when they earn their place. A concise course that teaches
            one thing clearly beats a long course that tries to hold everything.
          </p>
        </aside>
      </section>

      <section className="mb-7">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">Workflow</p>
            <h2 className="section-title text-ink">Build checklist</h2>
          </div>
          <StatusBadge tone="info">5 steps</StatusBadge>
        </div>

        <div className="grid gap-3">
          {steps.map((step, index) => (
            <article key={step.title} className="editorial-card px-4 py-5 sm:px-5">
              <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)]">
                <div>
                  <span className="inline-flex rounded-[7px] bg-[var(--accent-tint)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                    {String(index + 1).padStart(2, "0")} / {step.label}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-[20px] font-semibold leading-snug text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {step.description}
                  </p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {step.items.map((item) => (
                      <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-muted">
                        <span
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-accent"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Teaching sections</p>
          <h2 className="section-title mb-3 text-ink">What each block is for</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Block name="Scenario" detail="A concrete client situation, not an abstract introduction." />
            <Block name="Rule" detail="The law, policy, or process in language a busy learner can use." />
            <Block name="What changed" detail="A short update when something new affects the learner's work." />
            <Block name="Media" detail="A visual aid or placeholder for files that will be added at upload time." />
            <Block name="Interactive" detail="Accordions, callouts, timelines, quotes, and reveal moments." />
            <Block name="Try it" detail="One application question with feedback that makes the rule stick." />
            <Block name="Remember" detail="The two or three points learners should carry back to practice." />
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Before export</p>
          <h2 className="section-title mb-3 text-ink">Final check</h2>
          <ul className="grid gap-3">
            {exportChecks.map((item) => (
              <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-muted">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] bg-status-ok-soft font-mono text-[9px] font-bold text-status-ok-ink">
                  OK
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}

function Block({ name, detail }: { name: string; detail: string }) {
  return (
    <div className="rounded-[10px] border border-line bg-surface-sunken px-3 py-3 sm:px-4">
      <h3 className="font-display text-[15px] font-semibold text-ink">{name}</h3>
      <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{detail}</p>
    </div>
  );
}
