import { redirect } from "next/navigation";

/* Operator-first: the ops console is the front door. Authors land on /course-studio/. */
export default function RootPage() {
  redirect("/dashboard/");
}
