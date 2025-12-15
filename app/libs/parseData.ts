export function parseData(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (parsed) {
      return parsed;
    }
  } catch {
    console.error("Parse error");
  }
}
