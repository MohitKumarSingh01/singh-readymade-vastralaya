"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Mode = "login" | "signup";

type Address = {
  id: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string;
    slug: string;
  };
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items: OrderItem[];
};

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  addresses: Address[];
  orders: Order[];
};

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>("login");

  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  // Check whether customer is already logged in
  useEffect(() => {
    loadCustomer();
  }, []);

  async function loadCustomer() {
    try {
      setCheckingSession(true);

      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("LOAD CUSTOMER ERROR:", error);
      setUser(null);
    } finally {
      setCheckingSession(false);
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage("");
    setSuccess(false);
    setPassword("");
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const endpoint =
        mode === "login"
          ? "/api/auth/login"
          : "/api/auth/signup";

      const body =
        mode === "login"
          ? {
              email,
              password,
            }
          : {
              name,
              email,
              phone,
              password,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data?.message ||
            "Something went wrong. Please try again."
        );
        return;
      }

      if (mode === "signup") {
        setSuccess(true);
        setMessage(
          "Account created successfully. Please login."
        );

        setMode("login");
        setName("");
        setPhone("");
        setPassword("");
        return;
      }

      // Login successful
      setSuccess(true);
      setMessage("Login successful.");

      setPassword("");

      // Load the authenticated customer
      await loadCustomer();
    } catch (error) {
      console.error("ACCOUNT ERROR:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      setLogoutLoading(true);

      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setUser(null);
        setSelectedOrder(null);
        setMessage("");
        setSuccess(false);
        setMode("login");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    } finally {
      setLogoutLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="account-page">
        <div className="account-loading">
          <div className="loading-spinner" />
          <p>Loading your account...</p>
        </div>

        <style jsx>{`
          .account-page {
            min-height: calc(100vh - 175px);
            padding: 80px 20px;
            background: linear-gradient(
              135deg,
              #f7f9fb 0%,
              #eef3f6 100%
            );
          }

          .account-loading {
            min-height: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: #61738b;
          }

          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #dfe5eb;
            border-top-color: #d4af37;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  // Logged-in customer dashboard
  if (user) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <p className="eyebrow">
                SINGH READYMADE VASTRALAYA
              </p>

              <h1>My Account</h1>

              <p className="welcome-text">
                Welcome back,{" "}
                <strong>{user.name}</strong>
              </p>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>

          {/* Profile + Address */}
          <div className="dashboard-grid">
            {/* Profile */}
            <section className="dashboard-card">
              <div className="card-heading">
                <div>
                  <span className="card-label">
                    ACCOUNT
                  </span>
                  <h2>Profile</h2>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-row">
                  <span>Name</span>
                  <strong>{user.name}</strong>
                </div>

                <div className="detail-row">
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>

                <div className="detail-row">
                  <span>Mobile</span>
                  <strong>{user.phone}</strong>
                </div>
              </div>
            </section>

            {/* Saved Address */}
            <section className="dashboard-card">
              <div className="card-heading">
                <div>
                  <span className="card-label">
                    DELIVERY
                  </span>
                  <h2>Saved Address</h2>
                </div>
              </div>

              {user.addresses &&
              user.addresses.length > 0 ? (
                <div className="address-list">
                  {user.addresses.map((address) => (
                    <div
                      className="address-box"
                      key={address.id}
                    >
                      <strong>
                        {address.address}
                      </strong>

                      <span>
                        {address.city},{" "}
                        {address.state}
                      </span>

                      <span>
                        {address.pincode}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-address">
                  <p>No saved address yet.</p>

                  <span>
                    Your saved delivery addresses
                    will appear here.
                  </span>
                </div>
              )}
            </section>
          </div>

          {/* Orders */}
          <section className="orders-section">
            <div className="orders-heading">
              <div>
                <span className="card-label">
                  ORDER HISTORY
                </span>

                <h2>My Orders</h2>
              </div>

              <span className="order-count">
                {user.orders.length}{" "}
                {user.orders.length === 1
                  ? "Order"
                  : "Orders"}
              </span>
            </div>

            {user.orders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-icon">
                  🛍
                </div>

                <h3>No orders yet</h3>

                <p>
                  Your orders will appear here after
                  you make a purchase.
                </p>

                <Link
                  href="/"
                  className="shop-button"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {user.orders.map((order) => (
                  <div
                    className="order-card"
                    key={order.id}
                  >
                    <div className="order-top">
                      <div>
                        <span className="order-label">
                          ORDER NUMBER
                        </span>

                        <h3>
                          {order.orderNumber}
                        </h3>

                        <p>
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <div className="order-total">
                        <span>Total</span>
                        <strong>
                          ₹{order.total.toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    <div className="order-products">
                      {order.items
                        .slice(0, 3)
                        .map((item) => (
                          <div
                            className="order-product"
                            key={item.id}
                          >
                            <div className="product-image">
                              {item.product.image ? (
                                <img
                                  src={
                                    item.product
                                      .image
                                  }
                                  alt={
                                    item.product
                                      .name
                                  }
                                />
                              ) : (
                                <span>
                                  No Image
                                </span>
                              )}
                            </div>

                            <div className="product-info">
                              <strong>
                                {item.product.name}
                              </strong>

                              <span>
                                Qty:{" "}
                                {item.quantity}
                              </span>

                              <span>
                                ₹
                                {item.price.toFixed(
                                  2
                                )}
                              </span>
                            </div>
                          </div>
                        ))}

                      {order.items.length > 3 && (
                        <div className="more-products">
                          +
                          {order.items.length - 3}{" "}
                          more
                        </div>
                      )}
                    </div>

                    <div className="order-bottom">
                      <div className="status-group">
                        <div>
                          <span>
                            Payment
                          </span>

                          <StatusBadge
                            type="payment"
                            status={
                              order.paymentStatus
                            }
                          />
                        </div>

                        <div>
                          <span>
                            Order Status
                          </span>

                          <StatusBadge
                            type="order"
                            status={
                              order.orderStatus
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        className="view-order-button"
                        onClick={() =>
                          setSelectedOrder(
                            order
                          )
                        }
                      >
                        View Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedOrder(null)
            }
          >
            <div
              className="order-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <span className="order-label">
                    ORDER DETAILS
                  </span>

                  <h2>
                    {selectedOrder.orderNumber}
                  </h2>

                  <p>
                    {formatDate(
                      selectedOrder.createdAt
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  className="close-button"
                  onClick={() =>
                    setSelectedOrder(null)
                  }
                >
                  ×
                </button>
              </div>

              <div className="modal-status">
                <div>
                  <span>Payment</span>

                  <StatusBadge
                    type="payment"
                    status={
                      selectedOrder.paymentStatus
                    }
                  />
                </div>

                <div>
                  <span>Order</span>

                  <StatusBadge
                    type="order"
                    status={
                      selectedOrder.orderStatus
                    }
                  />
                </div>
              </div>

              <div className="modal-section">
                <h3>Delivery Address</h3>

                <p>
                  {selectedOrder.address}
                  <br />
                  {selectedOrder.city},{" "}
                  {selectedOrder.state}
                  <br />
                  {selectedOrder.pincode}
                </p>
              </div>

              <div className="modal-section">
                <h3>Customer</h3>

                <p>
                  {selectedOrder.customerName}
                  <br />
                  {selectedOrder.customerPhone}
                  <br />
                  {selectedOrder.customerEmail}
                </p>
              </div>

              <div className="modal-section">
                <h3>Products</h3>

                <div className="modal-products">
                  {selectedOrder.items.map(
                    (item) => (
                      <div
                        className="modal-product"
                        key={item.id}
                      >
                        <div className="modal-product-image">
                          {item.product.image ? (
                            <img
                              src={
                                item.product.image
                              }
                              alt={
                                item.product.name
                              }
                            />
                          ) : (
                            <span>
                              No Image
                            </span>
                          )}
                        </div>

                        <div className="modal-product-info">
                          <strong>
                            {item.product.name}
                          </strong>

                          <span>
                            Quantity:{" "}
                            {item.quantity}
                          </span>

                          <span>
                            ₹
                            {item.price.toFixed(
                              2
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="price-summary">
                <div>
                  <span>Subtotal</span>
                  <strong>
                    ₹
                    {selectedOrder.subtotal.toFixed(
                      2
                    )}
                  </strong>
                </div>

                <div>
                  <span>Delivery</span>
                  <strong>
                    {selectedOrder.deliveryCharge ===
                    0
                      ? "FREE"
                      : `₹${selectedOrder.deliveryCharge.toFixed(
                          2
                        )}`}
                  </strong>
                </div>

                <div className="grand-total">
                  <span>Total</span>
                  <strong>
                    ₹
                    {selectedOrder.total.toFixed(
                      2
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{dashboardStyles}</style>
      </main>
    );
  }

  // Login / Signup page
  return (
    <main className="account-page">
      <div className="account-container">
        {/* Left Side */}
        <div className="account-intro">
          <p className="eyebrow">
            SINGH READYMADE VASTRALAYA
          </p>

          <h1>
            Your Style,
            <br />
            Your Account.
          </h1>

          <p className="intro-text">
            Create your account to manage your
            profile, save addresses and easily track
            your orders.
          </p>

          <div className="benefits">
            {[
              "Manage your personal information",
              "Save your delivery address",
              "View your complete order history",
              "Track payment and order status",
            ].map((item) => (
              <div
                className="benefit"
                key={item}
              >
                <span />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Account Card */}
        <div className="account-card">
          <div className="tabs">
            <button
              type="button"
              onClick={() =>
                switchMode("login")
              }
              className={
                mode === "login"
                  ? "tab active"
                  : "tab"
              }
            >
              Login
            </button>

            <button
              type="button"
              onClick={() =>
                switchMode("signup")
              }
              className={
                mode === "signup"
                  ? "tab active"
                  : "tab"
              }
            >
              Create Account
            </button>
          </div>

          <h2>
            {mode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>

          <p className="form-subtitle">
            {mode === "login"
              ? "Login to access your account and orders."
              : "Join Singh Readymade Vastralaya today."}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <label>Full Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your name"
                  required
                />

                <label>Mobile Number</label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                />
              </>
            )}

            <label>Email Address</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
            />

            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              minLength={6}
              required
            />

            {message && (
              <div
                className={
                  success
                    ? "message success"
                    : "message error"
                }
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          <Link
            href="/"
            className="continue-shopping"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      <style jsx>{accountStyles}</style>
    </main>
  );
}

function StatusBadge({
  type,
  status,
}: {
  type: "payment" | "order";
  status: string;
}) {
  const normalized = status.toUpperCase();

  let className = "status-badge";

  if (
    normalized === "PAID" ||
    normalized === "DELIVERED" ||
    normalized === "COMPLETED"
  ) {
    className += " status-success";
  } else if (
    normalized === "FAILED" ||
    normalized === "CANCELLED"
  ) {
    className += " status-danger";
  } else {
    className += " status-pending";
  }

  return (
    <span className={className}>
      {formatStatus(status)}
    </span>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function formatDate(date: string) {
  try {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return date;
  }
}

const accountStyles = `
  .account-page {
    min-height: calc(100vh - 175px);
    padding: 70px 20px;
    background: linear-gradient(
      135deg,
      #f7f9fb 0%,
      #eef3f6 100%
    );
  }

  .account-container {
    max-width: 1050px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 50px;
    align-items: center;
  }

  .eyebrow {
    margin: 0 0 14px;
    color: #d4af37;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 4px;
  }

  .account-intro h1 {
    margin: 0 0 20px;
    color: #0b2342;
    font-size: 54px;
    line-height: 1.05;
    font-weight: 700;
  }

  .intro-text {
    max-width: 500px;
    color: #61738b;
    font-size: 17px;
    line-height: 1.7;
    margin-bottom: 30px;
  }

  .benefits {
    display: grid;
    gap: 14px;
    max-width: 430px;
  }

  .benefit {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #243b59;
    font-size: 15px;
  }

  .benefit span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #d4af37;
    flex-shrink: 0;
  }

  .account-card {
    background: #ffffff;
    border-radius: 22px;
    padding: 38px;
    box-shadow:
      0 20px 60px rgba(11, 35, 66, 0.12);
    border: 1px solid rgba(11, 35, 66, 0.08);
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 30px;
  }

  .tab {
    flex: 1;
    padding: 14px;
    border: none;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: #7b8797;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }

  .tab.active {
    border-bottom-color: #d4af37;
    color: #0b2342;
  }

  .account-card h2 {
    margin: 0 0 8px;
    color: #0b2342;
    font-size: 28px;
  }

  .form-subtitle {
    margin: 0 0 25px;
    color: #7b8797;
    font-size: 14px;
  }

  .account-card form label {
    display: block;
    margin-bottom: 7px;
    color: #243b59;
    font-size: 13px;
    font-weight: 700;
  }

  .account-card form input {
    width: 100%;
    box-sizing: border-box;
    padding: 13px 14px;
    margin-bottom: 18px;
    border: 1px solid #d7dde5;
    border-radius: 9px;
    outline: none;
    background: #ffffff;
    color: #172b4d;
    font-size: 14px;
  }

  .account-card form input:focus {
    border-color: #d4af37;
  }

  .message {
    margin-bottom: 18px;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 14px;
  }

  .message.success {
    background: #ecfdf3;
    color: #166534;
  }

  .message.error {
    background: #fff1f2;
    color: #b42318;
  }

  .submit-button {
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 10px;
    background: #d4af37;
    color: #0b2342;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
  }

  .submit-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .continue-shopping {
    display: block;
    margin-top: 22px;
    text-align: center;
    color: #0b2342;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
  }

  @media (max-width: 800px) {
    .account-container {
      grid-template-columns: 1fr;
      gap: 35px;
    }

    .account-intro h1 {
      font-size: 42px;
    }
  }

  @media (max-width: 500px) {
    .account-page {
      padding: 40px 15px;
    }

    .account-card {
      padding: 25px;
    }

    .account-intro h1 {
      font-size: 36px;
    }
  }
`;

const dashboardStyles = `
  .dashboard-page {
    min-height: calc(100vh - 175px);
    padding: 55px 20px 80px;
    background: #f6f8fa;
  }

  .dashboard-container {
    max-width: 1150px;
    margin: 0 auto;
  }

  .dashboard-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 35px;
  }

  .dashboard-header .eyebrow {
    margin-bottom: 8px;
    color: #d4af37;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 3px;
  }

  .dashboard-header h1 {
    margin: 0 0 8px;
    color: #0b2342;
    font-size: 42px;
  }

  .welcome-text {
    margin: 0;
    color: #61738b;
  }

  .logout-button {
    padding: 11px 20px;
    border: 1px solid #d9dee5;
    border-radius: 9px;
    background: #ffffff;
    color: #0b2342;
    font-weight: 700;
    cursor: pointer;
  }

  .logout-button:hover {
    border-color: #d4af37;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
    margin-bottom: 35px;
  }

  .dashboard-card {
    background: #ffffff;
    border: 1px solid #e5e9ee;
    border-radius: 18px;
    padding: 25px;
    box-shadow: 0 10px 30px rgba(11, 35, 66, 0.05);
  }

  .card-label,
  .order-label {
    color: #9aa6b5;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
  }

  .card-heading h2,
  .orders-heading h2 {
    margin: 5px 0 0;
    color: #0b2342;
    font-size: 24px;
  }

  .profile-details {
    margin-top: 22px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 1px solid #edf0f3;
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-row span {
    color: #7b8797;
    font-size: 14px;
  }

  .detail-row strong {
    color: #243b59;
    font-size: 14px;
    text-align: right;
    word-break: break-word;
  }

  .address-list {
    margin-top: 22px;
  }

  .address-box {
    display: grid;
    gap: 5px;
    padding: 17px;
    border: 1px solid #e5e9ee;
    border-radius: 12px;
    color: #243b59;
  }

  .address-box strong {
    font-size: 14px;
  }

  .address-box span {
    color: #61738b;
    font-size: 13px;
  }

  .empty-address {
    margin-top: 22px;
    padding: 22px;
    border: 1px dashed #d5dbe2;
    border-radius: 12px;
    text-align: center;
  }

  .empty-address p {
    margin: 0 0 6px;
    color: #243b59;
    font-weight: 700;
  }

  .empty-address span {
    color: #8a96a5;
    font-size: 13px;
  }

  .orders-section {
    background: #ffffff;
    border: 1px solid #e5e9ee;
    border-radius: 18px;
    padding: 28px;
    box-shadow: 0 10px 30px rgba(11, 35, 66, 0.05);
  }

  .orders-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  .order-count {
    padding: 8px 12px;
    border-radius: 20px;
    background: #f2f5f7;
    color: #61738b;
    font-size: 12px;
    font-weight: 700;
  }

  .orders-list {
    display: grid;
    gap: 18px;
  }

  .order-card {
    border: 1px solid #e4e8ed;
    border-radius: 15px;
    overflow: hidden;
  }

  .order-top {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 20px;
    background: #fafbfc;
    border-bottom: 1px solid #edf0f3;
  }

  .order-top h3 {
    margin: 5px 0 4px;
    color: #0b2342;
    font-size: 17px;
  }

  .order-top p {
    margin: 0;
    color: #8a96a5;
    font-size: 12px;
  }

  .order-total {
    text-align: right;
  }

  .order-total span {
    display: block;
    color: #8a96a5;
    font-size: 12px;
    margin-bottom: 4px;
  }

  .order-total strong {
    color: #0b2342;
    font-size: 18px;
  }

  .order-products {
    display: flex;
    gap: 14px;
    padding: 18px 20px;
    overflow-x: auto;
  }

  .order-product {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 220px;
  }

  .product-image {
    width: 58px;
    height: 68px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 8px;
    background: #f0f2f4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-image span {
    color: #9aa6b5;
    font-size: 9px;
    text-align: center;
  }

  .product-info {
    display: grid;
    gap: 3px;
  }

  .product-info strong {
    max-width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #243b59;
    font-size: 13px;
  }

  .product-info span {
    color: #8a96a5;
    font-size: 11px;
  }

  .more-products {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 90px;
    color: #61738b;
    font-size: 12px;
    font-weight: 700;
  }

  .order-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 16px 20px;
    border-top: 1px solid #edf0f3;
  }

  .status-group {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
  }

  .status-group > div,
  .modal-status > div {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-group > div > span:first-child,
  .modal-status > div > span:first-child {
    color: #8a96a5;
    font-size: 11px;
  }

  .status-badge {
    display: inline-flex;
    padding: 5px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
  }

  .status-success {
    background: #ecfdf3;
    color: #166534;
  }

  .status-pending {
    background: #fff8e6;
    color: #946200;
  }

  .status-danger {
    background: #fff1f2;
    color: #b42318;
  }

  .view-order-button {
    padding: 10px 16px;
    border: 1px solid #d4af37;
    border-radius: 8px;
    background: #ffffff;
    color: #0b2342;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }

  .view-order-button:hover {
    background: #d4af37;
  }

  .empty-orders {
    padding: 55px 20px;
    text-align: center;
  }

  .empty-icon {
    margin-bottom: 15px;
    font-size: 38px;
  }

  .empty-orders h3 {
    margin: 0 0 7px;
    color: #0b2342;
  }

  .empty-orders p {
    margin: 0 0 20px;
    color: #7b8797;
    font-size: 14px;
  }

  .shop-button {
    display: inline-block;
    padding: 12px 20px;
    border-radius: 9px;
    background: #d4af37;
    color: #0b2342;
    text-decoration: none;
    font-size: 13px;
    font-weight: 800;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(5, 15, 28, 0.65);
  }

  .order-modal {
    width: 100%;
    max-width: 650px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 18px;
    background: #ffffff;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 25px;
    border-bottom: 1px solid #edf0f3;
  }

  .modal-header h2 {
    margin: 6px 0 4px;
    color: #0b2342;
    font-size: 22px;
  }

  .modal-header p {
    margin: 0;
    color: #8a96a5;
    font-size: 12px;
  }

  .close-button {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: #f1f3f5;
    color: #243b59;
    font-size: 25px;
    line-height: 1;
    cursor: pointer;
  }

  .modal-status {
    display: flex;
    gap: 25px;
    padding: 18px 25px;
    border-bottom: 1px solid #edf0f3;
  }

  .modal-section {
    padding: 20px 25px;
    border-bottom: 1px solid #edf0f3;
  }

  .modal-section h3 {
    margin: 0 0 10px;
    color: #0b2342;
    font-size: 14px;
  }

  .modal-section p {
    margin: 0;
    color: #61738b;
    font-size: 13px;
    line-height: 1.7;
  }

  .modal-products {
    display: grid;
    gap: 12px;
  }

  .modal-product {
    display: flex;
    align-items: center;
    gap: 13px;
  }

  .modal-product-image {
    width: 55px;
    height: 65px;
    flex-shrink: 0;
    overflow: hidden;
    border-radius: 7px;
    background: #f0f2f4;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .modal-product-image span {
    color: #9aa6b5;
    font-size: 9px;
  }

  .modal-product-info {
    display: grid;
    gap: 4px;
  }

  .modal-product-info strong {
    color: #243b59;
    font-size: 13px;
  }

  .modal-product-info span {
    color: #8a96a5;
    font-size: 11px;
  }

  .price-summary {
    padding: 20px 25px 25px;
  }

  .price-summary > div {
    display: flex;
    justify-content: space-between;
    padding: 7px 0;
    color: #61738b;
    font-size: 13px;
  }

  .price-summary strong {
    color: #243b59;
  }

  .price-summary .grand-total {
    margin-top: 8px;
    padding-top: 14px;
    border-top: 1px solid #e4e8ed;
    color: #0b2342;
    font-size: 16px;
  }

  .price-summary .grand-total strong {
    color: #0b2342;
    font-size: 19px;
  }

  @media (max-width: 800px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .dashboard-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .dashboard-header h1 {
      font-size: 34px;
    }

    .order-bottom {
      align-items: flex-start;
      flex-direction: column;
    }

    .view-order-button {
      width: 100%;
    }
  }

  @media (max-width: 550px) {
    .dashboard-page {
      padding: 35px 12px 60px;
    }

    .dashboard-card,
    .orders-section {
      padding: 18px;
    }

    .order-top {
      padding: 16px;
    }

    .order-products {
      padding: 15px;
    }

    .order-bottom {
      padding: 15px;
    }

    .modal-overlay {
      padding: 10px;
    }

    .modal-header,
    .modal-section,
    .modal-status {
      padding-left: 18px;
      padding-right: 18px;
    }

    .status-group {
      gap: 10px;
    }
  }
`;
