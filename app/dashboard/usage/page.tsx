"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Usage = {
  total: number;
  chat: number;
  writer: number;
  documents: number;
};

type RecentActivity = {
  feature: string;
  created_at: string;
};

export default function UsagePage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  async function loadUsage() {
    try {
      const response = await fetch("/api/usage");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load usage"
        );
      }

      setUsage(data.usage);
      setRecent(data.recent);
    } catch (error) {
      console.error("USAGE ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatFeature(feature: string) {
    if (feature === "chat") return "AI Assistant";
    if (feature === "writer") return "AI Writer";
    if (feature === "documents") return "Documents";

    return feature;
  }

  return (
    <main className="usage-page">
      <div className="usage-container">

        <Link
          href="/dashboard"
          className="usage-back"
        >
          ← Dashboard
        </Link>

        <div className="usage-header">
          <div className="usage-icon">
            ⌁
          </div>

          <div>
            <h1>Usage</h1>

            <p>
              Track how you use HZX AI.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="usage-loading">
            Loading usage...
          </div>
        ) : (
          <>
            <div className="usage-grid">

              <div className="usage-card usage-total">
                <span className="usage-card-icon">
                  ✦
                </span>

                <p>Total Requests</p>

                <h2>
                  {usage?.total ?? 0}
                </h2>
              </div>

              <div className="usage-card">
                <span className="usage-card-icon">
                  💬
                </span>

                <p>AI Assistant</p>

                <h2>
                  {usage?.chat ?? 0}
                </h2>
              </div>

              <div className="usage-card">
                <span className="usage-card-icon">
                  ✎
                </span>

                <p>AI Writer</p>

                <h2>
                  {usage?.writer ?? 0}
                </h2>
              </div>

              <div className="usage-card">
                <span className="usage-card-icon">
                  ◈
                </span>

                <p>Documents</p>

                <h2>
                  {usage?.documents ?? 0}
                </h2>
              </div>

            </div>

            <section className="activity-card">

              <div className="activity-header">
                <div>
                  <h2>Recent Activity</h2>

                  <p>
                    Your latest HZX AI requests
                  </p>
                </div>
              </div>

              {recent.length === 0 ? (
                <div className="no-activity">
                  No activity yet.
                </div>
              ) : (
                <div className="activity-list">

                  {recent.map(
                    (item, index) => (
                      <div
                        className="activity-item"
                        key={`${item.created_at}-${index}`}
                      >
                        <div className="activity-dot">
                          ✦
                        </div>

                        <div className="activity-info">
                          <strong>
                            {formatFeature(
                              item.feature
                            )}
                          </strong>

                          <span>
                            AI request
                          </span>
                        </div>

                        <time>
                          {new Date(
                            item.created_at
                          ).toLocaleString()}
                        </time>
                      </div>
                    )
                  )}

                </div>
              )}

            </section>
          </>
        )}

      </div>
    </main>
  );
}