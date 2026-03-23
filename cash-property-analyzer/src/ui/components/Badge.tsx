import React from "react";
import { LucideIcon } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "primary";
  icon?: LucideIcon;
  size?: "sm" | "md" | "lg";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  icon: Icon,
  size = "md",
}) => {
  const variantClasses = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    primary: "bg-indigo-100 text-indigo-800",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantClasses[variant]} ${sizeClasses[size]}
      `}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
};
