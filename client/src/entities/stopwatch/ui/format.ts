export function formatElapsedMs(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000); // 세 자리로 표시

  const pad2 = (num: number) => num.toString().padStart(2, "0");
  const pad3 = (num: number) => num.toString().padStart(3, "0");

  return `${pad2(minutes)}:${pad2(seconds)}.${pad3(milliseconds)}`;
}
