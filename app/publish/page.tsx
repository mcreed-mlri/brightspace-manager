import Link from "next/link";
import { IconCourses, IconFiles, IconStudio, IconSync } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

const workflowSteps = [
  {
    step: "01",
    label: "Studio",
    title: "Finish the course draft",
    owner: "Author",
    summary:
      "Complete the lessons in Course Studio, preview the learner view, and export the Brightspace-ready package.",
    checks: [
      "Course details are complete.",
      "Every lesson has been previewed.",
      "Try it questions have the correct answer selected.",
      "Exported ZIP is the final version for upload.",
    ],
  },
  {
    step: "02",
    label: "Brightspace files",
    title: "Upload the package assets",
    owner: "Platform admin",
    summary:
      "Put the exported HTML, CSS, JavaScript, and media files into the correct Brightspace Manage Files area.",
    checks: [
      "Files land in the intended course offering.",
      "Existing production files are archived or replaced intentionally.",
      "Wrapper assets stay together so links do not break.",
      "No learner-facing Content links are updated until files are confirmed.",
    ],
  },
  {
    step: "03",
    label: "Brightspace content",
    title: "Create or update Content topics",
    owner: "Platform admin",
    summary:
      "Point Brightspace Content topics at the uploaded course pages using the clean learner view.",
    checks: [
      "Each module and topic is linked in the right order.",
      "Topic URLs include the clean-view parameter.",
      "Learner preview opens the custom page, not a file listing.",
      "Old topics are archived rather than casually deleted.",
    ],
  },
  {
    step: "04",
    label: "Sync",
    title: "Sync the catalog record",
    owner: "Platform admin",
    summary:
      "Run the Brightspace to Supabase sync so Learning Hub can discover the live course offering.",
    checks: [
      "Course Inventory shows the offering.",
      "Sync Diagnostics has no blocking drift for the course.",
      "Supabase learning_items has the correct title, course id, and status.",
      "The write is previewed, confirmed, and logged.",
    ],
  },
  {
    step: "05",
    label: "Learning Hub",
    title: "Verify the learner path",
    owner: "Reviewer",
    summary:
      "Open the course from Learning Hub and confirm the learner can launch the Brightspace content cleanly.",
    checks: [
      "Course appears in the expected catalog area.",
      "Launch opens the correct Brightspace offering.",
      "The first lesson loads without broken styling or missing files.",
      "The course is ready to announce.",
    ],
  },
];

const quickLinks = [
  {
    href: "/course-studio/",
    label: "Course Studio",
    detail: "Export the completed course package.",
    icon: IconStudio,
  },
  {
    href: "/files/",
    label: "Brightspace Files",
    detail: "Inspect the course file area before or after upload.",
    icon: IconFiles,
  },
  {
    href: "/courses/",
    label: "Course Inventory",
    detail: "Check whether the course offering is visible.",
    icon: IconCourses,
  },
  {
    href: "/sync/",
    label: "Sync Diagnostics",
    detail: "Preview and apply catalog sync changes.",
    icon: IconSync,
  },
];

export default function PublishPage() {
  return (
    <div className="fade-up min-w-0 max-w-[1040px] break-words">
      <PageHeader
        eyebrow="Author / Publish workflow"
        title="Get a course into Brightspace and Learning Hub"
        description="A plain-English handoff map for moving a completed Studio course into Brightspace, then making it discoverable in Learning Hub."
        actions={<StatusBadge tone="warn">Governed handoff</StatusBadge>}
      />

      <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="editorial-card border-[var(--accent-tint)] bg-brand-tint px-4 py-5 sm:px-6">
          <p className="eyebrow mb-2">Current path</p>
          <h2 className="mb-2 font-display text-[24px] font-bold leading-tight text-ink">
            Build in Studio. Publish through the platform workflow.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
            Course Studio creates the package, but getting it live is an operations
            workflow. Brightspace files, Brightspace Content, Supabase catalog data, and
            Learning Hub all need to agree before learners see the course.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/course-studio/" className="btn-primary max-[520px]:w-full max-[520px]:justify-center">
              <IconStudio size={15} />
              Open Studio
            </Link>
            <Link href="/sync/" className="btn-secondary max-[520px]:w-full max-[520px]:justify-center">
              <IconSync size={15} />
              Check sync
            </Link>
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Important rule</p>
          <h2 className="font-display text-[18px] font-semibold text-ink">
            One write path, always reviewed
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
            Brightspace Manager is the place for platform writes. Updates should be
            previewed, confirmed, and logged. Learning Hub reads the catalog; it does not
            become the place where production Brightspace data is edited.
          </p>
          <StatusBadge tone="info">Preview first</StatusBadge>
        </aside>
      </section>

      <section className="mb-7">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-2">Handoff checklist</p>
            <h2 className="section-title text-ink">From finished draft to live course</h2>
          </div>
          <StatusBadge tone="info">5 stages</StatusBadge>
        </div>

        <div className="grid gap-3">
          {workflowSteps.map((item) => (
            <article key={item.step} className="editorial-card px-4 py-5 sm:px-5">
              <div className="grid gap-4 lg:grid-cols-[80px_minmax(0,1fr)_minmax(240px,340px)]">
                <div>
                  <span className="inline-flex rounded-[7px] bg-[var(--accent-tint)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent">
                    {item.step}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                    {item.label} / {item.owner}
                  </p>
                  <h3 className="mt-1 font-display text-[20px] font-semibold leading-snug text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {item.summary}
                  </p>
                </div>
                <div className="rounded-[10px] border border-line bg-surface-sunken px-3 py-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Confirm before moving on
                  </p>
                  <ul className="mt-2 grid gap-2">
                    {item.checks.map((check) => (
                      <li key={check} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-muted">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-accent" aria-hidden />
                        <span>{check}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Today vs. next</p>
          <h2 className="section-title mb-3 text-ink">What is manual right now</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusCard
              tone="warn"
              title="Today"
              detail="Studio exports a package. Brightspace upload, Content topic setup, and final catalog sync still need an admin review path."
            />
            <StatusCard
              tone="info"
              title="Next milestone"
              detail="Deploy automation will dry-run first, then upload files, create Content topics, and backfill URLs behind preview-confirm-log controls."
            />
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Quick links</p>
          <h2 className="section-title mb-3 text-ink">Places to check</h2>
          <div className="grid gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex gap-3 rounded-[10px] border border-line bg-surface-sunken px-3 py-3 transition-colors hover:border-line-strong hover:bg-hover"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] bg-[var(--accent-tint)] text-accent">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{link.label}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-muted">
                      {link.detail}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="editorial-card px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow mb-2">Mobile note</p>
            <h2 className="section-title text-ink">Useful for checking status</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              This workflow page should be readable on a phone when you need to check
              whether a course is live or where it is stuck. Building and deploying still
              belong on a full-size screen.
            </p>
          </div>
          <Link href="/courses/" className="btn-secondary max-[520px]:w-full max-[520px]:justify-center">
            Check course inventory
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatusCard({
  tone,
  title,
  detail,
}: {
  tone: "info" | "warn";
  title: string;
  detail: string;
}) {
  const toneClass =
    tone === "warn"
      ? "bg-status-warn-soft text-status-warn-ink"
      : "bg-status-info-soft text-status-info-ink";

  return (
    <div className="rounded-[10px] border border-line bg-surface-sunken px-4 py-4">
      <span className={`inline-flex rounded-[6px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}>
        {title}
      </span>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">{detail}</p>
    </div>
  );
}
