/**
 * ⏰ [타임스탬프 포맷팅 유틸리티]
 * ISO 타임스탬프 또는 날짜 문자열을 사용자 친화적인 형식으로 변환합니다.
 */

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "기록 없음";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "기록 없음";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 10) return "방금 전";
    if (diffSec < 60) return `${diffSec}초 전`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
    return formatDateTime(dateStr);
  } catch {
    return dateStr;
  }
}
