import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp
        path="/sign-up"
        routing="path"
        appearance={{
          variables: {
            colorPrimary: "#C8A96E",
            colorBackground: "#111114",
            colorText: "#F4F4F5",
            colorInputBackground: "#1A1A1F",
            colorInputText: "#F4F4F5",
          },
        }}
      />
    </div>
  );
}
