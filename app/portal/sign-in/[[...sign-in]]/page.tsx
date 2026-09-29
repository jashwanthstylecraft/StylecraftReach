import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-theme";

// The portal keeps a fixed light theme regardless of the brand app's dark/light
// toggle (Phase 5 design), so this always renders Clerk's light preset.
export default function PortalSignInPage() {
  return (
    <div className="flex justify-center py-12">
      <SignIn path="/portal/sign-in" routing="path" forceRedirectUrl="/portal" appearance={clerkAppearance("light")} />
    </div>
  );
}
