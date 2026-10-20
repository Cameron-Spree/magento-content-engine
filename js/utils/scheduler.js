/**
 * Batch Interval Scheduler & Date Processor for Magento Content Engine
 */

export function calculateBatchSchedule(posts, scheduleConfig) {
  const {
    startDateStr,
    startTimeStr,
    intervalNum = 3,
    intervalUnit = "days"
  } = scheduleConfig;

  if (!posts || posts.length === 0) return [];

  let baseDate = new Date();
  if (startDateStr) {
    const [year, month, day] = startDateStr.split("-").map(Number);
    const [hours, minutes] = (startTimeStr || "09:00").split(":").map(Number);
    baseDate = new Date(year, month - 1, day, hours, minutes, 0);
  }

  const now = new Date();

  return posts.map((post, index) => {
    const scheduledDate = new Date(baseDate.getTime());

    if (index > 0) {
      const step = index * Number(intervalNum);
      if (intervalUnit === "hours") {
        scheduledDate.setHours(scheduledDate.getHours() + step);
      } else if (intervalUnit === "weeks") {
        scheduledDate.setDate(scheduledDate.getDate() + (step * 7));
      } else {
        scheduledDate.setDate(scheduledDate.getDate() + step);
      }
    }

    const isFuture = scheduledDate.getTime() > now.getTime();
    const amastyStatus = isFuture ? "scheduled" : "enabled";

    return {
      ...post,
      post_date: formatDateFormatted(scheduledDate),
      post_date_gmt: formatDateFormatted(scheduledDate, true),
      status: amastyStatus
    };
  });
}

export function formatDateFormatted(d, isGmt = false) {
  const dateObj = isGmt ? new Date(d.getTime() + d.getTimezoneOffset() * 60000) : d;
  const pad = num => String(num).padStart(2, "0");
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
}

export function parseFormattedDateToInput(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split(" ");
  if (parts.length < 2) return dateStr;
  return `${parts[0]}T${parts[1].substring(0, 5)}`;
}

export function formatInputToFormattedDate(inputStr) {
  if (!inputStr) return formatDateFormatted(new Date());
  const [datePart, timePart] = inputStr.split("T");
  const timeFormatted = timePart && timePart.length === 5 ? `${timePart}:00` : (timePart || "09:00:00");
  return `${datePart} ${timeFormatted}`;
}
