import Link from "next/link";
import { MockDataBanner } from "@/components/mock-data-banner";
import { StatusBadge, type BadgeTone } from "@/components/status-badge";
import { listCourseOfferings } from "@/lib/data/courses";
import { checkBrightspaceHealth, checkSupabaseHealth } from "@/lib/data/health";
import { getSyncStatus } from "@/lib/data/sync";
import { missingMetadata, type CourseOffering, type HealthStatus } from "@/types/domain";
import { formatRelative } from "@/components/courses/course-presentation";

export const dynamic = "force-dynamic";

const HEALTH_TONE: Record<HealthStatus["status"], BadgeTone> = {
  ok: "ok",
  error: "error",
  unconfigured: "warn",
};

/* Haloed status dot — colour + soft halo by tone (convention #4). */
const DOT: Record<BadgeTone, { color: string; glow: string }> = {
  ok: { color: "var(--ok)", glow: "var(--ok-glow)" },
  warn: { color: "var(--amber)", glow: "var(--amber-tint)" },
  error: { color: "var(--danger)", glow: "var(--danger-tint)" },
  info: { color: "var(--accent)", glow: "var(--accent-glow)" },
  neutral: { color: "var(--ink-soft)", glow: "var(--surface-sunken)" },
};

const CAT = [
  "var(--cat-pink)",
  "var(--cat-amber)",
  "var(--cat-blue)",
  "var(--cat-violet)",
  "var(--cat-green)",
  "var(--cat-teal)",
];

function ConnectionChip({ name, meta, tone }: { name: string; meta: string; tone: BadgeTone }) {
  const dot = DOT[tone];
  return (
    <div className="min-w-[128px] rounded-[13px] border border-line bg-surface px-[15px] py-[13px]">
      <div className="flex items-center gap-[7px]">
        <span
          className="h-[7px] w-[7px] shrink-0 rounded-full"
          style={{ background: dot.color, boxShadow: `0 0 0 3px ${dot.glow}` }}
          aria-hidden
        />
        <span className="text-[12px] font-semibold text-ink">{name}</span>
      </div>
      <div className="mt-[7px] font-mono text-[10px] text-ink-soft">{meta}</div>
    </div>
  );
}

function BandCell({
  label,
  value,
  sub,
  lead = false,
  valueClass = "text-ink",
  flag,
}: {
  label: string;
  value: number | string;
  sub: string;
  lead?: boolean;
  valueClass?: string;
  flag?: React.ReactNode;
}) {
  return (
    <div className="bg-surface px-[22px] py-5">
      <div className="flex items-center gap-2">
        <span
          className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.07em] ${
            lead ? "text-accent" : "text-ink-soft"
          }`}
        >
          {label}
        </span>
        {flag}
      </div>
      <div className={`mt-3 font-display text-[44px] font-bold leading-none tracking-[-0.03em] ${valueClass}`}>
        {value}
      </div>
      <div className="mt-[7px] text-[11.5px] leading-snug text-ink-soft">{sub}</div>
    </div>
  );
}

function countRecentlyUpdated(courses: CourseOffering[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return courses.filter((c) => c.lastSyncedAt && new Date(c.lastSyncedAt).getTime() > cutoff)
    .length;
}

export default async function OperatorDashboardPage() {
  const [coursesResult, syncResult, bsHealth, sbHealth] = await Promise.all([
    listCourseOfferings(),
    getSyncStatus(),
    checkBrightspaceHealth(),
    checkSupabaseHealth(),
  ]);

  const courses = coursesResult.data;
  const sync = syncResult.data;
  const isMock = coursesResult.source === "mock" || syncResult.source === "mock";

  const active = courses.filter((c) => c.isActive);
  const recentlyUpdated = countRecentlyUpdated(courses);
  const needsAttention = courses.filter((c) => missingMetadata(c).length > 0);
  const syncTone: BadgeTone = sync.driftCount > 0 ? "warn" : "ok";

  const openCount = sync.warnings.length + needsAttention.length;
  const allClear = openCount === 0 && sync.driftCount === 0;
  const headline = allClear ? "Everything's running." : "A couple things need a look.";
  const summary = allClear
    ? `${active.length} offerings live — everything synced clean within the hour.`
    : `${active.length} offerings live. ${openCount} need${openCount === 1 ? "s" : ""} attention — the rest synced clean.`;

  let catIndex = 0;
  const nextCat = () => CAT[catIndex++ % CAT.length];

  return (
    <div className="fade-up">
      {/* Hero */}
      <div className="mb-[30px] flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="eyebrow mb-2.5 tracking-[0.14em]">Operations console</p>
          <h1 className="font-display text-[46px] font-bold leading-none tracking-[-0.03em] text-ink">
            {headline}
          </h1>
          <p className="mt-3 max-w-[540px] text-sm leading-relaxed text-ink-muted">{summary}</p>
        </div>
        <div className="flex shrink-0 gap-2.5">
          <ConnectionChip
            name="Brightspace"
            meta={formatRelative(bsHealth.checkedAt)}
            tone={HEALTH_TONE[bsHealth.status]}
          />
          <ConnectionChip
            name="Supabase"
            meta={formatRelative(sbHealth.checkedAt)}
            tone={HEALTH_TONE[sbHealth.status]}
          />
          <ConnectionChip
            name="Sync"
            meta={sync.lastRunAt ? formatRelative(sync.lastRunAt) : "not yet run"}
            tone={syncTone}
          />
        </div>
      </div>

      {isMock ? <MockDataBanner /> : null}

      {/* Metric band */}
      <div className="mb-[30px] grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <BandCell
          lead
          label="Active offerings"
          value={active.length}
          sub="Courses learners can reach right now"
        />
        <BandCell label="Updated" value={recentlyUpdated} sub="Synced within 7 days" />
        <BandCell
          label="Sync drift"
          value={sync.driftCount}
          sub={`${sync.coursesInBrightspace} BS / ${sync.coursesInSupabase} SB`}
          valueClass={sync.driftCount > 0 ? "text-status-warn-ink" : "text-ink"}
          flag={sync.driftCount > 0 ? <StatusBadge tone="warn">review</StatusBadge> : undefined}
        />
        <BandCell
          label="Warnings"
          value={sync.warnings.length}
          sub="Open from last check"
          valueClass={sync.warnings.length > 0 ? "text-status-error-ink" : "text-ink"}
        />
      </div>

      {/* Needs attention */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink">
            Needs attention
          </span>
          {openCount > 0 ? (
            <span className="rounded-[6px] bg-[var(--danger-tint)] px-2 py-[3px] font-mono text-[11px] font-semibold text-status-error-ink">
              {openCount} OPEN
            </span>
          ) : null}
        </div>
        <Link href="/courses/" className="font-mono text-[11px] text-accent">
          view all →
        </Link>
      </div>

      {allClear ? (
        <div className="editorial-card px-5 py-6 text-sm text-ink-muted">
          Nothing needs attention right now.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          {sync.warnings.map((warning, index) => (
            <div
              key={`${warning.orgUnitId}-${index}`}
              className="flex items-center gap-3.5 border-b border-line-soft px-[18px] py-4 last:border-b-0"
            >
              <span
                className="h-9 w-[3px] shrink-0 rounded"
                style={{ background: nextCat() }}
                aria-hidden
              />
              <StatusBadge tone={warning.severity === "error" ? "error" : "warn"}>
                {warning.severity === "error" ? "broken" : "review"}
              </StatusBadge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{warning.courseName}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">{warning.message}</p>
              </div>
              <Link
                href="/courses/"
                className="shrink-0 font-mono text-[11px] font-medium text-accent"
              >
                #{warning.orgUnitId} →
              </Link>
            </div>
          ))}
          {needsAttention.map((course) => (
            <div
              key={course.orgUnitId}
              className="flex items-center gap-3.5 border-b border-line-soft px-[18px] py-4 last:border-b-0"
            >
              <span
                className="h-9 w-[3px] shrink-0 rounded"
                style={{ background: nextCat() }}
                aria-hidden
              />
              <StatusBadge tone="warn">metadata</StatusBadge>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{course.name}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">
                  Missing {missingMetadata(course).join(", ")}
                </p>
              </div>
              <Link
                href="/courses/"
                className="shrink-0 font-mono text-[11px] font-medium text-accent"
              >
                #{course.orgUnitId} →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
