export const formatPrice = (price: number): string => {
  const formatted = new Intl.NumberFormat("vi-VN").format(price);
  return `${formatted} VND`;
};

export const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Sử dụng định dạng 24h
  }).format(date);
};

export const formatDate = (isoString: string): string => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
};

export const formatPriceDisplay = (value: string): string => {
  const numeric = value.replace(/\D/g, "");
  return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);

  // Convert UTC -> Vietnam timezone (UTC+7)
  const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  const now = new Date();
  const nowVN = new Date(now.getTime() + 7 * 60 * 60 * 1000);

  const diffMs = nowVN.getTime() - vnTime.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Bây giờ";
  }
  if (diffMin < 60) {
    return `${diffMin} phút trước`;
  }
  if (diffHour < 24) {
    return `${diffHour} tiếng trước`;
  }
  if (diffDay >= 1) {
    const day = vnTime.getDate().toString().padStart(2, "0");
    const month = (vnTime.getMonth() + 1).toString().padStart(2, "0");
    const year = vnTime.getFullYear();
    const hours = vnTime.getHours().toString().padStart(2, "0");
    const minutes = vnTime.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} lúc ${hours}:${minutes}`;
  }

  return "";
};
