"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Hash, Users, Sparkles, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/date";

interface MessageItem {
  id: string;
  roomId: string;
  content: string;
  createdAt: string;
  userId: string;
  senderUsername: string;
  senderNickname: string;
  senderAvatarColor?: string;
}

interface CurrentRoom {
  id: string;
  name: string;
  description: string;
}

interface ChatAreaProps {
  currentRoom: CurrentRoom | null;
  currentUserId: string;
  onNewMessageSent?: () => void;
}

import { getBrowserSupabase } from "@/lib/supabase/client";

export default function ChatArea({
  currentRoom,
  currentUserId,
  onNewMessageSent,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 목록 불러오기
  const fetchMessages = async (showSyncIndicator = false) => {
    if (!currentRoom) return;
    if (showSyncIndicator) setIsSyncing(true);

    try {
      const res = await fetch(`/api/rooms/${currentRoom.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("메시지 조회 실패:", err);
    } finally {
      if (showSyncIndicator) {
        setTimeout(() => setIsSyncing(false), 400);
      }
    }
  };

  // 방 변경 시 메시지 최초 로드
  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }

    setLoading(true);
    fetchMessages().finally(() => {
      setLoading(false);
      scrollToBottom();
    });
  }, [currentRoom?.id]);

  // 🌟 [Supabase Realtime 웹소켓 연동]
  // Supabase가 설정되어 있으면 실시간 WebSocket 이벤트 구독, 미설정 시 3초 폴링 자동 전환
  useEffect(() => {
    if (!currentRoom) return;

    const supabase = getBrowserSupabase();
    if (supabase) {
      setIsRealtimeActive(true);
      const channel = supabase
        .channel(`room:${currentRoom.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `room_id=eq.${currentRoom.id}`,
          },
          (payload) => {
            // Supabase Realtime으로 새 메시지가 도착하면 즉시 메시지 갱신
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      // Supabase 미설정 시 3초 주기 폴링 fallback
      setIsRealtimeActive(false);
      const interval = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [currentRoom?.id]);

  // 메시지 업데이트 시 최하단으로 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentRoom || sending) return;

    const contentToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await fetch(`/api/rooms/${currentRoom.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToSend }),
      });

      if (res.ok) {
        await fetchMessages();
        if (onNewMessageSent) onNewMessageSent();
      }
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    } finally {
      setSending(false);
    }
  };

  // Enter 키 전송 (Shift+Enter는 줄바꿈)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 선택된 방이 없을 때의 화면
  if (!currentRoom) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyCard}>
          <div style={styles.emptyIconCircle}>
            <Sparkles size={32} color="#818cf8" />
          </div>
          <h2 style={styles.emptyTitle}>대화를 시작할 방을 선택해주세요</h2>
          <p style={styles.emptyDesc}>
            좌측 목록에서 기존 채널을 선택하거나 새로운 채팅방을 개설하여 실시간 대화를 나누어보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.chatContainer}>
      {/* 🌟 1단계: 채팅 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.hashBadge}>
            <Hash size={18} color="#818cf8" />
          </div>
          <div>
            <h2 style={styles.roomTitle}>{currentRoom.name}</h2>
            {currentRoom.description && (
              <p style={styles.roomSubtitle}>{currentRoom.description}</p>
            )}
          </div>
        </div>

        <div style={styles.headerRight}>
          {isRealtimeActive ? (
            <div style={styles.realtimeActiveBadge} title="Supabase Realtime 웹소켓 연결 활성화">
              <span className="badge-dot" style={{ backgroundColor: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: "0.74rem", fontWeight: 600, color: "#6ee7b7" }}>
                Supabase Realtime
              </span>
            </div>
          ) : (
            <button
              style={styles.refreshBtn}
              onClick={() => fetchMessages(true)}
              title="동기화 새로고침"
            >
              <RefreshCw
                size={14}
                color="#94a3b8"
                className={isSyncing ? "animate-spin" : ""}
              />
              <span style={styles.syncText}>
                {isSyncing ? "동기화 중..." : "실시간 동기화"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 🌟 2단계: 메시지 목록 영역 */}
      <div style={styles.messageScrollArea}>
        {loading ? (
          <div style={styles.centerNotice}>메시지를 불러오는 중입니다...</div>
        ) : messages.length === 0 ? (
          <div style={styles.centerNotice}>
            <p style={{ fontWeight: 600, color: "#fff", marginBottom: "4px" }}>
              아직 작성된 메시지가 없습니다.
            </p>
            <p style={{ fontSize: "0.82rem" }}>첫 번째 인사를 건네보세요! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUserId;
            return (
              <div
                key={msg.id}
                style={{
                  ...styles.messageRow,
                  justifyContent: isMe ? "flex-end" : "flex-start",
                }}
                className="animate-fade-in"
              >
                {/* 상대방일 때 아바타 노출 */}
                {!isMe && (
                  <div
                    style={{
                      ...styles.msgAvatar,
                      backgroundColor: msg.senderAvatarColor || "#8b5cf6",
                    }}
                  >
                    {(msg.senderNickname || msg.senderUsername)
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                )}

                {/* 말풍선 컨테이너 */}
                <div
                  style={{
                    ...styles.messageBubbleWrapper,
                    alignItems: isMe ? "flex-end" : "flex-start",
                  }}
                >
                  {/* 발신자 정보 (상대방일 때만 이름 표시) */}
                  {!isMe && (
                    <div style={styles.senderHeader}>
                      <span style={styles.senderName}>
                        {msg.senderNickname || msg.senderUsername}
                      </span>
                    </div>
                  )}

                  {/* 메시지 내용 말풍선 */}
                  <div
                    style={{
                      ...styles.bubble,
                      ...(isMe ? styles.myBubble : styles.otherBubble),
                    }}
                  >
                    <span style={styles.bubbleText}>{msg.content}</span>
                  </div>

                  {/* 전송 시각 */}
                  <span style={styles.timeTag}>
                    {formatDateTime(msg.createdAt).split(" ")[1]?.slice(0, 5) || "방금"}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 🌟 3단계: 메시지 입력 폼 */}
      <div style={styles.inputArea}>
        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`#${currentRoom.name} 채널에 메시지 보내기 (Enter: 전송, Shift+Enter: 줄바꿈)`}
            rows={1}
            style={styles.textarea}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            style={{
              ...styles.sendButton,
              opacity: !inputText.trim() || sending ? 0.5 : 1,
              cursor: !inputText.trim() || sending ? "not-allowed" : "pointer",
            }}
          >
            <Send size={16} />
            <span>전송</span>
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  chatContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "transparent",
    position: "relative",
  },
  emptyContainer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  emptyCard: {
    maxWidth: "420px",
    textAlign: "center",
    background: "var(--bg-card)",
    backdropFilter: "var(--backdrop-blur)",
    border: "1px solid var(--border-glass)",
    padding: "36px 28px",
    borderRadius: "var(--radius-xl)",
    boxShadow: "var(--shadow-subtle)",
  },
  emptyIconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px auto",
  },
  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "8px",
  },
  emptyDesc: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    lineHeight: "1.5",
  },
  header: {
    padding: "16px 24px",
    borderBottom: "1px solid var(--border-glass)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(10, 13, 20, 0.6)",
    backdropFilter: "var(--backdrop-blur)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  hashBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(99, 102, 241, 0.15)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  roomTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#fff",
  },
  roomSubtitle: {
    fontSize: "0.78rem",
    color: "var(--text-muted)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  realtimeActiveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    padding: "6px 14px",
    borderRadius: "999px",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--border-glass)",
    padding: "6px 12px",
    borderRadius: "999px",
  },
  syncText: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  messageScrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  centerNotice: {
    margin: "auto",
    textAlign: "center",
    color: "var(--text-dim)",
    fontSize: "0.9rem",
    padding: "30px",
  },
  messageRow: {
    display: "flex",
    gap: "10px",
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  msgAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.85rem",
    color: "#fff",
    flexShrink: 0,
    marginTop: "2px",
  },
  messageBubbleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  senderHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  senderName: {
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "var(--text-muted)",
  },
  bubble: {
    padding: "10px 16px",
    borderRadius: "var(--radius-lg)",
    maxWidth: "540px",
    wordBreak: "break-word",
    lineHeight: "1.45",
  },
  myBubble: {
    background: "var(--bubble-gradient)",
    color: "#fff",
    borderBottomRightRadius: "4px",
    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
  },
  otherBubble: {
    background: "rgba(26, 32, 48, 0.8)",
    border: "1px solid var(--border-glass)",
    color: "var(--text-main)",
    borderBottomLeftRadius: "4px",
  },
  bubbleText: {
    fontSize: "0.92rem",
    whiteSpace: "pre-wrap",
  },
  timeTag: {
    fontSize: "0.68rem",
    color: "var(--text-dim)",
    padding: "0 4px",
  },
  inputArea: {
    padding: "16px 24px 20px 24px",
    background: "rgba(10, 13, 20, 0.7)",
    backdropFilter: "var(--backdrop-blur)",
    borderTop: "1px solid var(--border-glass)",
  },
  inputForm: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "var(--bg-input)",
    border: "1px solid var(--border-glass)",
    borderRadius: "var(--radius-lg)",
    padding: "8px 12px 8px 16px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  },
  textarea: {
    flex: 1,
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "0.92rem",
    resize: "none",
    maxHeight: "120px",
  },
  sendButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "var(--accent-gradient)",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "var(--radius-md)",
    fontSize: "0.85rem",
    fontWeight: 600,
    boxShadow: "var(--shadow-glow)",
  },
};
