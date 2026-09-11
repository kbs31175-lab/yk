"use client";

import React, { useState, useEffect } from "react";
import { X, Hash, AlignLeft, Plus, AlertCircle } from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated: (newRoom: any) => void;
}

export default function CreateRoomModal({
  isOpen,
  onClose,
  onRoomCreated,
}: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ESC 키 누를 때 모달 닫기 이벤트 핸들링
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "채팅방 생성에 실패했습니다.");
      }

      setName("");
      setDescription("");
      onRoomCreated(data.room);
      onClose();
    } catch (err: any) {
      setError(err.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
      >
        {/* 모달 헤더 */}
        <div style={styles.header}>
          <div style={styles.headerTitleBox}>
            <div style={styles.iconBadge}>
              <Hash size={20} color="#818cf8" />
            </div>
            <div>
              <h3 style={styles.title}>새로운 채팅방 개설</h3>
              <p style={styles.subtitle}>대화를 나눌 새로운 공간을 만들어보세요.</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} color="#94a3b8" />
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              채팅방 제목 <span style={{ color: "var(--primary)" }}>*</span>
            </label>
            <div style={styles.inputWrapper}>
              <Hash size={16} color="#64748b" style={styles.icon} />
              <input
                type="text"
                required
                placeholder="예: 자유 토론방, 프로젝트 A 회의실"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                maxLength={50}
                autoFocus
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>채팅방 설명 (선택)</label>
            <div style={styles.inputWrapper}>
              <AlignLeft size={16} color="#64748b" style={styles.icon} />
              <input
                type="text"
                placeholder="어떤 주제로 대화하는 공간인지 적어주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
                maxLength={100}
              />
            </div>
          </div>

          {/* 액션 버튼 */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading || !name.trim()}
            >
              <Plus size={16} />
              <span>{loading ? "생성 중..." : "채팅방 개설"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    width: "100%",
    maxWidth: "460px",
    background: "var(--bg-card)",
    backdropFilter: "var(--backdrop-blur)",
    border: "1px solid var(--border-glass)",
    borderRadius: "var(--radius-lg)",
    padding: "28px",
    boxShadow: "var(--shadow-subtle)",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  headerTitleBox: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  iconBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "var(--radius-md)",
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#fff",
  },
  subtitle: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    marginTop: "2px",
  },
  closeBtn: {
    background: "transparent",
    padding: "4px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(244, 63, 94, 0.15)",
    border: "1px solid rgba(244, 63, 94, 0.3)",
    color: "#fca5a5",
    fontSize: "0.82rem",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
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
  icon: {
    position: "absolute",
    left: "12px",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "11px 14px 11px 38px",
    background: "var(--bg-input)",
    border: "1px solid var(--border-glass)",
    borderRadius: "var(--radius-md)",
    color: "#fff",
    fontSize: "0.9rem",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "12px",
  },
  cancelBtn: {
    padding: "10px 18px",
    borderRadius: "var(--radius-md)",
    background: "rgba(255, 255, 255, 0.06)",
    color: "var(--text-muted)",
    fontSize: "0.88rem",
    fontWeight: 600,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    borderRadius: "var(--radius-md)",
    background: "var(--accent-gradient)",
    color: "#fff",
    fontSize: "0.88rem",
    fontWeight: 600,
    boxShadow: "var(--shadow-glow)",
  },
};
