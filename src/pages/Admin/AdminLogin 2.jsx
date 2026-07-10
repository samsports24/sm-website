import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Shield, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import Axios from "axios";

/* ── Color Palette (same as AdminPanel) ── */
const C = {
  bg: "#0f172a", bgCard: "#1e293b", bgHover: "#334155", bgInput: "#1e293b",
  border: "#334155", borderLight: "rgba(71,85,105,0.5)",
  text: "#e2e8f0", textDim: "#94a3b8", textMuted: "#64748b",
  white: "#fff",
  blue: "#3b82f6", blueLight: "rgba(59,130,246,0.15)",
  green: "#10b981", greenLight: "rgba(16,185,129,0.15)",
  purple: "#8b5cf6", purpleLight: "rgba(139,92,246,0.15)",
  red: "#ef4444", redLight: "rgba(239,68,68,0.15)",
};

const base_url = process.env.REACT_APP_API_URL || "https://backend.samsports.io";
const adminAPI = Axios.create({ baseURL: base_url });

const AdminLogin = () => {
  const navigate = useNavigate();

  /* ── State ── */
  const [step, setStep] = useState(1); // 1 = email+password, 2 = secondary password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secondaryPassword, setSecondaryPassword] = useState("");
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [adminName, setAdminName] = useState("");

  // If already logged in as admin, redirect
  useEffect(() => {
    if (localStorage.getItem("adminToken")) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  /* ── Step 1: Email + Primary Password ── */
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminAPI.post("/admin-auth/login", { email, password });
      const data = res.data?.data || res.data;
      setTempToken(data.tempToken);
      setAdminName(data.adminName || "Admin");
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Secondary Password ── */
  const handleStep2 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminAPI.post("/admin-auth/verify", { tempToken, secondaryPassword });
      const data = res.data?.data || res.data;
      // Store admin token (separate from user token)
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data.admin));
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Verification failed";
      setError(msg);
      // If expired, go back to step 1
      if (err.response?.status === 401) {
        setTimeout(() => { setStep(1); setTempToken(""); setSecondaryPassword(""); }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared Styles ── */
  const inputWrap = {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: C.bgInput,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "0 14px",
    transition: "border-color .2s",
  };
  const inputStyle = {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: C.text,
    fontSize: 14,
    padding: "14px 0",
    fontFamily: "inherit",
  };
  const btnStyle = {
    width: "100%",
    padding: "14px 20px",
    background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
    color: C.white,
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "opacity .2s",
    opacity: loading ? 0.7 : 1,
    fontFamily: "inherit",
  };
  const eyeBtn = {
    background: "none", border: "none", cursor: "pointer", padding: 4,
    display: "flex", alignItems: "center",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      padding: 20,
    }}>
      {/* Background decorations */}
      <div style={{
        position: "fixed", top: -200, right: -200,
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -200, left: -200,
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{
        width: "100%",
        maxWidth: 420,
        background: C.bgCard,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: "40px 32px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <Shield size={28} color={C.white} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.white, margin: "0 0 4px" }}>
            SAMSports Admin
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
            {step === 1 ? "Sign in to Mission Control" : `Welcome back, ${adminName}`}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: step >= 1 ? C.blue : C.bgHover,
            color: C.white, fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>1</div>
          <div style={{ width: 40, height: 2, background: step >= 2 ? C.blue : C.bgHover, borderRadius: 1 }} />
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: step >= 2 ? C.blue : C.bgHover,
            color: step >= 2 ? C.white : C.textMuted, fontSize: 12, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>2</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: C.redLight, border: `1px solid ${C.red}33`,
            borderRadius: 10, padding: "10px 14px", marginBottom: 20,
          }}>
            <AlertCircle size={16} color={C.red} />
            <span style={{ fontSize: 13, color: C.red, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 6 }}>
              Email Address
            </label>
            <div style={inputWrap}>
              <Mail size={16} color={C.textMuted} style={{ marginRight: 10 }} />
              <input
                style={inputStyle}
                type="email"
                placeholder="admin@samsports.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div style={{ height: 16 }} />

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 6 }}>
              Primary Password
            </label>
            <div style={inputWrap}>
              <Lock size={16} color={C.textMuted} style={{ marginRight: 10 }} />
              <input
                style={inputStyle}
                type={showPw1 ? "text" : "password"}
                placeholder="Enter primary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" style={eyeBtn} onClick={() => setShowPw1(!showPw1)}>
                {showPw1 ? <EyeOff size={16} color={C.textMuted} /> : <Eye size={16} color={C.textMuted} />}
              </button>
            </div>

            <div style={{ height: 24 }} />

            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <>Continue <ChevronRight size={16} /></>}
            </button>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleStep2}>
            <div style={{
              background: C.blueLight, border: `1px solid ${C.blue}33`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Shield size={14} color={C.blue} />
              <span style={{ fontSize: 12, color: C.blue, fontWeight: 500 }}>
                Primary password verified. Enter your security password.
              </span>
            </div>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textDim, marginBottom: 6 }}>
              Secondary Password
            </label>
            <div style={inputWrap}>
              <Lock size={16} color={C.textMuted} style={{ marginRight: 10 }} />
              <input
                style={inputStyle}
                type={showPw2 ? "text" : "password"}
                placeholder="Enter secondary password"
                value={secondaryPassword}
                onChange={(e) => setSecondaryPassword(e.target.value)}
                required
                autoFocus
                autoComplete="off"
              />
              <button type="button" style={eyeBtn} onClick={() => setShowPw2(!showPw2)}>
                {showPw2 ? <EyeOff size={16} color={C.textMuted} /> : <Eye size={16} color={C.textMuted} />}
              </button>
            </div>

            <div style={{ height: 24 }} />

            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <>Sign In <Shield size={16} /></>}
            </button>

            <button
              type="button"
              onClick={() => { setStep(1); setError(""); setSecondaryPassword(""); setTempToken(""); }}
              style={{
                width: "100%", marginTop: 12, padding: "10px",
                background: "transparent", border: `1px solid ${C.border}`,
                borderRadius: 10, color: C.textMuted, fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Back to Step 1
            </button>
          </form>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: 11, color: C.textMuted, margin: "24px 0 0" }}>
          backoffice.samsports.io — Authorized personnel only
        </p>
      </div>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminLogin;
