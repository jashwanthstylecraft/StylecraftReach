import { SignIn } from "@clerk/nextjs";

export default function PortalSignInPage() {
  return (
    <div className="flex justify-center py-12">
      <SignIn
        path="/portal/sign-in"
        routing="path"
        forceRedirectUrl="/portal"
        appearance={{
          variables: {
            colorPrimary: "#C8A96E",
            colorBackground: "#FFFFFF",
            colorText: "#111114",
            colorInputBackground: "#F8F8FA",
            colorInputText: "#111114",
          },
        }}
      />
    </div>
  );
}
