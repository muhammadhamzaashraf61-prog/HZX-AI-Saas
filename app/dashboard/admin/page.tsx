"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{
    id: number;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/me", {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }

        const data = await res.json();

        if (!data.authenticated || data.admin?.role !== "admin") {
          router.replace("/admin/login");
          return;
        }

        setAdmin(data.admin);
      } catch {
        router.replace("/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAdmin();
  }, [router]);

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#07070b",
          color: "white",
        }}
      >
        Checking admin access...
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#07070b",
        color: "white",
      }}
    >
      <h1>HZX AI Admin Dashboard</h1>

      <p>
        Logged in as: <strong>{admin.email}</strong>
      </p>

      <p>
        Role: <strong>{admin.role}</strong>
      </p>

      <button
        onClick={logout}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Admin Logout
      </button>
    </main>
  );
}