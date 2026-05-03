import Image from "next/image";
import Icon from "@/assets/images/logo.png"
import { twMerge } from "tailwind-merge"; // Optional but recommended
import { clsx, type ClassValue } from "clsx"; // Optional but recommended

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  textSize?: string;
  imageSize?: string;
  spaceBetween?: string;
  className?: string;
}

export default function Logo({
  textSize = "xl", 
  imageSize = "1.75rem", 
  spaceBetween = "1.5rem", 
  className 
}: LogoProps) {
  
  return (
    <div className={cn("flex items-end relative w-fit", className)}>
      <Image 
        src={Icon} 
        alt="Logo Image" 
        className="absolute bottom-0 left-0" 
        style={{ width: imageSize, height: imageSize }}
      />
      <span 
        className={`font-bold text-${textSize} text-brand-navy tracking-tight leading-none`}
        style={{ paddingLeft: spaceBetween }}
      >
        ortuiz
      </span>
    </div>
  )
}