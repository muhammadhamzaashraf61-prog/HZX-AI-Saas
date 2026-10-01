import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p>
          The page you're looking for doesn't exist.
        </p>

        <Link href="/">
          Back to Home →
        </Link>
      </div>
    </main>
  );
}