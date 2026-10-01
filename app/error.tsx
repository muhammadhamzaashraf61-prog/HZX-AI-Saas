"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("HZX AI ERROR:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <div>
        <h1>Something went wrong</h1>

        <p>
          HZX AI encountered an unexpected error.
          Please try again.
        </p>

        <button
          onClick={() => reset()}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    </main>
  );
}