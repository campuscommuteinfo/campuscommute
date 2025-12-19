import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = false }: LogoProps) {
  const sizeClasses = {
    sm: "size-8",
    md: "size-10",
    lg: "size-14",
    xl: "size-20",
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn(
        "relative flex items-center justify-center rounded-xl shadow-lg overflow-hidden",
        sizeClasses[size]
      )}>
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />

        {/* Logo SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
          width={iconSizes[size]}
          height={iconSizes[size]}
        >
          {/* Bus body */}
          <rect x="20" y="35" width="50" height="30" rx="6" fill="white" />

          {/* Bus windows */}
          <rect x="26" y="41" width="10" height="10" rx="2" fill="#4F46E5" opacity="0.8" />
          <rect x="40" y="41" width="10" height="10" rx="2" fill="#4F46E5" opacity="0.8" />
          <rect x="54" y="41" width="10" height="10" rx="2" fill="#4F46E5" opacity="0.8" />

          {/* Bus front */}
          <rect x="64" y="40" width="8" height="20" rx="3" fill="white" />
          <circle cx="70" cy="46" r="2" fill="#FBBF24" />

          {/* Wheels */}
          <circle cx="32" cy="65" r="6" fill="white" />
          <circle cx="32" cy="65" r="3" fill="#4F46E5" />
          <circle cx="55" cy="65" r="6" fill="white" />
          <circle cx="55" cy="65" r="3" fill="#4F46E5" />

          {/* Location pin */}
          <path
            d="M75 20C75 26.627 68 35 68 35C68 35 61 26.627 61 20C61 13.373 64.134 10 68 10C71.866 10 75 13.373 75 20Z"
            fill="white"
          />
          <circle cx="68" cy="19" r="4" fill="#EC4899" />

          {/* Route dots */}
          <circle cx="18" cy="50" r="3" fill="white" opacity="0.7" />
          <circle cx="10" cy="50" r="2" fill="white" opacity="0.5" />
          <circle cx="85" cy="50" r="3" fill="white" opacity="0.7" />
          <circle cx="93" cy="50" r="2" fill="white" opacity="0.5" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Commute
          </span>
          <span className="text-sm font-medium text-gray-500 -mt-1">
            Companion
          </span>
        </div>
      )}
    </div>
  );
}

// Alternative minimal logo for favicon or small spaces
export function LogoMini({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
    >
      <rect width="32" height="32" rx="8" fill="url(#gradient)" />
      <rect x="6" y="12" width="16" height="10" rx="2" fill="white" />
      <circle cx="10" cy="22" r="2" fill="white" />
      <circle cx="18" cy="22" r="2" fill="white" />
      <path d="M26 8C26 10.5 24 14 24 14C24 14 22 10.5 22 8C22 5.5 22.9 4 24 4C25.1 4 26 5.5 26 8Z" fill="white" />
      <circle cx="24" cy="7.5" r="1.5" fill="#EC4899" />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="0.5" stopColor="#9333EA" />
          <stop offset="1" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}
