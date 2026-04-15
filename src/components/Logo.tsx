import logoMain from "@/assets/Logo/Logo.png";
import logoWhite from "@/assets/Logo/Logo-white.png";
import logoWithText from "@/assets/Logo/Logo-with-text.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  variant?: "default" | "white" | "with-text";
  hideText?: boolean;
  className?: string;
}

const hSizes = {
  sm: "h-8",
  md: "h-10",
  lg: "h-18",
  xl: "h-22",
  "2xl": "h-26",
  "3xl": "h-52",
};

const tSizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
  "2xl": "text-5xl",
  "3xl": "text-7xl",
};

export function Logo({ size = "md", variant = "default", hideText = false, className = "" }: LogoProps) {
  const h = hSizes[size];
  const t = tSizes[size];

  let src = logoMain;
  let textColor = "text-primary";

  if (variant === "white") {
    src = logoWhite;
    textColor = "text-white";
  }
  if (variant === "with-text") {
    src = logoWithText;
    hideText = true; // Image already has text
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={src}
        alt=""
        className={`${h} w-auto object-contain shrink-0`}
      />
      {!hideText && (
        <span className={`font-display font-bold tracking-tight ${t} ${textColor} leading-none`}>
          MediLink
        </span>
      )}
    </span>
  );
}
