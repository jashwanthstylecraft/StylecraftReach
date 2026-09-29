import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkThemeProvider } from "@/components/providers/ClerkThemeProvider";
import { isClerkConfigured } from "@/lib/clerk-config";
import { themeInitScript } from "@/lib/theme-script";
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

// Every page here reads live, per-request Supabase/Clerk data — nothing should
// ever be statically prerendered at build time. Without this, pages whose data
// functions don't happen to call a Clerk/cookies/headers API in their direct
// render path (e.g. lib/social-data.ts, lib/brand-comparison-data.ts) get
// attempted as static routes during `next build`; if that build-time Supabase
// call throws (a table not migrated yet, a misconfigured env var), Next.js
// fails the ENTIRE build ("Export encountered errors..."), not just that route.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
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

  return <ClerkThemeProvider>{body}</ClerkThemeProvider>;
}
