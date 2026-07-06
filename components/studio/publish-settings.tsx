"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_BASE_HOST,
  emptyPublishSettings,
  isPublishComplete,
  lmsFileUrl,
} from "@/lib/studio/deploy";
import type { ApiResponse } from "@/types/api";
import type { CourseOffering, DataSource } from "@/types/domain";
import type { PublishSettings } from "@/types/studio";

/* "Publish to Brightspace" section of the Course Details drawer. Picking a
   course from the inventory (or typing its id + code) is all it takes to make
   exports deploy-ready — every URL in the package gets pre-filled, so nothing
   is ever hand-edited after upload. */

function hostFromUrl(url: string): string {
  try {
    return new URL(url).host || DEFAULT_BASE_HOST;
  } catch {
    return DEFAULT_BASE_HOST;
  }
}

export function PublishSettingsSection({
  publish,
  firstPageFile,
  inputClass,
  onChange,
}: {
  publish: PublishSettings | undefined;
  /* e.g. "welcome.html" — used for the example-URL line */
  firstPageFile: string | null;
  inputClass: string;
  onChange: (next: PublishSettings | undefined) => void;
}) {
  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [source, setSource] = useState<DataSource | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/courses/", { cache: "no-store" });
        const body = (await response.json()) as ApiResponse<CourseOffering[]>;
        if (cancelled) return;
        if (body.ok) {
          setCourses(body.data);
          setSource(body.source);
        } else {
          setLoadError(true);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = publish ?? emptyPublishSettings();
  const ready = isPublishComplete(publish);
  const selectedId =
    publish && courses.some((c) => c.orgUnitId === publish.orgUnitId)
      ? String(publish.orgUnitId)
      : "";

  function update(patch: Partial<PublishSettings>) {
    onChange({ ...current, ...patch });
  }

  function pickCourse(value: string) {
    if (!value) return;
    const offering = courses.find((c) => String(c.orgUnitId) === value);
    if (!offering) return;
    update({
      orgUnitId: offering.orgUnitId,
      orgUnitCode: offering.code,
      baseHost: hostFromUrl(offering.brightspaceUrl),
    });
  }

  return (
    <div className="rounded-[10px] border border-line bg-surface-sunken px-4 py-4">
      <p className="mb-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        Publish to Brightspace
      </p>
      <p className="mb-3 text-[12px] leading-snug text-ink-soft">
        Tell the Studio which Brightspace course this will live in. Exports then come out ready to
        upload — every link already points to the right place.
      </p>

      {/* status line */}
      <p
        className={`mb-3 rounded-[8px] px-3 py-2 text-[12.5px] font-medium ${
          ready
            ? "bg-status-ok-soft text-status-ok-ink"
            : "bg-surface text-ink-muted border border-line"
        }`}
      >
        {ready
          ? `Deploy-ready — exported links will open inside Brightspace course ${current.orgUnitId}.`
          : "Local preview only — the export works on your computer. Pick a Brightspace course to make it deploy-ready."}
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[12px] font-semibold text-ink-muted">
            Pick the Brightspace course
          </span>
          <select
            className={inputClass}
            value={selectedId}
            onChange={(e) => pickCourse(e.target.value)}
          >
            <option value="">— Choose a course —</option>
            {courses.map((c) => (
              <option key={c.orgUnitId} value={c.orgUnitId} disabled={!c.code}>
                {c.name} ({c.orgUnitId}){c.code ? "" : " — no code set in Brightspace"}
              </option>
            ))}
          </select>
          {source === "mock" ? (
            <span className="mt-1 block text-[11.5px] text-status-warn-ink">
              This is a sample list — type the real values below (find them in Brightspace under
              Course Admin → Course Offering Information).
            </span>
          ) : null}
          {loadError ? (
            <span className="mt-1 block text-[11.5px] text-ink-soft">
              Couldn&apos;t load the course list — type the values below instead.
            </span>
          ) : null}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-ink-muted">
              Course id (number)
            </span>
            <input
              type="number"
              inputMode="numeric"
              className={inputClass}
              placeholder="e.g. 6706"
              value={current.orgUnitId ?? ""}
              onChange={(e) =>
                update({ orgUnitId: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold text-ink-muted">Course code</span>
            <input
              className={`${inputClass} font-mono !text-[12.5px]`}
              placeholder="e.g. demo.onboarding_mc"
              value={current.orgUnitCode}
              onChange={(e) => update({ orgUnitCode: e.target.value })}
            />
          </label>
        </div>

        {ready && firstPageFile ? (
          <p className="break-all text-[11.5px] leading-snug text-ink-soft">
            First lesson will live at:{" "}
            <span className="font-mono">{lmsFileUrl(current, firstPageFile)}</span>
          </p>
        ) : null}

        <details>
          <summary className="cursor-pointer text-[12px] font-semibold text-ink-muted">
            Advanced
          </summary>
          <div className="mt-2 grid gap-3">
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-ink-muted">
                Brightspace address
              </span>
              <input
                className={`${inputClass} font-mono !text-[12.5px]`}
                value={current.baseHost}
                onChange={(e) => update({ baseHost: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-ink-muted">
                Upload folder (leave empty to upload at the top level)
              </span>
              <input
                className={`${inputClass} font-mono !text-[12.5px]`}
                placeholder="e.g. lace-course"
                value={current.folderPath}
                onChange={(e) => update({ folderPath: e.target.value })}
              />
            </label>
          </div>
        </details>

        {publish ? (
          <button
            type="button"
            className="text-[12px] font-semibold text-ink-soft underline-offset-2 hover:text-ink hover:underline"
            onClick={() => onChange(undefined)}
          >
            Clear publish settings (back to local preview)
          </button>
        ) : null}
      </div>
    </div>
  );
}
