export function formatMsToTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  const pad = (num: number, size: number = 2) => num.toString().padStart(size, "0");
  const padMs = (num: number) => num.toString().padStart(3, "0");
  const timeString = `${pad(minutes)}:${pad(seconds)}.${padMs(milliseconds)}`;

  return {
    minutes: pad(minutes),
    seconds: pad(seconds),
    milliseconds: padMs(milliseconds),
    toString: () => timeString,
    valueOf: () => timeString,
  };
}
