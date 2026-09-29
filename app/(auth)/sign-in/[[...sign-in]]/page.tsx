"use client";

import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";
import { useCurrentTheme } from "@/lib/use-theme";

export default function SignInPage() {
  const theme = useCurrentTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn path="/sign-in" routing="path" appearance={clerkAppearance(theme)} />
    </div>
  );
}
