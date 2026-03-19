/** 秒数を mm:ss.cc 形式の文字列に変換する */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const sec = seconds.toFixed(2).padStart(5, "0");
  return `${String(minutes).padStart(2, "0")}:${sec}`;
}
