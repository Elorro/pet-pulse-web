export function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "detail" in error) {
    const detail = error.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
      return detail
        .map((item) =>
          item && typeof item === "object" && "msg" in item
            ? item.msg
            : undefined,
        )
        .filter((message): message is string => typeof message === "string")
        .join(". ");
  }
  return "We could not complete that request. Please try again.";
}
