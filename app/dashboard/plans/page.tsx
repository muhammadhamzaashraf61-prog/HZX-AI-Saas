"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserData = {
  plan: string;
  isAdmin: boolean;
};

export default function PlansPage() {
  const [user, setUser] =
    useState<UserData | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const response = await fetch(
        "/api/dashboard"
      );

      const data = await response.json();

      if (response.ok) {
        setUser({
          plan: data.user.plan,
          isAdmin: data.user.isAdmin,
        });
      }
    } catch (error) {
      console.error(
        "PLANS USER ERROR:",
        error
      );
    }
  }

  return (
    <main className="plans-page">
      <div className="plans-container">

        <Link
          href="/dashboard"
          className="plans-back"
        >
          ← Dashboard
        </Link>

        <div className="plans-header">
          <p>HZX AI PLANS</p>

          <h1>
            Choose your workspace
          </h1>

          <span>
            Start free and upgrade when
            you need more AI power.
          </span>
        </div>

        <div className="plans-grid">

          {/* FREE PLAN */}

          <div
            className={`pricing-card ${
              user?.plan === "free"
                ? "current-plan"
                : ""
            }`}
          >
            <div className="pricing-top">

              <span className="pricing-icon">
                ✦
              </span>

              <h2>Free</h2>

              <p>
                For getting started
              </p>

            </div>

            <div className="pricing-price">
              <strong>Rs. 0</strong>
              <span>/month</span>
            </div>

            <div className="pricing-limit">
              20 AI requests / month
            </div>

            <ul>
              <li>✓ AI Assistant</li>
              <li>✓ AI Writer</li>
              <li>✓ Document Analyzer</li>
              <li>✓ Usage Dashboard</li>
            </ul>

            <button
              className="pricing-button secondary"
              disabled
            >
              {user?.plan === "free"
                ? "Current Plan"
                : "Free Plan"}
            </button>
          </div>

          {/* PRO PLAN */}

          <div
            className={`pricing-card featured ${
              user?.plan === "pro"
                ? "current-plan"
                : ""
            }`}
          >

            <div className="popular-badge">
              POPULAR
            </div>

            <div className="pricing-top">

              <span className="pricing-icon">
                ⚡
              </span>

              <h2>Pro</h2>

              <p>
                For serious AI usage
              </p>

            </div>

            <div className="pricing-price">
              <strong>Rs. 999</strong>
              <span>/month</span>
            </div>

            <div className="pricing-limit">
              500 AI requests / month
            </div>

            <ul>
              <li>✓ Everything in Free</li>
              <li>✓ 500 AI requests</li>
              <li>✓ Higher usage limits</li>
              <li>✓ Priority workspace</li>
            </ul>

            {user?.plan === "pro" ? (
              <button
                className="pricing-button"
                disabled
              >
                Current Plan
              </button>
            ) : (
              <Link
                href="/dashboard/payment"
                className="pricing-button"
              >
                Upgrade to Pro →
              </Link>
            )}

            <small className="payment-note">
              Manual payment with admin verification.
            </small>

          </div>

          {/* ADMIN PLAN */}

          {user?.isAdmin && (
            <div className="pricing-card admin-plan">

              <div className="pricing-top">

                <span className="pricing-icon">
                  👑
                </span>

                <h2>Admin</h2>

                <p>
                  HZX AI administrator
                </p>

              </div>

              <div className="pricing-price">
                <strong>∞</strong>
                <span> unlimited</span>
              </div>

              <div className="pricing-limit">
                Unlimited AI requests
              </div>

              <ul>
                <li>✓ Unlimited Chat</li>
                <li>✓ Unlimited Writer</li>
                <li>✓ Unlimited Documents</li>
                <li>✓ Full administration</li>
              </ul>

              <button
                className="pricing-button admin-button"
                disabled
              >
                Admin Access
              </button>

            </div>
          )}

        </div>

      </div>
    </main>
  );
}
