export function formatElapsedMs(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000);

  const pad2 = (num: number) => num.toString().padStart(2, "0");
  const pad3 = (num: number) => num.toString().padStart(3, "0");
  const timeString = `${pad2(minutes)}:${pad2(seconds)}.${pad3(milliseconds)}`;

  return {
    minutes: pad2(minutes),
    seconds: pad2(seconds),
    milliseconds: pad3(milliseconds),
    toString: () => timeString,
    valueOf: () => timeString,
  };
}
