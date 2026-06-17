"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { IconDatabase, IconExternal } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";

type ListingStatus = "draft" | "hidden" | "published";

type ListingForm = {
  title: string;
  description: string;
  practiceArea: string;
  audience: string;
  durationLabel: string;
  level: string;
  jurisdiction: string;
  program: string;
  tags: string;
  orgUnitId: string;
  launchUrl: string;
  status: ListingStatus;
};

const initialForm: ListingForm = {
  title: "Using the Brightspace Manager",
  description:
    "A practical course for understanding how Course Studio, Brightspace, Supabase, and Learning Hub fit together.",
  practiceArea: "Foundations",
  audience: "Legal aid staff and course authors",
  durationLabel: "22 min",
  level: "Beginner",
  jurisdiction: "Massachusetts",
  program: "LACE",
  tags: "course authoring, Brightspace, Learning Hub",
  orgUnitId: "6735",
  launchUrl: "https://mlri.brightspace.com/d2l/home/6735",
  status: "hidden",
};

const statusHelp: Record<ListingStatus, string> = {
  draft: "Saved in Manager only. Do not show in Learning Hub yet.",
  hidden: "Ready for review, but hidden from ordinary learner discovery.",
  published: "Eligible to appear in Learning Hub once sync/write support is connected.",
};

export default function HubListingPage() {
  const [form, setForm] = useState<ListingForm>(initialForm);

  const tagList = useMemo(
    () =>
      form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [form.tags],
  );

  const writePlan = useMemo(
    () => [
      ["provider", "brightspace"],
      ["provider_course_id", form.orgUnitId || "not set"],
      ["item_type", "course"],
      ["title", form.title || "not set"],
      ["description", form.description || "not set"],
      ["practice_area", form.practiceArea || "not set"],
      ["level", form.level || "not set"],
      ["duration_label", form.durationLabel || "not set"],
      ["brightspace_url", form.launchUrl || "not set"],
      [
        "metadata",
        JSON.stringify({
          audience: form.audience,
          jurisdiction: form.jurisdiction,
          program: form.program,
          tags: tagList,
          status: form.status,
        }),
      ],
    ],
    [form, tagList],
  );

  function update<K extends keyof ListingForm>(key: K, value: ListingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="fade-up min-w-0 max-w-[1100px] break-words">
      <PageHeader
        eyebrow="Author / Learning Hub listing"
        title="Add a course to Learning Hub"
        description="A starter flow for collecting the catalog details Learning Hub needs, previewing the listing, and preparing the Supabase write plan."
        actions={<StatusBadge tone="warn">Preview only</StatusBadge>}
      />

      <section className="mb-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="editorial-card border-[var(--accent-tint)] bg-brand-tint px-4 py-5 sm:px-6">
          <p className="eyebrow mb-2">Catalog handoff</p>
          <h2 className="mb-2 font-display text-[24px] font-bold leading-tight text-ink">
            Collect once. Preview before writing.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
            The goal is to let a finished Brightspace course appear in Learning Hub
            without editing Learning Hub code. Brightspace Manager can collect the
            listing metadata, show exactly what will be written, and later create or
            update the Supabase catalog row.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/publish/" className="btn-primary max-[520px]:w-full max-[520px]:justify-center">
              <IconExternal size={15} />
              Back to publish workflow
            </Link>
            <Link href="/supabase-data/" className="btn-secondary max-[520px]:w-full max-[520px]:justify-center">
              <IconDatabase size={15} />
              Inspect Supabase data
            </Link>
          </div>
        </div>

        <aside className="editorial-card px-4 py-5 sm:px-5">
          <p className="eyebrow mb-2">Flow status</p>
          <h2 className="font-display text-[18px] font-semibold text-ink">
            This version does not write yet
          </h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
            The form is intentionally preview-only. The next step would connect it to a
            create/update plan for `learning_items`, then require confirmation and audit
            logging before any catalog row changes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge tone="info">Form</StatusBadge>
            <StatusBadge tone="info">Preview</StatusBadge>
            <StatusBadge tone="warn">No write</StatusBadge>
          </div>
        </aside>
      </section>

      <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid min-w-0 gap-4">
          <FormCard title="Learning Hub listing" eyebrow="Editorial metadata">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Course title">
                <input
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Practice area">
                <input
                  value={form.practiceArea}
                  onChange={(event) => update("practiceArea", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Audience">
                <input
                  value={form.audience}
                  onChange={(event) => update("audience", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Duration">
                <input
                  value={form.durationLabel}
                  onChange={(event) => update("durationLabel", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Level">
                <select
                  value={form.level}
                  onChange={(event) => update("level", event.target.value)}
                  className={inputClass}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>All levels</option>
                </select>
              </Field>
              <Field label="Catalog status">
                <select
                  value={form.status}
                  onChange={(event) => update("status", event.target.value as ListingStatus)}
                  className={inputClass}
                >
                  <option value="draft">draft</option>
                  <option value="hidden">hidden</option>
                  <option value="published">published</option>
                </select>
                <span className="mt-1.5 block text-[12px] leading-snug text-ink-soft">
                  {statusHelp[form.status]}
                </span>
              </Field>
            </div>
            <Field label="Short description">
              <textarea
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                rows={4}
                className={areaClass}
              />
            </Field>
          </FormCard>

          <FormCard title="Discovery and source" eyebrow="Catalog routing">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Jurisdiction">
                <input
                  value={form.jurisdiction}
                  onChange={(event) => update("jurisdiction", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Program or collection">
                <input
                  value={form.program}
                  onChange={(event) => update("program", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Brightspace org unit id">
                <input
                  value={form.orgUnitId}
                  onChange={(event) => update("orgUnitId", event.target.value.replace(/[^0-9]/g, ""))}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Launch URL">
                <input
                  value={form.launchUrl}
                  onChange={(event) => update("launchUrl", event.target.value)}
                  className={`${inputClass} font-mono !text-[12px]`}
                />
              </Field>
            </div>
            <Field label="Tags">
              <input
                value={form.tags}
                onChange={(event) => update("tags", event.target.value)}
                className={inputClass}
              />
            </Field>
          </FormCard>
        </div>

        <aside className="grid min-w-0 gap-4 self-start">
          <section className="editorial-card overflow-hidden">
            <div className="border-b border-line bg-surface-sunken px-4 py-3">
              <p className="eyebrow">Learning Hub preview</p>
            </div>
            <div className="px-4 py-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <StatusBadge tone={form.status === "published" ? "ok" : "warn"}>
                  {form.status}
                </StatusBadge>
                {form.practiceArea ? <StatusBadge tone="info">{form.practiceArea}</StatusBadge> : null}
              </div>
              <h2 className="font-display text-[22px] font-bold leading-tight text-ink">
                {form.title || "Untitled course"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {form.description || "Add a short catalog description."}
              </p>
              <div className="mt-4 grid gap-2 border-t border-line-soft pt-4 text-[12.5px] text-ink-muted">
                <PreviewRow label="Audience" value={form.audience} />
                <PreviewRow label="Duration" value={form.durationLabel} />
                <PreviewRow label="Level" value={form.level} />
                <PreviewRow label="Jurisdiction" value={form.jurisdiction} />
              </div>
              {tagList.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[6px] bg-surface-sunken px-2 py-1 text-[12px] font-medium text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="editorial-card px-4 py-4">
            <p className="eyebrow mb-2">Write plan</p>
            <h2 className="section-title mb-3 text-ink">Supabase learning_items row</h2>
            <div className="grid gap-2">
              {writePlan.map(([key, value]) => (
                <div key={key} className="rounded-[9px] border border-line bg-surface-sunken px-3 py-2">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                    {key}
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-ink-muted">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <button type="button" disabled className="btn-primary mt-4 w-full justify-center opacity-60">
              Preview only - write not connected
            </button>
          </section>

          <section className="editorial-card px-4 py-4">
            <p className="eyebrow mb-2">Next checks</p>
            <ul className="grid gap-2 text-[12.5px] leading-relaxed text-ink-muted">
              <CheckItem>Confirm the Brightspace course is live.</CheckItem>
              <CheckItem>Confirm the launch URL opens cleanly.</CheckItem>
              <CheckItem>Preview how this card appears in Learning Hub.</CheckItem>
              <CheckItem>Require confirm before writing to Supabase.</CheckItem>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-[10px] border border-line bg-surface px-3 text-[13.5px] text-ink outline-none transition-colors focus:border-accent focus:ring-[3px] focus:ring-[var(--accent-tint)]";

const areaClass =
  "w-full rounded-[10px] border border-line bg-surface px-3 py-3 text-[13.5px] leading-relaxed text-ink outline-none transition-colors focus:border-accent focus:ring-[3px] focus:ring-[var(--accent-tint)]";

function FormCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="editorial-card px-4 py-5 sm:px-5">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="section-title mb-4 text-ink">{title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </span>
      <span className="min-w-0 text-ink-muted">{value || "not set"}</span>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-[2px] bg-accent" aria-hidden />
      <span>{children}</span>
    </li>
  );
}
