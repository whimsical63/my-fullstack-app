// export function formatToUTC8AMPM(dateString: string) {
//   const date = new Date(dateString);
//   // Convert to UTC+8 by adding 8 hours (28800000 ms)
//   const utc8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);
//   return utc8Date.toLocaleString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     timeZone: "UTC", // Keep as UTC, since we already shifted the time
//   });
// }

export function formatToUTC8AMPM(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Singapore", // or "Asia/Shanghai"
  });
}