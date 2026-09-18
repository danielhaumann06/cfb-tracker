// Every schedule/scores view shows kickoff times, and this app is US
// college football only - so every one of them is pinned to Eastern time
// (labeled explicitly) rather than the server's or viewer's own timezone.
// Without an explicit timeZone, Intl falls back to the runtime's zone,
// which on Vercel is UTC - that silently shifted every kickoff by 4-5
// hours until this was pinned down.
export function formatKickoff(
  dateIso: string,
  { weekday = true, monthDay = true }: { weekday?: boolean; monthDay?: boolean } = {}
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  }
  if (weekday) options.weekday = 'short'
  if (monthDay) {
    options.month = 'short'
    options.day = 'numeric'
  }

  return `${new Date(dateIso).toLocaleString('en-US', options)} EST`
}
