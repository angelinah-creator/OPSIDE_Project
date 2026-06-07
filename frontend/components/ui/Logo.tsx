import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

// Logo
export default function Logo({ size = 32, showText = true, className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <div style={{ width: size, height: size }} className="relative flex-shrink-0">
        <Image src="/logo.jpeg" alt="OPSIDE" fill className="object-contain" />
      </div>
      {showText && (
        <span className="text-[#1A1A1A] font-bold text-xl tracking-tight">OPSIDE</span>
      )}
    </Link>
  );
}
