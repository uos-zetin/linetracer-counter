export function formatMsToTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    toString: () => `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}
