import crypto from "crypto";

const COOKIE_NAME = "singh_admin_session";

function getUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function getPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function createToken() {
  const username = getUsername();
  const password = getPassword();

  return crypto
    .createHmac("sha256", password)
    .update(`singh-admin-session:${username}`)
    .digest("hex");
}

export function verifyAdminCredentials(
  username: string,
  password: string
) {
  return (
    username === getUsername() &&
    password === getPassword() &&
    password.length > 0
  );
}

export function createAdminSession() {
  return createToken();
}

export function isValidAdminSession(token: string | undefined) {
  if (!token) return false;

  return token === createToken();
}

export { COOKIE_NAME };
