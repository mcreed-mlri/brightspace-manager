import { redirect } from "next/navigation";

/* Operator-first: the ops console is the front door. Author Home lives at /author/. */
export default function RootPage() {
  redirect("/dashboard/");
}
