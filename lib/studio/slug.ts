/* Slug helper shared by the server draft store and the client builder
   (auto-naming lesson files from their titles) — keep this file free of
   "server-only" imports. */

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "untitled"
  );
}
