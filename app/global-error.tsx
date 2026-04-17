"use client";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "Georgia, serif", padding: "40px", background: "#f4efe7", color: "#112326" }}>
        <main style={{ maxWidth: "640px", margin: "0 auto" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "12px", color: "#5f6c6f" }}>
            Lead Intel Studio
          </p>
          <h1 style={{ marginTop: "12px" }}>The application failed to start.</h1>
          <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
            {error.message || "A fatal error occurred while rendering the page."}
          </p>
          {error.digest ? (
            <p style={{ marginTop: "8px", color: "#5f6c6f" }}>Error reference: {error.digest}</p>
          ) : null}
          <button
            onClick={() => reset()}
            style={{
              marginTop: "24px",
              padding: "10px 20px",
              background: "#a34c21",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
