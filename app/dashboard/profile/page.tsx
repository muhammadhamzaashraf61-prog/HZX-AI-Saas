"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
id: number;
name: string;
email: string;
plan: string;
isAdmin: boolean;
createdAt: string;
};

export default function ProfilePage() {
const [profile, setProfile] =
useState<Profile | null>(null);

const [name, setName] = useState("");

const [currentPassword, setCurrentPassword] =
useState("");

const [newPassword, setNewPassword] =
useState("");

const [loading, setLoading] = useState(true);
const [savingName, setSavingName] =
useState(false);
const [changingPassword, setChangingPassword] =
useState(false);

const [message, setMessage] = useState("");
const [error, setError] = useState("");

useEffect(() => {
loadProfile();
}, []);

async function loadProfile() {
try {
const response = await fetch(
"/api/profile"
);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load profile"
    );
  }

  setProfile(data.user);
  setName(data.user.name);
} catch (error) {
  console.error(error);
  setError("Failed to load profile.");
} finally {
  setLoading(false);
}

}

async function updateName(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault();

setMessage("");
setError("");
setSavingName(true);

try {
  const response = await fetch(
    "/api/profile",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(
      data.message ||
        "Failed to update name."
    );
    return;
  }

  setProfile(data.user);
  setName(data.user.name);

  setMessage(
    "Profile updated successfully."
  );
} catch (error) {
  console.error(error);
  setError("Something went wrong.");
} finally {
  setSavingName(false);
}

}

async function changePassword(
event: FormEvent<HTMLFormElement>
) {
event.preventDefault();

setMessage("");
setError("");

if (!currentPassword || !newPassword) {
  setError(
    "Please enter both passwords."
  );
  return;
}

if (newPassword.length < 6) {
  setError(
    "New password must be at least 6 characters."
  );
  return;
}

setChangingPassword(true);

try {
  const response = await fetch(
    "/api/profile",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    setError(
      data.message ||
        "Failed to change password."
    );
    return;
  }

  setCurrentPassword("");
  setNewPassword("");

  setMessage(
    "Password changed successfully."
  );
} catch (error) {
  console.error(error);
  setError("Something went wrong.");
} finally {
  setChangingPassword(false);
}

}

if (loading) {
return ( <main className="profile-page"> <div className="profile-container"> <p className="profile-muted">
Loading profile... </p> </div> </main>
);
}

if (!profile) {
return ( <main className="profile-page"> <div className="profile-container"> <div className="profile-card"> <h2>Profile Not Available</h2> <p className="profile-muted">
Please login again. </p>

        <Link
          href="/login"
          className="profile-button"
        >
          Go to Login →
        </Link>
      </div>
    </div>
  </main>
);

}

return ( <main className="profile-page"> <div className="profile-container">

    {/* HEADER */}

    <header className="profile-header">
      <div>
        <Link
          href="/dashboard"
          className="profile-back"
        >
          ← Dashboard
        </Link>

        <h1>Profile</h1>

        <p>
          Manage your HZX AI account
          information and security.
        </p>
      </div>

      <div className="profile-avatar">
        {profile.name
          .charAt(0)
          .toUpperCase()}
      </div>
    </header>

    {/* MESSAGE */}

    {message && (
      <div className="profile-success">
        {message}
      </div>
    )}

    {error && (
      <div className="profile-error">
        {error}
      </div>
    )}

    {/* ACCOUNT INFO */}

    <section className="profile-card">
      <div className="profile-card-header">
        <div>
          <h2>Account Information</h2>

          <p>
            Your basic HZX AI account
            information.
          </p>
        </div>

        <span
          className={
            profile.plan === "pro"
              ? "profile-plan pro"
              : "profile-plan"
          }
        >
          {profile.isAdmin
            ? "Admin"
            : profile.plan}
        </span>
      </div>

      <div className="profile-info-grid">

        <div className="profile-info">
          <span>Name</span>
          <strong>{profile.name}</strong>
        </div>

        <div className="profile-info">
          <span>Email</span>
          <strong>{profile.email}</strong>
        </div>

        <div className="profile-info">
          <span>Plan</span>
          <strong>
            {profile.isAdmin
              ? "Admin"
              : profile.plan}
          </strong>
        </div>

        <div className="profile-info">
          <span>Member Since</span>
          <strong>
            {new Date(
              profile.createdAt
            ).toLocaleDateString()}
          </strong>
        </div>

      </div>
    </section>

    {/* UPDATE NAME */}

    <section className="profile-card">
      <div className="profile-card-header">
        <div>
          <h2>Edit Profile</h2>

          <p>
            Update your display name.
          </p>
        </div>
      </div>

      <form
        onSubmit={updateName}
        className="profile-form"
      >
        <label htmlFor="name">
          Full Name
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Enter your name"
          required
          maxLength={100}
        />

        <button
          type="submit"
          className="profile-button"
          disabled={savingName}
        >
          {savingName
            ? "Saving..."
            : "Save Changes"}
        </button>
      </form>
    </section>

    {/* PASSWORD */}

    <section className="profile-card">
      <div className="profile-card-header">
        <div>
          <h2>Security</h2>

          <p>
            Change your account password.
          </p>
        </div>
      </div>

      <form
        onSubmit={changePassword}
        className="profile-form"
      >
        <label htmlFor="currentPassword">
          Current Password
        </label>

        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(event) =>
            setCurrentPassword(
              event.target.value
            )
          }
          placeholder="Enter current password"
          required
        />

        <label htmlFor="newPassword">
          New Password
        </label>

        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) =>
            setNewPassword(
              event.target.value
            )
          }
          placeholder="Enter new password"
          minLength={6}
          required
        />

        <button
          type="submit"
          className="profile-button"
          disabled={changingPassword}
        >
          {changingPassword
            ? "Changing..."
            : "Change Password"}
        </button>
      </form>
    </section>

    {/* FOOTER */}

    <div className="profile-footer">
      <Link href="/dashboard">
        ← Back to Dashboard
      </Link>
    </div>

  </div>
</main>

);
}
