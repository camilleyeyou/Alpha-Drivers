"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          fontFamily: "system-ui, sans-serif",
        }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", color: "#dc2626" }}>
            Erreur
          </h1>
          <h2 style={{ marginTop: "1rem", fontSize: "1.5rem", color: "#111827" }}>
            Une erreur critique est survenue
          </h2>
          <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
            Veuillez rafraîchir la page ou réessayer plus tard.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
