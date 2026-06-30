import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  text: string;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = ({
  text,
  icon,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) => {
  const sizeClass =
    size === "small" ? "btn-sm" : size === "large" ? "btn-lg" : "";

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`btn btn-${variant} ${sizeClass} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {icon}
      {loading && <span className="sr-only">Loading: </span>}
      {text}
    </button>
  );
};

export default Button;
