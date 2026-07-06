import Link from "next/link";
import { IconCourses, IconDatabase, IconFiles, IconStudio, IconSync } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

const workflowSteps = [
  {
    step: "01",
    label: "Studio",
    title: "Set the publish target",
    owner: "You",
    summary:
      "In Course Studio, open Course details and pick the Brightspace course this will live in. The top bar shows a green Deploy-ready pill once it's set.",
    checks: [
      'The Deploy-ready pill is green (not "Local preview").',
      "The course id and code match the real Brightspace course.",
      "Every lesson has been previewed.",
      "Try it questions have the correct answer selected.",
    ],
  },
  {
    step: "02",
    label: "Export",
    title: "Download the finished package",
    owner: "You",
    summary:
      "Hit Share with learners to export the ZIP. Every link inside is already pointed at the right Brightspace URLs — nothing in the package needs editing.",
    checks: [
      "The ZIP downloaded without validation errors.",
      "DEPLOY.txt is inside — it lists the upload steps and every page URL.",
      "Images you added in the Studio are in the images/ folder.",
    ],
  },
  {
    step: "03",
    label: "Brightspace files",
    title: "Upload the package",
    owner: "You",
    summary:
      "In Brightspace, open the course → Course Admin → Manage Files, and upload everything from the ZIP (keep the images/ folder together with the pages).",
    checks: [
      "Files landed in the course named in DEPLOY.txt.",
      "The whole package went up — pages, course-config.js, CSS, JS, images/.",
      "Old versions were replaced intentionally, not mixed together.",
    ],
  },
  {
    step: "04",
    label: "Brightspace content",
    title: "Create the Content topics",
    owner: "You",
    summary:
      "In Content, create one topic per page. DEPLOY.txt lists the exact URL to paste for each lesson — no file editing, just copy and paste.",
    checks: [
      "Each lesson is linked in the right order.",
      "Topic URLs are copied straight from DEPLOY.txt.",
      "Learner preview opens the styled page, not a file listing.",
    ],
  },
  {
    step: "05",
    label: "Check it",
    title: "Walk through as a learner",
    owner: "You",
    summary:
      "Open the first topic in learner preview. The navigation bar, progress, prev/next, and Exit to Hub should all work.",
    checks: [
      "The first lesson loads with course styling.",
      "Next/previous moves between lessons.",
      "The completion page appears after the last lesson.",
      "Optional: run the catalog sync so Learning Hub lists the course.",
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
  {
    href: "/hub-listing/",
    label: "Learning Hub listing",
    detail: "Collect catalog metadata and preview the Supabase row.",
    icon: IconDatabase,
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
            Set the publish target once in Course Studio and the exported package comes out
            deploy-ready — upload it to Manage Files, paste the URLs from DEPLOY.txt into Content
            topics, and check it as a learner. No file editing anywhere.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/course-studio/"
              className="btn-primary max-[520px]:w-full max-[520px]:justify-center"
            >
              <IconStudio size={15} />
              Open Studio
            </Link>
            <Link
              href="/sync/"
              className="btn-secondary max-[520px]:w-full max-[520px]:justify-center"
            >
              <IconSync size={15} />
              Check sync
            </Link>
            <Link
              href="/hub-listing/"
              className="btn-secondary max-[520px]:w-full max-[520px]:justify-center"
            >
              <IconDatabase size={15} />
              Add to Learning Hub
            </Link>
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Important rule</p>
          <h2 className="font-display text-[18px] font-semibold text-ink">
            One write path, always reviewed
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
            Brightspace Manager is the place for platform writes. Updates should be previewed,
            confirmed, and logged. Learning Hub reads the catalog; it does not become the place
            where production Brightspace data is edited.
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
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{item.summary}</p>
                </div>
                <div className="rounded-[10px] border border-line bg-surface-sunken px-3 py-3">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    Confirm before moving on
                  </p>
                  <ul className="mt-2 grid gap-2">
                    {item.checks.map((check) => (
                      <li
                        key={check}
                        className="flex gap-2 text-[12.5px] leading-relaxed text-ink-muted"
                      >
                        <span
                          className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-accent"
                          aria-hidden
                        />
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
              detail="Uploading to Manage Files and creating Content topics happen inside Brightspace by hand — DEPLOY.txt turns that into copy-paste, but it's still a manual pass."
            />
            <StatusCard
              tone="info"
              title="Next milestone"
              detail="Deploy automation could upload files and create Content topics directly, but that needs Brightspace write access — deliberately not granted yet."
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
              This workflow page should be readable on a phone when you need to check whether a
              course is live or where it is stuck. Building and deploying still belong on a
              full-size screen.
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
      <span
        className={`inline-flex rounded-[6px] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}
      >
        {title}
      </span>
      <p className="mt-3 text-[12.5px] leading-relaxed text-ink-muted">{detail}</p>
    </div>
  );
}
