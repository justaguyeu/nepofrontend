"use client"; // Error boundaries must be Client Components

import "./globals.css";
import CrashScreen from "@/components/CrashScreen";

/**
 * Crashes in the root layout itself. This replaces the whole document, so it
 * brings its own <html>/<body> and styles; behaviour is the same as error.tsx.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <title>Nepo</title>
        <CrashScreen error={error} retry={retry} />
      </body>
    </html>
  );
}
