import logo from "@/assets/fixmate-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="FixMate AI logo"
      className={cn("h-10 w-10 shrink-0 object-contain", className)}
    />
  );
}

export function LogoLockup({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <img
      src={logo.url}
      alt="FixMate AI — Book. Plan. Fix. Done."
      className={cn("w-full max-w-[220px] object-contain", imgClassName, className)}
    />
  );
}

export const logoUrl = logo.url;
