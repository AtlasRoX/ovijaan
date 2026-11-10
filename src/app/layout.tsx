import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { getSessionUser } from "@/lib/server/session";

export const metadata: Metadata = {
  title: "OBHIJAAN | Personal Competition & Project Dashboard",
  description: "One account, one private workspace, one source of truth for competitions, projects, and achievements.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OBHIJAAN",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSessionUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-FOUC: apply persisted theme before paint. Defaults to light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('obhijaan_production_vault_v2');if(s){var p=JSON.parse(s);if(p&&p.state&&p.state.theme==='dark'){document.documentElement.classList.add('dark');}}}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <AppShell initialUser={sessionUser}>{children}</AppShell>
      </body>
    </html>
  );
}
