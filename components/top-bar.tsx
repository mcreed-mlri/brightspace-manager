import Link from "next/link";
import { IconScales } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-provider";

const trainingHubUrl = process.env.NEXT_PUBLIC_TRAINING_HUB_URL;

export function TopBar() {
  return (
    <header className="flex min-h-[60px] shrink-0 items-center justify-between gap-3 border-b border-line bg-paper px-4 sm:px-6 lg:min-h-[68px]">
      <Link
        href="/dashboard/"
        className="inline-flex min-w-0 items-center gap-2.5 rounded-lg text-[15px] font-bold leading-tight tracking-[-0.02em] sm:text-[17px]"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-paper">
          <IconScales size={18} />
        </span>
        <span>Brightspace Manager</span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {trainingHubUrl ? (
          <a
            href={trainingHubUrl}
            className="inline-flex min-h-11 items-center rounded-lg px-2 text-[13px] font-semibold text-accent-ink hover:bg-surface-sunken sm:px-3"
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
