export const formatIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatTime = (date: Date): string => {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const toMinutes = (value: string): number => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export const addMinutesToTime = (value: string, minutesToAdd: number): string => {
  const total = toMinutes(value) + minutesToAdd;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${`${hours}`.padStart(2, "0")}:${`${minutes}`.padStart(2, "0")}`;
};

export const rangesOverlap = (
  start: number,
  end: number,
  otherStart: number,
  otherEnd: number,
): boolean => start < otherEnd && end > otherStart;

export const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${`${hours}`.padStart(2, "0")}:${`${mins}`.padStart(2, "0")}:00`;
};

export const isSameDate = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const getSlotDurationMinutes = (slots: string[]): number => {
  if (slots.length < 2) return 20;
  return Math.max(10, toMinutes(slots[1]) - toMinutes(slots[0]));
};

export const calendarMinTime = "00:00:00";
export const calendarMaxTime = "24:00:00";
export const defaultDepartment = "General Medicine";