import { DewDropSvg } from "@/components/store/landing/DewDropSvg";

export function DewDivider() {
  return (
    <div className="wrap">
      <span className="fio flex items-center gap-4 text-iseul-line" aria-hidden>
        <i className="h-px flex-1 bg-current" />
        <span className="conta w-[22px] flex-none">
          <DewDropSvg className="block h-auto w-full" idSuffix="-divider" />
        </span>
        <i className="h-px flex-1 bg-current" />
      </span>
    </div>
  );
}
