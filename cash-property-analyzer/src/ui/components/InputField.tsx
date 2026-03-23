import React from "react";
import { LucideIcon } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  error?: string;
  helperText?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon: Icon,
  prefix,
  suffix,
  error,
  helperText,
  className = "",
  ...props
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}

        {prefix && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {prefix}
          </div>
        )}

        <input
          className={`
            w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${Icon || prefix ? "pl-10" : ""}
            ${suffix ? "pr-10" : ""}
            ${error ? "border-red-500" : "border-gray-300"}
            ${className}
          `}
          {...props}
        />

        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {suffix}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
