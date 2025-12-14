export function parseData(value: string) {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.text === "string") {
      return parsed;
    }
  } catch {
    console.error("Parse error");
  }
}
