import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import ClientOnly from "../components/ClientOnly";
import { InstallPrompt } from "../components/InstallPrompt";

export const metadata: Metadata = {
  title: "Dart Tournament Scheduler",
  description: "Schedule and manage dart tournaments",
  generator: "v0.dev",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dart Tournament",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <script src="/sw-register.js" defer />
      </head>
      <body suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ClientOnly>
            <InstallPrompt />
          </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
