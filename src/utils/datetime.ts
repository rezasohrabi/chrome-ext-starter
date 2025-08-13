export const formatHumanFriendlyDate = (timestamp: number): string => {
  const wakeDate = new Date(timestamp);
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const isToday =
    wakeDate.getDate() === now.getDate() &&
    wakeDate.getMonth() === now.getMonth() &&
    wakeDate.getFullYear() === now.getFullYear();

  const isTomorrow =
    wakeDate.getDate() === tomorrow.getDate() &&
    wakeDate.getMonth() === tomorrow.getMonth() &&
    wakeDate.getFullYear() === tomorrow.getFullYear();

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const timeStr = wakeDate.toLocaleTimeString(undefined, timeOptions);

  if (isToday) {
    return `Today at ${timeStr}`;
  }

  if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  }

  const daysUntil = Math.floor(
    (wakeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntil < 7) {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const dayName = wakeDate.toLocaleDateString(undefined, options);
    return `${dayName} at ${timeStr}`;
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: wakeDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  };
  const dateStr = wakeDate.toLocaleDateString(undefined, dateOptions);
  return `${dateStr} at ${timeStr}`;
};

export const calculateTimeLeft = (wakeTime: number): string => {
  const now = Date.now();
  const diff = wakeTime - now;
  if (diff <= 0) return 'Now';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const formatDateInputYMD = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const formatTimeInputHM = (date: Date): string => {
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mi = `${date.getMinutes()}`.padStart(2, '0');
  return `${hh}:${mi}`;
};

export const nextDayISOForDatetimeLocal = (
  nowMs: number = Date.now()
): string => {
  const next = new Date(nowMs + 24 * 60 * 60 * 1000);
  // Keep behavior consistent with previous code using toISOString().slice(0,16)
  return next.toISOString().slice(0, 16);
};
