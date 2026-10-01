"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";

type DashboardData = {
  user: {
    name: string;
    email: string;
    plan: string;
    isAdmin: boolean;
  };

  usage: {
    used: number;
    isUnlimited: boolean;
    limit: number | null;
    remaining: number | null;
    percentage: number;
  };
};

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await fetch(
        "/api/dashboard"
      );

      const result = await response.json();

      if (!response.ok) {
        window.location.href = "/auth/login";
        return;
      }

      setData(result);
    } catch (error) {
      console.error(
        "DASHBOARD ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          Loading HZX AI...
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const { user, usage } = data;

  return (
    <main className="dashboard-page">

      {/* NAVBAR */}

      <nav className="dashboard-nav">

        <Link
          href="/dashboard"
          className="dashboard-logo"
        >
          ✦ HZX AI
        </Link>

        <div className="dashboard-user">

          <span>{user.name}</span>

          <Link
            href="/dashboard/profile"
            className="profile-nav-link"
          >
            Profile
          </Link>

          <LogoutButton />

        </div>

      </nav>

      {/* CONTENT */}

      <section className="dashboard-content">

        {/* WELCOME */}

        <div className="dashboard-welcome">

          <div>

            <p className="dashboard-label">
              {user.isAdmin
                ? "ADMIN WORKSPACE"
                : "AI WORKSPACE"}
            </p>

            <h1>
              Welcome, {user.name}
            </h1>

            <p>
              {user.isAdmin
                ? "Manage and monitor your HZX AI platform."
                : "Your intelligent workspace is ready."}
            </p>

          </div>

          <div className="dashboard-avatar">
            {user.name
              .charAt(0)
              .toUpperCase()}
          </div>

        </div>

        {/* PLAN CARD */}

        <div className="plan-card">

          <div className="plan-info">

            <div className="plan-title">

              <span>
                {user.isAdmin
                  ? "👑"
                  : user.plan === "pro"
                  ? "⚡"
                  : "✦"}
              </span>

              <div>

                <p>CURRENT PLAN</p>

                <h2>
                  {user.isAdmin
                    ? "ADMIN"
                    : user.plan.toUpperCase()}
                </h2>

              </div>

            </div>

            <div className="plan-numbers">

              {usage.isUnlimited ? (
                <>
                  <strong>∞</strong>

                  <span>
                    Unlimited requests
                  </span>
                </>
              ) : (
                <>
                  <strong>
                    {usage.used}
                  </strong>

                  <span>
                    / {usage.limit} requests
                  </span>
                </>
              )}

            </div>

          </div>

          {/* PROGRESS BAR */}

          {!usage.isUnlimited && (
            <div className="usage-progress">

              <div
                className="usage-progress-bar"
                style={{
                  width: `${usage.percentage}%`,
                }}
              />

            </div>
          )}

          <div className="plan-bottom">

            <span>
              {usage.isUnlimited
                ? "Unlimited AI credits"
                : `${usage.remaining} requests remaining this month`}
            </span>

            {!user.isAdmin &&
              user.plan === "free" && (
                <Link
                  href="/dashboard/plans"
                  className="upgrade-link"
                >
                  Upgrade to Pro →
                </Link>
              )}

            {user.isAdmin && (
              <Link
                href="/dashboard/admin"
                className="upgrade-link"
              >
                Admin Panel →
              </Link>
            )}

          </div>

        </div>

        {/* FEATURE CARDS */}

        <div className="dashboard-grid">

          {/* AI CHAT */}

          <div className="dashboard-card main-card">

            <div className="card-icon">
              ✦
            </div>

            <h2>AI Assistant</h2>

            <p>
              Ask questions, generate content,
              analyze information and work
              smarter with AI.
            </p>

            <Link
              href="/dashboard/chat"
              className="dashboard-button"
            >
              Start Chat →
            </Link>

          </div>

          {/* WRITER */}

          <div className="dashboard-card">

            <div className="card-icon">
              ✎
            </div>

            <h2>AI Writer</h2>

            <p>
              Generate emails, blogs, articles
              and professional text in seconds.
            </p>

            <Link
              href="/dashboard/writer"
              className="dashboard-button secondary"
            >
              Open Writer →
            </Link>

          </div>

          {/* DOCUMENTS */}

          <div className="dashboard-card">

            <div className="card-icon">
              ◈
            </div>

            <h2>Documents</h2>

            <p>
              Upload documents and let HZX AI
              analyze their content.
            </p>

            <Link
              href="/dashboard/documents"
              className="dashboard-button secondary"
            >
              Open Documents →
            </Link>

          </div>

          {/* USAGE */}

          <div className="dashboard-card">

            <div className="card-icon">
              ⌁
            </div>

            <h2>Usage</h2>

            <p>
              Track your AI requests and monitor
              your monthly usage.
            </p>

            <Link
              href="/dashboard/usage"
              className="dashboard-button secondary"
            >
              View Usage →
            </Link>

          </div>

          {/* ADMIN */}

          {user.isAdmin && (
            <div className="dashboard-card admin-card">

              <div className="card-icon">
                ⚙
              </div>

              <h2>Admin Panel</h2>

              <p>
                Manage users, monitor usage and
                control your HZX AI platform.
              </p>

              <Link
                href="/dashboard/admin"
                className="dashboard-button secondary"
              >
                Open Admin Panel →
              </Link>

            </div>
          )}

          {/* PLANS */}

          {!user.isAdmin && (
            <div className="dashboard-card">

              <div className="card-icon">
                ⚡
              </div>

              <h2>Plans</h2>

              <p>
                View your current plan and explore
                available upgrade options.
              </p>

              <Link
                href="/dashboard/plans"
                className="dashboard-button secondary"
              >
                View Plans →
              </Link>

            </div>
          )}

          {/* PROFILE */}

          <div className="dashboard-card">

            <div className="card-icon">
              ◉
            </div>

            <h2>Profile</h2>

            <p>
              Manage your account information
              and security settings.
            </p>

            <Link
              href="/dashboard/profile"
              className="dashboard-button secondary"
            >
              Open Profile →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
