"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatSidebar from "@/components/ChatSidebar";
import ChatArea from "@/components/ChatArea";
import CreateRoomModal from "@/components/CreateRoomModal";

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1단계: 사용자 인증 상태 및 프로필 정보 로드
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("인증 확인 실패:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // 2단계: 채팅방 목록 로드
  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        const roomList = data.rooms || [];
        setRooms(roomList);

        // 선택된 방이 없고 목록이 있으면 첫 번째 방 자동 선택
        setSelectedRoomId((prev) => {
          if (prev && roomList.some((r: any) => r.id === prev)) return prev;
          return roomList.length > 0 ? roomList[0].id : null;
        });
      }
    } catch (err) {
      console.error("채팅방 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRooms();
    }
  }, [currentUser]);

  // 3단계: 로그아웃 처리
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  // 4단계: 신규 채팅방 생성 완료 콜백
  const handleRoomCreated = (newRoom: any) => {
    setRooms((prev) => [newRoom, ...prev]);
    setSelectedRoomId(newRoom.id);
  };

  if (loading || !currentUser) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>채팅 서비스를 준비 중입니다...</p>
      </div>
    );
  }

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || null;

  return (
    <main style={styles.mainLayout}>
      {/* 좌측 사이드바 */}
      <ChatSidebar
        user={currentUser}
        rooms={rooms}
        selectedRoomId={selectedRoomId}
        onSelectRoom={(id) => setSelectedRoomId(id)}
        onOpenCreateModal={() => setIsModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* 우측 채팅 메인 영역 */}
      <ChatArea
        currentRoom={currentRoom}
        currentUserId={currentUser.id}
        onNewMessageSent={fetchRooms}
      />

      {/* 신규 방 생성 모달 */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainLayout: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    background: "var(--bg-main)",
  },
  loadingContainer: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    background: "var(--bg-main)",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid rgba(99, 102, 241, 0.2)",
    borderTopColor: "var(--primary)",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    color: "var(--text-muted)",
    fontSize: "0.9rem",
  },
};
