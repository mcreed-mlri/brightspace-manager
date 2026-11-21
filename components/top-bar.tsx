import Link from "next/link";
import { IconScales } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-provider";

const trainingHubUrl = process.env.NEXT_PUBLIC_TRAINING_HUB_URL;

export function TopBar() {
  return (
    <header className="studio-masthead flex min-h-[60px] shrink-0 items-center justify-between gap-3 px-4 sm:px-6 lg:min-h-[68px]">
      <Link
        href="/dashboard/"
        className="inline-flex min-w-0 items-center gap-2.5 rounded-lg text-[16px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[19px]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--solid-bg)] text-[var(--solid-ink)]">
          <IconScales size={18} />
        </span>
        <span>Brightspace Manager</span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {trainingHubUrl ? (
          <a
            href={trainingHubUrl}
            className="hub-link inline-flex min-h-10 items-center whitespace-nowrap px-4 text-[13px] font-semibold"
          >
            Training Hub{" "}
            <span className="ml-1" aria-hidden="true">
              ↗
            </span>
          </a>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
