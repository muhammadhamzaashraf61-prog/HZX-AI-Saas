"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">

      {/* NAVBAR */}
      <nav className="home-nav">
        <Link href="/" className="home-logo">
          ✦ HZX AI
        </Link>

        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
        </div>

        <div className="home-nav-actions">
          <Link href="/auth/login" className="home-login">
            Login
          </Link>

          <Link
            href="/auth/register"
            className="home-get-started"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="home-hero">
        <div className="hero-content">

          <div className="hero-badge">
            <span>✦</span>
            AI-powered workspace
          </div>

          <h1>
            Work smarter
            <br />
            with <span>HZX AI.</span>
          </h1>

          <p>
            Chat with AI, create professional content,
            analyze documents and manage your AI workflow
            from one powerful workspace.
          </p>

          <div className="hero-buttons">
            <Link
              href="/auth/register"
              className="hero-primary"
            >
              Start for Free
              <span>→</span>
            </Link>

            <Link
              href="/auth/login"
              className="hero-secondary"
            >
              Sign In
            </Link>
          </div>

          <div className="hero-trust">
            <span>✓</span>
            Free to get started
            <span>✓</span>
            No credit card required
          </div>
        </div>

        {/* AI PREVIEW */}
        <div className="hero-preview-wrapper">
          <div className="hero-glow" />

          <div className="ai-preview">

            <div className="preview-topbar">
              <div className="preview-brand">
                <span>✦</span>
                HZX AI
              </div>

              <div className="preview-status">
                <span />
                Online
              </div>
            </div>

            <div className="preview-body">

              <div className="preview-message user-message">
                <div className="preview-avatar user-avatar">
                  H
                </div>

                <div className="preview-bubble">
                  How can AI help me work faster?
                </div>
              </div>

              <div className="preview-message ai-message">
                <div className="preview-avatar ai-avatar">
                  ✦
                </div>

                <div className="preview-ai-content">
                  <strong>
                    AI can help you in many ways:
                  </strong>

                  <div className="ai-point">
                    <span>✓</span>
                    Automate repetitive tasks
                  </div>

                  <div className="ai-point">
                    <span>✓</span>
                    Generate professional content
                  </div>

                  <div className="ai-point">
                    <span>✓</span>
                    Analyze documents
                  </div>

                  <div className="ai-point">
                    <span>✓</span>
                    Find answers instantly
                  </div>
                </div>
              </div>

            </div>

            <div className="preview-input">
              <span>Ask HZX AI anything...</span>
              <button>↑</button>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="home-section features-section"
      >
        <div className="section-heading">

          <div className="section-label">
            POWERFUL TOOLS
          </div>

          <h2>
            Everything you need.
            <br />
            <span>One intelligent workspace.</span>
          </h2>

          <p>
            HZX AI brings powerful AI tools together
            so you can focus on getting things done.
          </p>

        </div>

        <div className="features-grid">

          <FeatureCard
            icon="✦"
            title="AI Assistant"
            description="Ask questions, solve problems, brainstorm ideas and get intelligent answers."
          />

          <FeatureCard
            icon="✎"
            title="AI Writer"
            description="Create emails, articles, blogs and professional content in seconds."
          />

          <FeatureCard
            icon="◈"
            title="Document Analyzer"
            description="Upload documents and let AI understand, summarize and analyze them."
          />

          <FeatureCard
            icon="⌁"
            title="Usage Tracking"
            description="Monitor your AI requests and keep track of your monthly usage."
          />

          <FeatureCard
            icon="⚡"
            title="Fast AI"
            description="Get fast and useful AI responses powered by modern AI technology."
          />

          <FeatureCard
            icon="🔒"
            title="Secure Workspace"
            description="Your account, conversations and workspace are protected."
          />

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="home-section how-section"
      >
        <div className="section-heading">

          <div className="section-label">
            HOW IT WORKS
          </div>

          <h2>
            Simple.
            <br />
            <span>Powerful.</span>
          </h2>

          <p>
            Get started with HZX AI in just a few steps.
          </p>

        </div>

        <div className="steps-grid">

          <Step
            number="01"
            title="Create your account"
            description="Create your free HZX AI account in seconds."
          />

          <Step
            number="02"
            title="Choose your tool"
            description="Use AI Assistant, AI Writer or Document Analyzer."
          />

          <Step
            number="03"
            title="Get things done"
            description="Use AI to work faster, smarter and more efficiently."
          />

        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="home-section pricing-section"
      >
        <div className="section-heading">

          <div className="section-label">
            PRICING
          </div>

          <h2>
            Simple plans.
            <br />
            <span>More AI power.</span>
          </h2>

          <p>
            Start free and upgrade when you need more.
          </p>

        </div>

        <div className="pricing-grid">

          {/* FREE */}
          <div className="pricing-card">

            <div className="pricing-card-top">
              <span className="pricing-label">
                FREE
              </span>

              <h3>Free</h3>

              <p>
                Everything you need to get started.
              </p>
            </div>

            <div className="pricing-price">
              <strong>Rs 0</strong>
              <span>/month</span>
            </div>

            <div className="pricing-features">
              <FeatureItem text="50 AI requests/month" />
              <FeatureItem text="AI Assistant" />
              <FeatureItem text="AI Writer" />
              <FeatureItem text="Document Analyzer" />
              <FeatureItem text="Usage tracking" />
            </div>

            <Link
              href="/auth/register"
              className="pricing-button"
            >
              Get Started
            </Link>

          </div>

          {/* PRO */}
          <div className="pricing-card pricing-pro">

            <div className="popular-badge">
              POPULAR
            </div>

            <div className="pricing-card-top">
              <span className="pricing-label">
                PRO
              </span>

              <h3>Pro</h3>

              <p>
                More AI power for serious work.
              </p>
            </div>

            <div className="pricing-price">
              <strong>Rs 999</strong>
              <span>/month</span>
            </div>

            <div className="pricing-features">
              <FeatureItem text="500 AI requests/month" />
              <FeatureItem text="AI Assistant" />
              <FeatureItem text="AI Writer" />
              <FeatureItem text="Document Analyzer" />
              <FeatureItem text="Usage tracking" />
            </div>

            <Link
              href="/auth/register"
              className="pricing-button pricing-pro-button"
            >
              Get Pro
              <span>→</span>
            </Link>

          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <div className="cta-content">

          <div className="cta-icon">
            ✦
          </div>

          <h2>
            Ready to work smarter?
          </h2>

          <p>
            Start using HZX AI today and bring
            powerful AI tools into your workflow.
          </p>

          <Link
            href="/auth/register"
            className="hero-primary"
          >
            Create Free Account
            <span>→</span>
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">

        <div className="footer-main">

          <div className="footer-brand">
            <Link href="/" className="home-logo">
              ✦ HZX AI
            </Link>

            <p>
              Intelligent tools for better work.
            </p>
          </div>

          <div className="footer-links">

            <div>
              <strong>Product</strong>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#how-it-works">
                How It Works
              </a>
            </div>

            <div>
              <strong>Account</strong>
              <Link href="/auth/login">
                Login
              </Link>
              <Link href="/auth/register">
                Register
              </Link>
            </div>

          </div>

        </div>

        <div className="footer-bottom">
          <span>
            © 2026 HZX AI. All rights reserved.
          </span>

          <span>
            Built with AI.
          </span>
        </div>

      </footer>

    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="feature-card">

      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <span className="feature-arrow">
        →
      </span>

    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="step-card">

      <div className="step-number">
        {number}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

    </div>
  );
}

function FeatureItem({
  text,
}: {
  text: string;
}) {
  return (
    <div className="pricing-feature">
      <span>✓</span>
      {text}
    </div>
  );
}
