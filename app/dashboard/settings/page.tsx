"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
const [theme, setTheme] = useState("dark");

useEffect(() => {
const savedTheme =
localStorage.getItem("hzx-theme") ||
"dark";

setTheme(savedTheme);

document.documentElement.dataset.theme =
  savedTheme;

}, []);

function changeTheme(value: string) {
setTheme(value);

localStorage.setItem(
  "hzx-theme",
  value
);

document.documentElement.dataset.theme =
  value;

}

return ( <main className="settings-page"> <div className="settings-container">

    <Link
      href="/dashboard"
      className="profile-back"
    >
      ← Dashboard
    </Link>

    <h1>Settings</h1>

    <p className="settings-subtitle">
      Customize your HZX AI experience.
    </p>

    <section className="settings-card">
      <div>
        <h2>Appearance</h2>

        <p>
          Choose how HZX AI should look.
        </p>
      </div>

      <div className="theme-options">

        <button
          className={
            theme === "dark"
              ? "theme-option active"
              : "theme-option"
          }
          onClick={() =>
            changeTheme("dark")
          }
        >
          <span>🌙</span>
          <strong>Dark</strong>
          <small>
            Modern dark interface
          </small>
        </button>

        <button
          className={
            theme === "light"
              ? "theme-option active"
              : "theme-option"
          }
          onClick={() =>
            changeTheme("light")
          }
        >
          <span>☀️</span>
          <strong>Light</strong>
          <small>
            Clean light interface
          </small>
        </button>

      </div>
    </section>

    <section className="settings-card">
      <div>
        <h2>Account</h2>

        <p>
          Manage your account information.
        </p>
      </div>

      <Link
        href="/dashboard/profile"
        className="dashboard-button"
      >
        Open Profile →
      </Link>
    </section>

  </div>
</main>

);
}
