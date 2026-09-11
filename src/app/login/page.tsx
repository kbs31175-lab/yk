import AuthForm from "@/components/AuthForm";
import { MessageSquareCode, Database, Cloud } from "lucide-react";

export default function LoginPage() {
  return (
    <main style={styles.main}>
      {/* 상단 브랜딩 영역 */}
      <div style={styles.brandContainer}>
        <div style={styles.logoBadge}>
          <MessageSquareCode size={24} color="#6366f1" />
          <span style={styles.logoText}>Antigravity Chat</span>
        </div>
        <h1 style={styles.heroTitle}>
          Vercel-Ready <span style={styles.gradientText}>SQLite Chat</span>
        </h1>
        <p style={styles.heroDesc}>
          로컬 파일 DB와 Vercel 분산 클라우드 환경을 완벽 지원하는 차세대 풀스택 채팅 플랫폼
        </p>

        {/* 특장점 뱃지 목록 */}
        <div style={styles.features}>
          <div style={styles.featurePill}>
            <Database size={14} color="#06b6d4" />
            <span>Drizzle ORM & libSQL</span>
          </div>
          <div style={styles.featurePill}>
            <Cloud size={14} color="#8b5cf6" />
            <span>Vercel Serverless Ready</span>
          </div>
        </div>
      </div>

      {/* 중앙 폼 카드 */}
      <AuthForm />

      {/* 하단 푸터 카피라이트 */}
      <footer style={styles.footer}>
        <p>© 2026 Antigravity Systems. Next.js 14 App Router & libSQL.</p>
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: "32px",
    position: "relative",
  },
  brandContainer: {
    textAlign: "center",
    maxWidth: "540px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  logoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: "6px 14px",
    borderRadius: "999px",
  },
  logoText: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#a5b4fc",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: "2.4rem",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    color: "#fff",
    lineHeight: "1.2",
  },
  gradientText: {
    background: "var(--accent-gradient)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroDesc: {
    fontSize: "0.95rem",
    color: "var(--text-muted)",
    lineHeight: "1.5",
  },
  features: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "4px",
  },
  featurePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.78rem",
    color: "var(--text-main)",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--border-glass)",
    padding: "5px 12px",
    borderRadius: "999px",
  },
  footer: {
    marginTop: "16px",
    fontSize: "0.75rem",
    color: "var(--text-dim)",
  },
};
