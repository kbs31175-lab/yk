"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Lock, User, Smile } from "lucide-react";

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { username, password }
        : { username, password, nickname };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "요청 처리에 실패했습니다.");
      }

      if (isLogin) {
        // 로그인 성공 시 채팅 페이지로 이동
        setSuccessMessage("로그인 성공! 채팅방으로 이동합니다...");
        setTimeout(() => {
          router.push("/chat");
          router.refresh();
        }, 500);
      } else {
        // 회원가입 성공 시 로그인 탭으로 자동 전환 및 안내
        setSuccessMessage("회원가입이 완료되었습니다! 로그인해 주세요.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.cardWrapper} className="animate-fade-in">
      {/* 상단 탭 전환 버튼 */}
      <div style={styles.tabContainer}>
        <button
          type="button"
          onClick={() => {
            setIsLogin(true);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          style={{
            ...styles.tabButton,
            ...(isLogin ? styles.tabButtonActive : {}),
          }}
        >
          <LogIn size={18} />
          <span>로그인</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setIsLogin(false);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          style={{
            ...styles.tabButton,
            ...(!isLogin ? styles.tabButtonActive : {}),
          }}
        >
          <UserPlus size={18} />
          <span>회원가입</span>
        </button>
      </div>

      {/* 헤더 섹션 */}
      <div style={styles.header}>
        <div style={styles.iconCircle}>
          <Sparkles size={26} color="#818cf8" />
        </div>
        <h2 style={styles.title}>
          {isLogin ? "다시 오신 것을 환영합니다" : "새로운 계정 만들기"}
        </h2>
        <p style={styles.subtitle}>
          {isLogin
            ? "로그인 시 최근 접속 타임스탬프가 자동 갱신됩니다."
            : "Vercel 배포를 지원하는 가벼운 SQLite 채팅방에 참여해보세요."}
        </p>
      </div>

      {/* 알림 메시지 */}
      {errorMessage && (
        <div style={styles.alertError}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div style={styles.alertSuccess}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 폼 본문 */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* 아이디 입력 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>아이디 (Username)</label>
          <div style={styles.inputWrapper}>
            <User size={18} color="#64748b" style={styles.inputIcon} />
            <input
              type="text"
              required
              minLength={3}
              placeholder="영문, 숫자 3자 이상"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {/* 닉네임 입력 (회원가입 시에만 노출) */}
        {!isLogin && (
          <div style={styles.inputGroup} className="animate-fade-in">
            <label style={styles.label}>닉네임 (Display Name)</label>
            <div style={styles.inputWrapper}>
              <Smile size={18} color="#64748b" style={styles.inputIcon} />
              <input
                type="text"
                placeholder="채팅방에서 표시될 별명 (미입력 시 아이디)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>
        )}

        {/* 비밀번호 입력 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>비밀번호 (Password)</label>
          <div style={styles.inputWrapper}>
            <Lock size={18} color="#64748b" style={styles.inputIcon} />
            <input
              type="password"
              required
              minLength={4}
              placeholder="4자 이상 안전한 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {/* 보안 안내 배지 */}
        <div style={styles.securityNotice}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Bcrypt 단방향 솔트 암호화 및 HTTP-Only 쿠키 세션 보호</span>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <span>처리 중...</span>
          ) : isLogin ? (
            <>
              <span>로그인 시작</span>
              <LogIn size={18} />
            </>
          ) : (
            <>
              <span>가입 완료하고 시작하기</span>
              <UserPlus size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  cardWrapper: {
    width: "100%",
    maxWidth: "440px",
    background: "var(--bg-card)",
    backdropFilter: "var(--backdrop-blur)",
    border: "1px solid var(--border-glass)",
    borderRadius: "var(--radius-xl)",
    padding: "32px 28px",
    boxShadow: "var(--shadow-subtle)",
  },
  tabContainer: {
    display: "flex",
    background: "rgba(0, 0, 0, 0.25)",
    padding: "4px",
    borderRadius: "var(--radius-md)",
    marginBottom: "28px",
    gap: "6px",
  },
  tabButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "var(--text-muted)",
    background: "transparent",
  },
  tabButtonActive: {
    background: "rgba(99, 102, 241, 0.2)",
    color: "#fff",
    border: "1px solid rgba(99, 102, 241, 0.4)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
  },
  header: {
    textAlign: "center",
    marginBottom: "24px",
  },
  iconCircle: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "#fff",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    lineHeight: "1.4",
  },
  alertError: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(244, 63, 94, 0.12)",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    color: "#fca5a5",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    marginBottom: "18px",
  },
  alertSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#6ee7b7",
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    marginBottom: "18px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "var(--text-muted)",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 14px 12px 42px",
    background: "var(--bg-input)",
    border: "1px solid var(--border-glass)",
    borderRadius: "var(--radius-md)",
    color: "#fff",
    fontSize: "0.95rem",
  },
  securityNotice: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.74rem",
    color: "var(--text-dim)",
    marginTop: "2px",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "var(--accent-gradient)",
    color: "#fff",
    padding: "13px 20px",
    borderRadius: "var(--radius-md)",
    fontSize: "0.95rem",
    fontWeight: 700,
    marginTop: "10px",
    boxShadow: "var(--shadow-glow)",
  },
};
