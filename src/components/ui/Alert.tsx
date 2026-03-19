"use client";

export function Alert({
  title,
  message,
  tone = "error"
}: {
  title: string;
  message?: string | null;
  tone?: "error" | "info";
}) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-sky-200 bg-sky-50 text-sky-900";
  return (
    <div className={`rounded-lg border p-3 ${styles}`}>
      <div className="text-sm font-medium">{title}</div>
      {message ? <div className="mt-1 text-sm opacity-90">{message}</div> : null}
    </div>
  );
}

