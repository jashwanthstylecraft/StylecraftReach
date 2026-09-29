"use client";

import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";
import { useCurrentTheme } from "@/lib/use-theme";

export default function SignUpPage() {
  const theme = useCurrentTheme();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp path="/sign-up" routing="path" appearance={clerkAppearance(theme)} />
    </div>
  );
}
