"use client"; // Error boundaries must be Client Components

import CrashScreen from "@/components/CrashScreen";

/** Any page that crashes signs the person out and sends them to /login (see CrashScreen). */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <CrashScreen error={error} retry={retry} />;
}
