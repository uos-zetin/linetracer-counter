/**
 * 날짜/시간 포맷팅 유틸리티
 * 일관된 날짜/시간 표시를 위한 공통 함수들
 */

/**
 * 한국 로케일 기본 옵션
 */
const KO_LOCALE = "ko-KR";
const DEFAULT_TIMEZONE = "Asia/Seoul";

/**
 * Date 또는 timestamp를 Date 객체로 변환
 */
function toDate(date: Date | string | number): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

/**
 * 한국 날짜 형식으로 포맷팅 (YYYY년 MM월 DD일)
 * @param date - Date, ISO string, 또는 timestamp
 * @returns "2024년 1월 15일" 형식
 */
export function formatDate(date: Date | string | number): string {
  return toDate(date).toLocaleDateString(KO_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: DEFAULT_TIMEZONE,
  });
}

/**
 * 간단한 날짜 형식으로 포맷팅 (YYYY.MM.DD)
 * @param date - Date, ISO string, 또는 timestamp
 * @returns "2024.01.15" 형식
 */
export function formatDateShort(date: Date | string | number): string {
  const dateObj = toDate(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

/**
 * 시간 형식으로 포맷팅 (HH:MM:SS)
 * @param date - Date, ISO string, 또는 timestamp
 * @returns "14:30:25" 형식
 */
export function formatTime(date: Date | string | number): string {
  return toDate(date).toLocaleTimeString(KO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: DEFAULT_TIMEZONE,
  });
}

/**
 * 짧은 시간 형식으로 포맷팅 (HH:MM)
 * @param date - Date, ISO string, 또는 timestamp
 * @returns "14:30" 형식
 */
export function formatTimeShort(date: Date | string | number): string {
  return toDate(date).toLocaleTimeString(KO_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DEFAULT_TIMEZONE,
  });
}

/**
 * 날짜와 시간을 함께 포맷팅 (YYYY.MM.DD HH:MM)
 * @param date - Date, ISO string, 또는 timestamp
 * @returns "2024.01.15 14:30" 형식
 */
export function formatDateTime(date: Date | string | number): string {
  const dateObj = toDate(date);
  const datePart = formatDateShort(dateObj);
  const timePart = formatTimeShort(dateObj);
  return `${datePart} ${timePart}`;
}

/**
 * 상대적 시간 표시 (방금 전, 5분 전, 2시간 전 등)
 * @param date - Date, ISO string, 또는 timestamp
 * @returns "방금 전", "5분 전", "2시간 전", "2025.08.04" 등
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const targetDate = toDate(date);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "방금 전";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    return formatDateShort(targetDate);
  }
}

/**
 * 관리자용 상세 날짜/시간 표시
 * @param date - Date, ISO string, 또는 timestamp
 * @returns "2024년 1월 15일 14:30:25" 형식
 */
export function formatDateTimeFull(date: Date | string | number): string {
  return toDate(date).toLocaleString(KO_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: DEFAULT_TIMEZONE,
  });
}

/**
 * 기존 코드와의 호환성을 위한 별칭 함수들
 */
export const formatCreatedAt = formatDateTime;
export const formatUpdatedAt = formatDateTime;
