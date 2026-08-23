import { DewDropSvg } from "@/components/store/landing/DewDropSvg";

/** Gota apoiada na borda superior do card */
export function CardCondensation({ index = 0 }: { index?: number }) {
  return (
    <span className="orvalho pointer-events-none absolute -top-[9px] right-[26px] w-[19px]" aria-hidden>
      <DewDropSvg className="block h-auto w-full" idSuffix={`-card-${index}`} />
    </span>
  );
}
