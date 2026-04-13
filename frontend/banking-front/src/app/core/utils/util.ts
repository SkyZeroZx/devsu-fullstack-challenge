export function defaultDateRange() {
  const today = new Date();
  const end = today.toISOString().slice(0, 10);
  const start = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    today.getDate(),
  )
    .toISOString()
    .slice(0, 10);
  return { start, end };
}
