"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Mode = "login" | "signup";

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setMessage("");
    setSuccess(false);
    setPassword("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

      setSuccess(true);
      setMessage(
        mode === "login"
          ? "Login successful."
          : "Account created successfully."
      );

      if (mode === "signup") {
        setMode("login");
        setName("");
        setPhone("");
        setPassword("");
      } else {
        setPassword("");
      }
    } catch (error) {
      console.error("ACCOUNT ERROR:", error);

      setMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 175px)",
        padding: "70px 20px",
        background:
          "linear-gradient(135deg, #f7f9fb 0%, #eef3f6 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "1050px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "50px",
          alignItems: "center",
        }}
      >
        {/* Left Side */}
        <div>
          <p
            style={{
              margin: "0 0 14px",
              color: "#d4af37",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "4px",
            }}
          >
            SINGH READYMADE VASTRALAYA
          </p>

          <h1
            style={{
              margin: "0 0 20px",
              color: "#0b2342",
              fontSize: "54px",
              lineHeight: 1.05,
              fontWeight: 700,
            }}
          >
            Your Style,
            <br />
            Your Account.
          </h1>

          <p
            style={{
              maxWidth: "500px",
              color: "#61738b",
              fontSize: "17px",
              lineHeight: 1.7,
              marginBottom: "30px",
            }}
          >
            Create your account to manage your profile,
            save addresses and easily track your orders.
          </p>

          <div
            style={{
              display: "grid",
              gap: "14px",
              maxWidth: "430px",
            }}
          >
            {[
              "Manage your personal information",
              "Save your delivery address",
              "View your complete order history",
              "Track payment and order status",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "#243b59",
                  fontSize: "15px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#d4af37",
                    flexShrink: 0,
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Account Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "22px",
            padding: "38px",
            boxShadow: "0 20px 60px rgba(11, 35, 66, 0.12)",
            border: "1px solid rgba(11, 35, 66, 0.08)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e5e7eb",
              marginBottom: "30px",
            }}
          >
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderBottom:
                  mode === "login"
                    ? "3px solid #d4af37"
                    : "3px solid transparent",
                background: "transparent",
                color:
                  mode === "login" ? "#0b2342" : "#7b8797",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode("signup")}
              style={{
                flex: 1,
                padding: "14px",
                border: "none",
                borderBottom:
                  mode === "signup"
                    ? "3px solid #d4af37"
                    : "3px solid transparent",
                background: "transparent",
                color:
                  mode === "signup" ? "#0b2342" : "#7b8797",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Create Account
            </button>
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              color: "#0b2342",
              fontSize: "28px",
            }}
          >
            {mode === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>

          <p
            style={{
              margin: "0 0 25px",
              color: "#7b8797",
              fontSize: "14px",
            }}
          >
            {mode === "login"
              ? "Login to access your account and orders."
              : "Join Singh Readymade Vastralaya today."}
          </p>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <>
                <label style={labelStyle}>
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  style={inputStyle}
                />

                <label style={labelStyle}>
                  Mobile Number
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  required
                  style={inputStyle}
                />
              </>
            )}

            <label style={labelStyle}>
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={inputStyle}
            />

            <label style={labelStyle}>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              minLength={6}
              required
              style={inputStyle}
            />

            {message && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: success
                    ? "#ecfdf3"
                    : "#fff1f2",
                  color: success
                    ? "#166534"
                    : "#b42318",
                  fontSize: "14px",
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                border: "none",
                borderRadius: "10px",
                background: loading
                  ? "#9ca3af"
                  : "#d4af37",
                color: "#0b2342",
                fontSize: "16px",
                fontWeight: 800,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          <div
            style={{
              marginTop: "22px",
              textAlign: "center",
              fontSize: "13px",
              color: "#7b8797",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#0b2342",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive fallback */}
      <style jsx>{`
        @media (max-width: 800px) {
          main > div {
            grid-template-columns: 1fr !important;
            gap: 35px !important;
          }

          h1 {
            font-size: 42px !important;
          }
        }

        @media (max-width: 500px) {
          main {
            padding: 40px 15px !important;
          }

          main > div > div:last-child {
            padding: 25px !important;
          }

          h1 {
            font-size: 36px !important;
          }
        }
      `}</style>
    </main>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#243b59",
  fontSize: "13px",
  fontWeight: 700,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px 14px",
  marginBottom: "18px",
  border: "1px solid #d7dde5",
  borderRadius: "9px",
  outline: "none",
  background: "#ffffff",
  color: "#172b4d",
  fontSize: "14px",
};
