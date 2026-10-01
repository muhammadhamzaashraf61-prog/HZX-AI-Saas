import Link from "next/link";

export default function UnauthorizedPage() {
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
        <h1>401</h1>

        <h2>Login Required</h2>

        <p>
          Please login to access this page.
        </p>

        <Link href="/login">
          Go to Login →
        </Link>
      </div>
    </main>
  );
}