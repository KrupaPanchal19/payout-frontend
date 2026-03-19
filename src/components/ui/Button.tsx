"use client";

export function Button({
  children,
  onClick,
  type = "button",
  disabled,
  variant = "primary"
}: {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const styles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-500"
        : "border bg-white text-slate-900 hover:bg-slate-50";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "secondary" ? "" : "",
        styles
      ].join(" ")}
    >
      {children}
    </button>
  );
}

