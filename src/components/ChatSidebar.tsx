"use client";

import React from "react";
import { MessageSquare, Plus, LogOut, Clock, Shield, Hash } from "lucide-react";
import { formatDateTime, formatRelativeTime } from "@/lib/date";

interface RoomItem {
  id: string;
  name: string;
  description: string;
  creatorNickname?: string;
  messageCount: number;
}

interface CurrentUser {
  id: string;
  username: string;
  nickname: string;
  avatarColor: string;
  lastLoginAt?: string | null;
}

interface ChatSidebarProps {
  user: CurrentUser;
  rooms: RoomItem[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onOpenCreateModal: () => void;
  onLogout: () => void;
}

export default function ChatSidebar({
  user,
  rooms,
  selectedRoomId,
  onSelectRoom,
  onOpenCreateModal,
  onLogout,
}: ChatSidebarProps) {
  return (
    <aside style={styles.sidebar}>
      {/* 🌟 1단계: 사용자 프로필 & 핵심 요구사항인 로그인 타임스탬프 뱃지 */}
      <div style={styles.profileSection}>
        <div style={styles.profileRow}>
          <div
            style={{
              ...styles.avatar,
              backgroundColor: user.avatarColor || "#6366f1",
            }}
          >
            {user.nickname.slice(0, 1).toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.nameRow}>
              <span style={styles.nickname}>{user.nickname}</span>
              <span style={styles.username}>@{user.username}</span>
            </div>
            {/* 로그인 타임스탬프 표시 영역 (요구사항) */}
            <div style={styles.timestampBadge} title={formatDateTime(user.lastLoginAt)}>
              <span className="badge-dot" />
              <Clock size={12} color="#a5b4fc" />
              <span>로그인: {formatRelativeTime(user.lastLoginAt)}</span>
            </div>
          </div>
        </div>

        {/* 상세 타임스탬프 텍스트 */}
        {user.lastLoginAt && (
          <div style={styles.exactTimeText}>
            접속 시각: {formatDateTime(user.lastLoginAt)}
          </div>
        )}
      </div>

      {/* 🌟 2단계: 채팅방 관리 바 (제목 + 방 만들기 버튼) */}
      <div style={styles.roomsHeader}>
        <div style={styles.roomsHeaderTitle}>
          <MessageSquare size={16} color="#818cf8" />
          <span>채팅 채널 ({rooms.length})</span>
        </div>
        <button
          style={styles.addRoomBtn}
          onClick={onOpenCreateModal}
          title="새 채팅방 만들기"
        >
          <Plus size={16} color="#fff" />
          <span>개설</span>
        </button>
      </div>

      {/* 🌟 3단계: 채팅방 목록 */}
      <div style={styles.roomList}>
        {rooms.length === 0 ? (
          <div style={styles.emptyRooms}>
            <p>개설된 채팅방이 없습니다.</p>
            <button style={styles.emptyActionBtn} onClick={onOpenCreateModal}>
              첫 번째 방을 만들어보세요!
            </button>
          </div>
        ) : (
          rooms.map((room) => {
            const isSelected = room.id === selectedRoomId;
            return (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                style={{
                  ...styles.roomCard,
                  ...(isSelected ? styles.roomCardSelected : {}),
                }}
              >
                <div style={styles.roomCardTop}>
                  <div style={styles.roomNameGroup}>
                    <Hash
                      size={16}
                      color={isSelected ? "#818cf8" : "#64748b"}
                    />
                    <span style={styles.roomName}>{room.name}</span>
                  </div>
                  {room.messageCount > 0 && (
                    <span style={styles.msgCountBadge}>{room.messageCount}</span>
                  )}
                </div>

                {room.description && (
                  <p style={styles.roomDesc}>{room.description}</p>
                )}

                <div style={styles.roomFooter}>
                  <span style={styles.creatorTag}>
                    개설: {room.creatorNickname || "익명"}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🌟 4단계: 사이드바 하단 (로그아웃 & 시스템 정보) */}
      <div style={styles.bottomSection}>
        <div style={styles.techInfo}>
          <Shield size={12} color="#10b981" />
          <span>Supabase & SQLite + Vercel</span>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}>
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "320px",
    minWidth: "300px",
    background: "var(--bg-sidebar)",
    backdropFilter: "var(--backdrop-blur)",
    borderRight: "1px solid var(--border-glass)",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  profileSection: {
    padding: "20px",
    borderBottom: "1px solid var(--border-glass)",
    background: "rgba(255, 255, 255, 0.02)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  profileRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#fff",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
    flexShrink: 0,
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    overflow: "hidden",
  },
  nameRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    overflow: "hidden",
  },
  nickname: {
    fontWeight: 700,
    fontSize: "0.98rem",
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  username: {
    fontSize: "0.78rem",
    color: "var(--text-dim)",
  },
  timestampBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "2px 8px",
    background: "rgba(99, 102, 241, 0.12)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    borderRadius: "999px",
    fontSize: "0.72rem",
    color: "#a5b4fc",
    width: "fit-content",
  },
  exactTimeText: {
    fontSize: "0.7rem",
    color: "var(--text-dim)",
    paddingLeft: "4px",
  },
  roomsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px 10px 20px",
  },
  roomsHeaderTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  addRoomBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "var(--primary)",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  roomList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  emptyRooms: {
    textAlign: "center",
    padding: "40px 16px",
    color: "var(--text-dim)",
    fontSize: "0.85rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  emptyActionBtn: {
    padding: "8px 14px",
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    color: "#a5b4fc",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.8rem",
  },
  roomCard: {
    padding: "12px 14px",
    borderRadius: "var(--radius-md)",
    background: "transparent",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.18s ease",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  roomCardSelected: {
    background: "rgba(99, 102, 241, 0.15)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
  },
  roomCardTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  roomNameGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  roomName: {
    fontSize: "0.92rem",
    fontWeight: 600,
    color: "#fff",
  },
  msgCountBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    background: "rgba(255, 255, 255, 0.1)",
    color: "var(--text-muted)",
    padding: "2px 7px",
    borderRadius: "999px",
  },
  roomDesc: {
    fontSize: "0.78rem",
    color: "var(--text-dim)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingLeft: "24px",
  },
  roomFooter: {
    display: "flex",
    justifyContent: "flex-end",
    paddingLeft: "24px",
  },
  creatorTag: {
    fontSize: "0.7rem",
    color: "var(--text-dim)",
  },
  bottomSection: {
    padding: "16px 20px",
    borderTop: "1px solid var(--border-glass)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(0, 0, 0, 0.2)",
  },
  techInfo: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "0.72rem",
    color: "var(--text-dim)",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "transparent",
    color: "var(--text-muted)",
    fontSize: "0.82rem",
    padding: "6px 10px",
    borderRadius: "var(--radius-sm)",
  },
};
