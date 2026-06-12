import type { Metadata } from "next";
import { SignInCard } from "@/components/auth/sign-in-card";

export const metadata: Metadata = {
  title: "Sign in · Brightspace Manager",
};

/* Renders as a full-screen overlay (the card uses fixed positioning) so the
   app shell behind it is never visible while signed out. */
export default function SignInPage() {
  return <SignInCard />;
}
