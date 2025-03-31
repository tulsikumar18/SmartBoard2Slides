import React from "react";
import { cn } from "@/lib/utils";
import { FileImage } from "lucide-react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  onClick?: () => void;
}

const Logo = ({
  className,
  size = "md",
  withText = true,
  onClick,
}: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 transition-transform duration-300 hover:scale-105",
        className,
      )}
      onClick={onClick}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-ink2deck-primary rounded-md blur-sm opacity-50 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-ink2deck-primary to-ink2deck-secondary rounded-md p-2 shadow-lg">
          <FileImage className={cn("text-white", sizeClasses[size])} />
        </div>
      </div>
      {withText && (
        <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-ink2deck-primary to-ink2deck-secondary text-xl">
          Ink2Deck
        </div>
      )}
    </div>
  );
};

export default Logo;
