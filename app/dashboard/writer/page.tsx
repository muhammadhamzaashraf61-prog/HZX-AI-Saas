"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function WriterPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateContent() {
    if (!topic.trim()) {
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/writer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          tone,
          length,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate content"
        );
      }

      setResult(data.content);
    } catch (error) {
      console.error("WRITER ERROR:", error);

      setResult(
        error instanceof Error
          ? `Error: ${error.message}`
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="writer-page">
      <div className="writer-container">

        <Link
          href="/dashboard"
          className="writer-back"
        >
          ← Dashboard
        </Link>

        <div className="writer-header">
          <div className="writer-icon">
            ✍️
          </div>

          <div>
            <h1>AI Writer</h1>

            <p>
              Create professional content with HZX AI.
            </p>
          </div>
        </div>

        <div className="writer-grid">

          <section className="writer-card">

            <h2>Content Details</h2>

            <label>
              What do you want to write?
            </label>

            <textarea
              value={topic}
              onChange={(event) =>
                setTopic(event.target.value)
              }
              placeholder="Example: Write an article about the future of artificial intelligence..."
              rows={8}
            />

            <label>
              Tone
            </label>

            <select
              value={tone}
              onChange={(event) =>
                setTone(event.target.value)
              }
            >
              <option>Professional</option>
              <option>Friendly</option>
              <option>Casual</option>
              <option>Creative</option>
              <option>Persuasive</option>
              <option>Academic</option>
            </select>

            <label>
              Length
            </label>

            <select
              value={length}
              onChange={(event) =>
                setLength(event.target.value)
              }
            >
              <option>Short</option>
              <option>Medium</option>
              <option>Long</option>
            </select>

            <button
              className="generate-btn"
              onClick={generateContent}
              disabled={loading || !topic.trim()}
            >
              {loading
                ? "Generating..."
                : "✨ Generate Content"}
            </button>

          </section>

          <section className="writer-card result-card">

            <div className="result-header">
              <h2>Generated Content</h2>

              {result && (
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(result)
                  }
                  className="copy-btn"
                >
                  Copy
                </button>
              )}
            </div>

            <div className="writer-result">

              {!result && !loading && (
                <div className="writer-empty">
                  <div>✨</div>

                  <h3>
                    Your content will appear here
                  </h3>

                  <p>
                    Enter a topic and click Generate
                    Content.
                  </p>
                </div>
              )}

              {loading && (
                <div className="writer-loading">
                  <div className="loading-spinner" />

                  <p>
                    HZX AI is writing...
                  </p>
                </div>
              )}

              {result && !loading && (
                <div className="writer-markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {result}
                  </ReactMarkdown>
                </div>
              )}

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}