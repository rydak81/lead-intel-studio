"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Lead Intel Studio render error:", error);
  }, [error]);

  return (
    <main className="page-shell">
      <section className="panel" style={{ padding: "32px" }}>
        <p className="eyebrow">Something went wrong</p>
        <h1 style={{ marginTop: "8px" }}>The workspace could not load.</h1>
        <p className="lede" style={{ marginTop: "12px" }}>
          {error.message || "An unexpected error occurred while loading the workspace."}
        </p>
        {error.digest ? (
          <p className="helper-copy" style={{ marginTop: "8px" }}>
            Error reference: {error.digest}
          </p>
        ) : null}
        <div className="panel-actions" style={{ marginTop: "20px" }}>
          <button className="primary-button" onClick={() => reset()} type="button">
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
