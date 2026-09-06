"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const adminSelectClass =
  "w-full appearance-none rounded-xl border border-iseul-line/90 bg-white py-2.5 pl-3.5 pr-10 text-sm text-iseul-ink shadow-sm transition focus:border-iseul-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-dew disabled:cursor-not-allowed disabled:opacity-60";

type AdminSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export function AdminSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: AdminSelectProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select className={cn(adminSelectClass, className)} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
        aria-hidden
      />
    </div>
  );
}
