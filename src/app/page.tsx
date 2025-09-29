"use client";
import styles from "./page.module.css";
import { createClient } from "@supabase/supabase-js";

import { useMemo, useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<
    "idle" | "auth" | "updating" | "done" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(
    () =>
      typeof window === "undefined"
        ? null
        : new URLSearchParams(window.location.search),
    []
  );
  const access_token = params?.get("access_token") ?? "";
  const refresh_token = params?.get("refresh_token") ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    try {
      setStatus("auth");
      const supabase = createClient(
        "https://tdpwhgbmrromwriykftk.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcHdoZ2JtcnJvbXdyaXlrZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDcwNzUsImV4cCI6MjA1OTA4MzA3NX0.cgil-h7vZ-HpUimweze9TGDC3guJGgJpR3nhCTdmwaU"
      );

      // Use the email link tokens to establish a session in the browser
      const { error: setErr } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (setErr) throw setErr;

      setStatus("updating");
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;

      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Failed to update password."
      );
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.formLabel}>Create New Password</label>
        <input
          className={styles.formInput}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        ></input>
        <label className={styles.formLabel}>Confirm Password</label>
        <input
          className={styles.formInput}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        ></input>
        <button
          className={styles.passwordResetButton}
          type="submit"
          disabled={status === "auth" || status === "updating"}
        >
          Update Password
        </button>
        {error ? (
          <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>
        ) : null}
        {status === "done" ? (
          <p style={{ color: "green", marginTop: 12 }}>
            Password updated. You can close this page and log in.
          </p>
        ) : null}
      </form>
    </div>
  );
}
