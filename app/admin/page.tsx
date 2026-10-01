"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Admin = {
id: number;
email: string;
role: string;
};

type User = {
id: number;
name: string;
email: string;
plan: string;
is_admin: boolean;
created_at: string;
usage: number;
};

type Payment = {
id: number;
amount: number;
method: string;
transaction_id: string;
status: string;
created_at: string;
name: string;
email: string;
};

const menuItems = [
{ id: "overview", icon: "⌂", label: "Overview" },
{ id: "users", icon: "♙", label: "Users" },
{ id: "payments", icon: "$", label: "Payments" },
{ id: "ai", icon: "✦", label: "AI Usage" },
{ id: "plans", icon: "◇", label: "Plans" },
{ id: "analytics", icon: "▥", label: "Analytics" },
{ id: "settings", icon: "⚙", label: "Settings" },
];

export default function AdminPage() {
const router = useRouter();

const [admin, setAdmin] = useState<Admin | null>(null);
const [loading, setLoading] = useState(true);
const [active, setActive] = useState("overview");

const [users, setUsers] = useState<User[]>([]);
const [payments, setPayments] = useState<Payment[]>([]);

const [editingEmail, setEditingEmail] = useState(false);
const [newEmail, setNewEmail] = useState("");

const [editingName, setEditingName] = useState(false);
const [newName, setNewName] = useState("");

const [savingSettings, setSavingSettings] = useState(false);

const [processingPayment, setProcessingPayment] = useState<number | null>(
null
);

// ================= PASSWORD STATES =================

const [showPasswordForm, setShowPasswordForm] = useState(false);
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordLoading, setPasswordLoading] = useState(false);

// ==================================================

useEffect(() => {
checkAdmin();
}, []);

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

  await Promise.all([loadUsers(), loadPayments()]);
} catch (error) {
  console.error("ADMIN CHECK ERROR:", error);
  router.replace("/admin/login");
} finally {
  setLoading(false);
}

}

async function loadUsers() {
try {
const res = await fetch("/api/admin/users", {
credentials: "include",
});

  const data = await res.json();

  if (res.ok && Array.isArray(data.users)) {
    setUsers(data.users);
  }
} catch (error) {
  console.error("USERS ERROR:", error);
}

}

async function loadPayments() {
try {
const res = await fetch("/api/admin/payments", {
credentials: "include",
});

  const data = await res.json();

  if (res.ok && Array.isArray(data.payments)) {
    setPayments(data.payments);
  }
} catch (error) {
  console.error("PAYMENTS ERROR:", error);
}


}

async function deleteUser(userId: number) {
if (!admin) return;


const confirmed = window.confirm(
  "Are you sure you want to delete this user?"
);

if (!confirmed) return;

try {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to delete user");
    return;
  }

  await loadUsers();
} catch (error) {
  console.error("DELETE USER ERROR:", error);
  alert("Something went wrong");
}


}

async function updatePayment(
paymentId: number,
status: "approved" | "rejected"
) {
const action = status === "approved" ? "approve" : "reject";


const confirmed = window.confirm(
  `Are you sure you want to ${action} this payment?`
);

if (!confirmed) return;

try {
  setProcessingPayment(paymentId);

  const res = await fetch(`/api/admin/payments/${paymentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      status,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || `Failed to ${action} payment`);
    return;
  }

  await Promise.all([loadPayments(), loadUsers()]);

  alert(
    status === "approved"
      ? "Payment approved. User is now on Pro."
      : "Payment rejected."
  );
} catch (error) {
  console.error("PAYMENT UPDATE ERROR:", error);
  alert("Something went wrong");
} finally {
  setProcessingPayment(null);
}


}

async function saveEmail() {
if (!admin || !newEmail.trim()) return;


setSavingSettings(true);

try {
  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email: newEmail.trim(),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to update email");
    return;
  }

  setAdmin({
    ...admin,
    email: newEmail.trim(),
  });

  setEditingEmail(false);

  alert("Admin email updated successfully.");
} catch (error) {
  console.error("UPDATE EMAIL ERROR:", error);
  alert("Something went wrong");
} finally {
  setSavingSettings(false);
}


}

async function saveName() {
if (!admin || !newName.trim()) return;


setSavingSettings(true);

try {
  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      name: newName.trim(),
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to update name");
    return;
  }

  setEditingName(false);

  alert("Admin name updated successfully.");
} catch (error) {
  console.error("UPDATE NAME ERROR:", error);
  alert("Something went wrong");
} finally {
  setSavingSettings(false);
}


}

// ================= CHANGE PASSWORD =================

async function changeAdminPassword() {
if (!newPassword || !confirmPassword) {
alert("Please enter both password fields.");
return;
}


if (newPassword.length < 6) {
  alert("Password must be at least 6 characters.");
  return;
}

if (newPassword !== confirmPassword) {
  alert("Passwords do not match.");
  return;
}

try {
  setPasswordLoading(true);

  const res = await fetch("/api/admin/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      password: newPassword,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to change password.");
    return;
  }

  alert("Admin password changed successfully.");

  setNewPassword("");
  setConfirmPassword("");
  setShowPasswordForm(false);
} catch (error) {
  console.error("CHANGE PASSWORD ERROR:", error);
  alert("Something went wrong.");
} finally {
  setPasswordLoading(false);
}


}

// ==================================================

async function logout() {
await fetch("/api/admin/logout", {
method: "POST",
credentials: "include",
});


router.replace("/admin/login");


}

if (loading) {
return ( <main className="admin-loading"> <div>Checking admin access...</div> </main>
);
}

if (!admin) return null;

const totalUsers = users.length;

const totalPayments = payments.length;

const totalRevenue = payments
.filter(
(payment) => payment.status?.toLowerCase() === "approved"
)
.reduce(
(sum, payment) => sum + Number(payment.amount || 0),
0
);

const totalUsage = users.reduce(
(sum, user) => sum + Number(user.usage || 0),
0
);

const proUsers = users.filter(
(user) => user.plan?.toLowerCase() === "pro"
).length;

const freeUsers = users.filter(
(user) =>
!user.plan || user.plan.toLowerCase() === "free"
).length;

const pendingPayments = payments.filter(
(payment) => payment.status?.toLowerCase() === "pending"
).length;

const approvedPayments = payments.filter(
(payment) => payment.status?.toLowerCase() === "approved"
).length;

return ( <main className="admin-shell">


  {/* SIDEBAR */}

  <aside className="admin-sidebar">

    <div className="admin-brand">
      <div className="admin-brand-icon">
        ✦
      </div>

      <div>
        <strong>HZX AI</strong>
        <span>ADMIN PANEL</span>
      </div>
    </div>

    <nav className="admin-nav">

      {menuItems.map((item) => (
        <button
          key={item.id}
          className={
            active === item.id
              ? "active"
              : ""
          }
          onClick={() =>
            setActive(item.id)
          }
        >
          <span>{item.icon}</span>
          {item.label}
        </button>
      ))}

    </nav>

    <button
      className="admin-logout"
      onClick={logout}
    >
      <span>↪</span>
      Logout
    </button>

  </aside>

  {/* MAIN */}

  <section className="admin-main">

    <header className="admin-topbar">

      <div>
        <span className="admin-eyebrow">
          ADMINISTRATION
        </span>

        <h1>
          {
            menuItems.find(
              (item) =>
                item.id === active
            )?.label
          }
        </h1>
      </div>

      <div className="admin-profile">

        <div className="admin-avatar">
          {admin.email
            .charAt(0)
            .toUpperCase()}
        </div>

        <div>
          <strong>
            {admin.email}
          </strong>

          <span>
            Administrator
          </span>
        </div>

      </div>

    </header>

    {/* ================= OVERVIEW ================= */}

    {active === "overview" && (

      <div className="admin-content">

        <div className="admin-welcome">

          <div>
            <span>
              WELCOME BACK
            </span>

            <h2>
              HZX AI Control Center
            </h2>

            <p>
              Manage your AI platform
              from one place.
            </p>
          </div>

          <div className="admin-welcome-icon">
            ✦
          </div>

        </div>

        <div className="admin-stats">

          <Stat
            title="Total Users"
            value={totalUsers}
            icon="♙"
          />

          <Stat
            title="Payments"
            value={totalPayments}
            icon="$"
          />

          <Stat
            title="AI Requests"
            value={totalUsage}
            icon="✦"
          />

          <Stat
            title="Revenue"
            value={`Rs. ${Number(totalRevenue).toLocaleString()}`}
            icon="↗"
          />

        </div>

        <div className="admin-grid">

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <span>
                  USER MANAGEMENT
                </span>

                <h3>
                  Recent Users
                </h3>
              </div>

              <button
                onClick={() =>
                  setActive("users")
                }
              >
                View all →
              </button>

            </div>

            {users.length === 0 ? (

              <Empty text="No users found." />

            ) : (

              <div className="admin-list">

                {users
                  .slice(0, 5)
                  .map((user) => (

                    <div
                      className="admin-list-row"
                      key={user.id}
                    >

                      <div className="mini-avatar">
                        {(user.name ||
                          user.email ||
                          "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {user.name ||
                            "Unnamed User"}
                        </strong>

                        <span>
                          {user.email}
                        </span>
                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <span>
                  PAYMENTS
                </span>

                <h3>
                  Recent Payments
                </h3>
              </div>

              <button
                onClick={() =>
                  setActive("payments")
                }
              >
                View all →
              </button>

            </div>

            {payments.length === 0 ? (

              <Empty text="No payments found." />

            ) : (

              <div className="admin-list">

                {payments
                  .slice(0, 5)
                  .map((payment) => (

                    <div
                      className="admin-list-row"
                      key={payment.id}
                    >

                      <div className="payment-icon">
                        $
                      </div>

                      <div>
                        <strong>
                          Rs. {Number(payment.amount).toLocaleString()}
                        </strong>

                        <span>
                          {payment.status}
                        </span>
                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

        </div>

      </div>

    )}

    {/* ================= USERS ================= */}

    {active === "users" && (

      <div className="admin-content">

        <div className="admin-panel full-panel">

          <div className="panel-header">

            <div>
              <span>
                USER MANAGEMENT
              </span>

              <h3>
                All Users
              </h3>
            </div>

            <button
              onClick={loadUsers}
            >
              Refresh
            </button>

          </div>

          {users.length === 0 ? (

            <Empty text="No users found." />

          ) : (

            <div className="admin-table">

              <div className="admin-table-row admin-table-header users-grid">

                <span>ID</span>
                <span>User</span>
                <span>Email</span>
                <span>Plan</span>
                <span>Usage</span>
                <span>Admin</span>
                <span>Action</span>

              </div>

              {users.map((user) => (

                <div
                  className="admin-table-row users-grid"
                  key={user.id}
                >

                  <span>
                    {user.id}
                  </span>

                  <strong>
                    {user.name ||
                      "Unnamed"}
                  </strong>

                  <span>
                    {user.email}
                  </span>

                  <span>
                    {user.plan ||
                      "Free"}
                  </span>

                  <span>
                    {user.usage ?? 0}
                  </span>

                  <span>
                    {user.is_admin
                      ? "Yes"
                      : "No"}
                  </span>

                  <button
                    className="delete-user-btn"
                    disabled={
                      user.id ===
                      admin.id
                    }
                    onClick={() =>
                      deleteUser(
                        user.id
                      )
                    }
                  >
                    {user.id === admin.id
                      ? "Current"
                      : "Delete"}
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    )}

    {/* ================= PAYMENTS ================= */}

    {active === "payments" && (

      <div className="admin-content">

        <div className="admin-panel full-panel">

          <div className="panel-header">

            <div>
              <span>
                PAYMENT MANAGEMENT
              </span>

              <h3>
                Payment Requests
              </h3>
            </div>

            <button
              onClick={loadPayments}
            >
              Refresh
            </button>

          </div>

          <div className="payment-summary">

            <div>
              <span>
                Total Requests
              </span>

              <strong>
                {totalPayments}
              </strong>
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {pendingPayments}
              </strong>
            </div>

            <div>
              <span>
                Approved Revenue
              </span>

              <strong>
                Rs. {Number(totalRevenue).toLocaleString()}
              </strong>
            </div>

          </div>

          {payments.length === 0 ? (

            <Empty text="No payment requests found." />

          ) : (

            <div className="admin-table">

              <div className="admin-table-row payments-grid admin-table-header">

                <span>ID</span>
                <span>User</span>
                <span>Amount</span>
                <span>Method</span>
                <span>Status</span>
                <span>Action</span>

              </div>

              {payments.map(
                (payment) => (

                  <div
                    className="admin-table-row payments-grid"
                    key={payment.id}
                  >

                    <div>
                      <strong>
                        #{payment.id}
                      </strong>
                    </div>

                    <div>
                      <strong>
                        {payment.name ||
                          "User"}
                      </strong>

                      <small>
                        {payment.email}
                      </small>
                    </div>

                    <strong>
                      Rs. {Number(payment.amount).toLocaleString()}
                    </strong>

                    <span>
                      {payment.method ||
                        "—"}
                    </span>

                    <span
                      className={`payment-status ${payment.status}`}
                    >
                      {payment.status}
                    </span>

                    <div className="payment-actions">

                      {payment.status?.toLowerCase() ===
                        "pending" ? (
                        <>
                          <button
                            className="approve-payment-btn"
                            disabled={
                              processingPayment ===
                              payment.id
                            }
                            onClick={() =>
                              updatePayment(
                                payment.id,
                                "approved"
                              )
                            }
                          >
                            {processingPayment ===
                            payment.id
                              ? "..."
                              : "Approve"}
                          </button>

                          <button
                            className="reject-payment-btn"
                            disabled={
                              processingPayment ===
                              payment.id
                            }
                            onClick={() =>
                              updatePayment(
                                payment.id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="payment-done">
                          {payment.status}
                        </span>
                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

    )}

    {/* ================= AI USAGE ================= */}

    {active === "ai" && (

      <div className="admin-content">

        <div className="admin-stats">

          <Stat
            title="Total Requests"
            value={totalUsage}
            icon="✦"
          />

          <Stat
            title="Active Users"
            value={
              users.filter(
                (u) =>
                  Number(u.usage) > 0
              ).length
            }
            icon="♙"
          />

          <Stat
            title="Pro Users"
            value={proUsers}
            icon="◇"
          />

          <Stat
            title="Free Users"
            value={freeUsers}
            icon="○"
          />

        </div>

        <div className="admin-panel full-panel">

          <div className="panel-header">

            <div>
              <span>
                AI MONITORING
              </span>

              <h3>
                Monthly AI Usage
              </h3>
            </div>

            <button
              onClick={loadUsers}
            >
              Refresh
            </button>

          </div>

          {users.length === 0 ? (

            <Empty text="No usage data found." />

          ) : (

            <div className="admin-table">

              <div className="admin-table-row ai-grid admin-table-header">

                <span>User</span>
                <span>Email</span>
                <span>Plan</span>
                <span>Requests</span>
                <span>Usage</span>

              </div>

              {[...users]
                .sort(
                  (a, b) =>
                    Number(b.usage) -
                    Number(a.usage)
                )
                .map((user) => (

                  <div
                    className="admin-table-row ai-grid"
                    key={user.id}
                  >

                    <strong>
                      {user.name ||
                        "Unnamed"}
                    </strong>

                    <span>
                      {user.email}
                    </span>

                    <span>
                      {user.plan ||
                        "Free"}
                    </span>

                    <strong>
                      {user.usage ?? 0}
                    </strong>

                    <div className="usage-bar">

                      <div
                        style={{
                          width: `${Math.min(
                            Number(
                              user.usage || 0
                            ) * 5,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>

    )}

    {/* ================= PLANS ================= */}

    {active === "plans" && (

      <div className="admin-content">

        <div className="admin-grid">

          <PlanCard
            name="Free"
            price="Rs. 0"
            users={freeUsers}
            description="Basic AI access"
          />

          <PlanCard
            name="Pro"
            price="Rs. 999"
            users={proUsers}
            description="Higher AI usage limits"
          />

        </div>

        <div className="admin-panel full-panel plans-note">

          <span>
            PLAN MANAGEMENT
          </span>

          <h3>
            Subscription Overview
          </h3>

          <p>
            HZX AI currently provides Free
            and Pro plans. Pro access is
            activated after payment approval.
          </p>

        </div>

      </div>

    )}

    {/* ================= ANALYTICS ================= */}

    {active === "analytics" && (

      <div className="admin-content">

        <div className="admin-stats">

          <Stat
            title="Users"
            value={totalUsers}
            icon="♙"
          />

          <Stat
            title="Pro Users"
            value={proUsers}
            icon="◇"
          />

          <Stat
            title="AI Requests"
            value={totalUsage}
            icon="✦"
          />

          <Stat
            title="Revenue"
            value={`Rs. ${Number(totalRevenue).toLocaleString()}`}
            icon="$"
          />

        </div>

        <div className="admin-grid">

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <span>
                  USERS
                </span>

                <h3>
                  Plan Distribution
                </h3>
              </div>

            </div>

            <AnalyticsRow
              label="Free"
              value={freeUsers}
              total={totalUsers}
            />

            <AnalyticsRow
              label="Pro"
              value={proUsers}
              total={totalUsers}
            />

          </div>

          <div className="admin-panel">

            <div className="panel-header">

              <div>
                <span>
                  PAYMENTS
                </span>

                <h3>
                  Payment Status
                </h3>
              </div>

            </div>

            <AnalyticsRow
              label="Pending"
              value={pendingPayments}
              total={totalPayments}
            />

            <AnalyticsRow
              label="Approved"
              value={approvedPayments}
              total={totalPayments}
            />

          </div>

        </div>

      </div>

    )}

    {/* ================= SETTINGS ================= */}

    {active === "settings" && (

      <div className="admin-content">

        <div className="admin-panel full-panel">

          <div className="panel-header">

            <div>
              <span>
                ADMINISTRATION
              </span>

              <h3>
                Admin Settings
              </h3>
            </div>

          </div>

          <div className="settings-list">

            {/* EMAIL */}

            <div className="setting-row">

              <div>
                <strong>
                  Admin Email
                </strong>

                <span>
                  Email used for admin login
                </span>
              </div>

              {!editingEmail ? (

                <div className="setting-action">

                  <b>
                    {admin.email}
                  </b>

                  <button
                    className="edit-setting-btn"
                    onClick={() => {
                      setNewEmail(
                        admin.email
                      );
                      setEditingEmail(
                        true
                      );
                    }}
                  >
                    Edit
                  </button>

                </div>

              ) : (

                <div className="setting-edit">

                  <input
                    value={newEmail}
                    onChange={(e) =>
                      setNewEmail(
                        e.target.value
                      )
                    }
                    type="email"
                  />

                  <button
                    onClick={saveEmail}
                    disabled={
                      savingSettings
                    }
                  >
                    Save
                  </button>

                  <button
                    className="cancel-setting-btn"
                    onClick={() =>
                      setEditingEmail(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                </div>

              )}

            </div>

            {/* NAME */}

            <div className="setting-row">

              <div>
                <strong>
                  Admin Name
                </strong>

                <span>
                  Display name of administrator
                </span>
              </div>

              {!editingName ? (

                <div className="setting-action">

                  <b>
                    HZX Admin
                  </b>

                  <button
                    className="edit-setting-btn"
                    onClick={() => {
                      setNewName(
                        "HZX Admin"
                      );
                      setEditingName(
                        true
                      );
                    }}
                  >
                    Edit
                  </button>

                </div>

              ) : (

                <div className="setting-edit">

                  <input
                    value={newName}
                    onChange={(e) =>
                      setNewName(
                        e.target.value
                      )
                    }
                    type="text"
                  />

                  <button
                    onClick={saveName}
                    disabled={
                      savingSettings
                    }
                  >
                    Save
                  </button>

                  <button
                    className="cancel-setting-btn"
                    onClick={() =>
                      setEditingName(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                </div>

              )}

            </div>

            {/* PASSWORD */}

            <div className="setting-row">

              <div>
                <strong>
                  Password
                </strong>

                <span>
                  Change administrator password
                </span>
              </div>

              {!showPasswordForm ? (

                <button
                  className="edit-setting-btn"
                  onClick={() =>
                    setShowPasswordForm(true)
                  }
                >
                  Change Password
                </button>

              ) : (

                <div className="setting-edit password-edit">

                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                  />

                  <button
                    onClick={
                      changeAdminPassword
                    }
                    disabled={
                      passwordLoading
                    }
                  >
                    {passwordLoading
                      ? "Saving..."
                      : "Save"}
                  </button>

                  <button
                    className="cancel-setting-btn"
                    onClick={() => {
                      setShowPasswordForm(
                        false
                      );
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    disabled={
                      passwordLoading
                    }
                  >
                    Cancel
                  </button>

                </div>

              )}

            </div>

            {/* ID */}

            <div className="setting-row">

              <div>
                <strong>
                  Account ID
                </strong>

                <span>
                  Administrator database ID
                </span>
              </div>

              <b>
                #{admin.id}
              </b>

            </div>

            {/* ROLE */}

            <div className="setting-row">

              <div>
                <strong>
                  Role
                </strong>

                <span>
                  Current access level
                </span>
              </div>

              <b>
                ADMIN
              </b>

            </div>

            {/* DATABASE */}

            <div className="setting-row">

              <div>
                <strong>
                  Database
                </strong>

                <span>
                  PostgreSQL connection
                </span>
              </div>

              <b className="online-text">
                ● Connected
              </b>

            </div>

            {/* AUTH */}

            <div className="setting-row">

              <div>
                <strong>
                  Authentication
                </strong>

                <span>
                  Admin JWT session
                </span>
              </div>

              <b className="online-text">
                ● Active
              </b>

            </div>

          </div>

        </div>

      </div>

    )}

  </section>

</main>


);
}

/* ================= COMPONENTS ================= */

function Stat({
title,
value,
icon,
}: {
title: string;
value: string | number;
icon: string;
}) {
return ( <div className="admin-stat">


  <div className="stat-icon">
    {icon}
  </div>

  <div>
    <span>{title}</span>
    <strong>{value}</strong>
  </div>

</div>


);
}

function Empty({
text,
}: {
text: string;
}) {
return ( <div className="admin-empty">
{text} </div>
);
}

function PlanCard({
name,
price,
users,
description,
}: {
name: string;
price: string;
users: number;
description: string;
}) {
return ( <div className="admin-panel plan-card">


  <div className="plan-icon">
    ◇
  </div>

  <span>
    PLAN
  </span>

  <h2>
    {name}
  </h2>

  <strong>
    {price}
  </strong>

  <p>
    {description}
  </p>

  <div className="plan-users">

    <span>
      Current Users
    </span>

    <b>
      {users}
    </b>

  </div>

</div>


);
}

function AnalyticsRow({
label,
value,
total,
}: {
label: string;
value: number;
total: number;
}) {
const percentage =
total > 0
? Math.round(
(value / total) * 100
)
: 0;

return ( <div className="analytics-row">


  <div className="analytics-row-top">

    <span>
      {label}
    </span>

    <strong>
      {value} ({percentage}%)
    </strong>

  </div>

  <div className="analytics-bar">

    <div
      style={{
        width: `${percentage}%`,
      }}
    />

  </div>

</div>

);
}
