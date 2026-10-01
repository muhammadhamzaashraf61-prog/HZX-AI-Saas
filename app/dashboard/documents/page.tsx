"use client";

import { useState } from "react";
import Link from "next/link";

export default function DocumentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeDocument() {
    if (!file) return;

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to analyze document"
        );
      }

      setResult(data.result);
    } catch (error) {
      console.error("DOCUMENT ERROR:", error);

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
    <main className="documents-page">
      <div className="documents-container">

        <Link
          href="/dashboard"
          className="documents-back"
        >
          ← Dashboard
        </Link>

        <div className="documents-header">
          <div className="documents-icon">
            ◈
          </div>

          <div>
            <h1>Document Analyzer</h1>

            <p>
              Upload a document and let HZX AI analyze it.
            </p>
          </div>
        </div>

        <div className="documents-grid">

          <section className="document-upload-card">
            <h2>Upload Document</h2>

            <div className="upload-box">
              <div className="upload-symbol">
                ↑
              </div>

              <h3>
                Choose a document
              </h3>

              <p>
                PDF or TXT files
              </p>

              <input
                type="file"
                accept=".pdf,.txt"
                onChange={(event) => {
                  setFile(
                    event.target.files?.[0] || null
                  );
                  setResult("");
                }}
              />
            </div>

            {file && (
              <div className="selected-file">
                <span>📄</span>

                <div>
                  <strong>{file.name}</strong>

                  <small>
                    {(file.size / 1024).toFixed(1)} KB
                  </small>
                </div>
              </div>
            )}

            <button
              className="analyze-btn"
              onClick={analyzeDocument}
              disabled={!file || loading}
            >
              {loading
                ? "Analyzing..."
                : "✨ Analyze Document"}
            </button>
          </section>

          <section className="document-result-card">
            <div className="document-result-header">
              <h2>AI Analysis</h2>
            </div>

            <div className="document-result">

              {!result && !loading && (
                <div className="document-empty">
                  <div>◈</div>

                  <h3>
                    No analysis yet
                  </h3>

                  <p>
                    Upload a document to see
                    HZX AI's analysis here.
                  </p>
                </div>
              )}

              {loading && (
                <div className="document-loading">
                  <div className="loading-spinner" />

                  <p>
                    HZX AI is analyzing your document...
                  </p>
                </div>
              )}

              {result && !loading && (
                <div className="document-text">
                  {result}
                </div>
              )}

            </div>
          </section>

        </div>
      </div>
    </main>
  );
}