"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Payment = {
  id: number;
  amount: number;
  method: string;
  transaction_id: string;
  status: string;
  created_at: string;
};

export default function PaymentPage() {
  const [method, setMethod] = useState("Easypaisa");
  const [transactionId, setTransactionId] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPayments, setLoadingPayments] =
    useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadPayments() {
    try {
      const response = await fetch("/api/payments");

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setPayments(data.payments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingPayments(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 999,
          method,
          transactionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Payment submission failed"
        );
        return;
      }

      setMessage(
        "Payment submitted. Admin will review it shortly."
      );

      setTransactionId("");

      await loadPayments();
    } catch (error) {
      console.error(error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="payment-page">
      <div className="payment-container">

        <Link
          href="/dashboard/plans"
          className="back-link"
        >
          ← Back to Plans
        </Link>

        <div className="payment-header">
          <span className="payment-badge">
            PRO PLAN
          </span>

          <h1>Upgrade to Pro</h1>

          <p>
            Get 500 AI requests every month.
          </p>
        </div>

        <div className="payment-grid">

          <section className="payment-card">
            <h2>1. Make Payment</h2>

            <div className="amount-box">
              <span>Amount</span>
              <strong>Rs 999</strong>
            </div>

            <div className="payment-info">
              <h3>Easypaisa</h3>

              <p>
                Send <strong>Rs 999</strong> to:
              </p>

              <div className="account-number">
                03XX-XXXXXXX
              </div>

              <p className="small-text">
                Replace this number with your actual
                Easypaisa number.
              </p>
            </div>

            <div className="payment-info">
              <h3>JazzCash</h3>

              <p>
                Send <strong>Rs 999</strong> to:
              </p>

              <div className="account-number">
                03XX-XXXXXXX
              </div>

              <p className="small-text">
                Replace this number with your actual
                JazzCash number.
              </p>
            </div>
          </section>

          <section className="payment-card">
            <h2>2. Submit Payment</h2>

            <form onSubmit={handleSubmit}>

              <label>
                Payment Method
              </label>

              <select
                value={method}
                onChange={(event) =>
                  setMethod(event.target.value)
                }
              >
                <option value="Easypaisa">
                  Easypaisa
                </option>

                <option value="JazzCash">
                  JazzCash
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>
              </select>

              <label>
                Transaction ID
              </label>

              <input
                type="text"
                value={transactionId}
                onChange={(event) =>
                  setTransactionId(
                    event.target.value
                  )
                }
                placeholder="Enter transaction/reference ID"
                required
              />

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : "Submit Payment"}
              </button>

            </form>

            {message && (
              <div className="success-message">
                {message}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </section>

        </div>

        <section className="payment-card history-card">
          <h2>Payment History</h2>

          {loadingPayments ? (
            <p>Loading...</p>
          ) : payments.length === 0 ? (
            <p className="muted">
              No payment requests yet.
            </p>
          ) : (
            <div className="payment-history">

              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="payment-row"
                >
                  <div>
                    <strong>
                      Rs {payment.amount}
                    </strong>

                    <span>
                      {payment.method}
                    </span>

                    <small>
                      Transaction:{" "}
                      {payment.transaction_id}
                    </small>
                  </div>

                  <span
                    className={`status ${payment.status}`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}

            </div>
          )}
        </section>

      </div>
    </main>
  );
}
