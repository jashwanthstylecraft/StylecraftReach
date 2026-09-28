import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerk-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SC Reach — StylecraftUS",
  description: "Influencer marketing CRM for StylecraftUS, GAMMA+ and Johnny B.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} bg-background font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );

  if (!isClerkConfigured) {
    return body;
  }

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#C8A96E",
          colorBackground: "#111114",
          colorText: "#F4F4F5",
        },
      }}
    >
      {body}
    </ClerkProvider>
  );
}
