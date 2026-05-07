import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="h-7 w-7" />
      {variant === "full" && (
        <span className="text-base font-semibold tracking-tight">
          Estata<span className="text-primary">.</span>
        </span>
      )}
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Estata"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M9 22 V13 a3 3 0 0 1 3 -3 h8 a3 3 0 0 1 3 3 v3 H14 v6 z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="20" cy="20" r="2.5" fill="white" />
    </svg>
  );
}
