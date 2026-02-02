"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-base-content/70 mb-6">
        An error occurred while loading this page.
      </p>
      <button onClick={reset} className="btn btn-primary">
        Try Again
      </button>
    </div>
  );
}
