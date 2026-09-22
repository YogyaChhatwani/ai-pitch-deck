export function parseJsonObject(raw: unknown): unknown {
  if (raw !== null && typeof raw === "object") {
    return raw;
  }

  if (typeof raw !== "string") {
    throw new Error("Expected JSON text or an object");
  }

  const unfenced = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(unfenced);
}
