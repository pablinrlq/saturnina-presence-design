import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";

const COOKIE_NAME = "saturnina_admin";
const LOGIN_INPUT = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  remember: z.boolean().default(false),
});

function settings() {
  return {
    email: process.env["SATURNINA_ADMIN_EMAIL"]?.trim().toLowerCase() ?? "",
    password: process.env["SATURNINA_ADMIN_PASSWORD"] ?? "",
    secret: process.env["SATURNINA_ADMIN_SESSION_SECRET"] ?? "",
  };
}

function digest(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest();
}

function secureEqual(left: string, right: string, secret: string) {
  return timingSafeEqual(digest(left, secret), digest(right, secret));
}

function expectedSession(email: string, secret: string) {
  return createHmac("sha256", secret).update(`saturnina-admin:v1:${email}`).digest("base64url");
}

function sessionIsValid() {
  const { email, password, secret } = settings();
  if (!email || !password || secret.length < 32) return false;
  const cookie = getCookie(COOKIE_NAME) ?? "";
  return secureEqual(cookie, expectedSession(email, secret), secret);
}

export const loginWithEnvAdmin = createServerFn({ method: "POST" })
  .validator((input: unknown) => LOGIN_INPUT.parse(input))
  .handler(async ({ data }) => {
    const { email, password, secret } = settings();
    if (!email || !password || secret.length < 32) return { ok: false as const };

    const validEmail = secureEqual(data.email.trim().toLowerCase(), email, secret);
    const validPassword = secureEqual(data.password, password, secret);
    if (!validEmail || !validPassword) return { ok: false as const };

    setCookie(COOKIE_NAME, expectedSession(email, secret), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      ...(data.remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });

    return { ok: true as const };
  });

export const getEnvAdminSession = createServerFn({ method: "GET" }).handler(async () => ({
  authenticated: sessionIsValid(),
}));

export const logoutEnvAdmin = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { ok: true as const };
});
