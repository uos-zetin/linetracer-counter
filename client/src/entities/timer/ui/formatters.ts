export function formatMsToTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  const pad = (num: number, size: number = 2) => num.toString().padStart(size, "0");
  const timeString = `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;

  return {
    minutes: pad(minutes),
    seconds: pad(seconds),
    milliseconds: pad(milliseconds, 3),
    toString: () => timeString,
    valueOf: () => timeString,
  };
}
