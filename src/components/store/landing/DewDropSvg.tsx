type Props = {
  className?: string;
  /** Alongada para gota pendurada na ponta da folha */
  elongated?: boolean;
  idSuffix?: string;
};

export function DewDropSvg({ className, elongated = false, idSuffix = "" }: Props) {
  const lensId = `dewLens${idSuffix}`;
  const shadowId = `dewShadow${idSuffix}`;
  const rx = elongated ? 9 : 10;
  const ry = elongated ? 12 : 9;

  return (
    <svg
      viewBox="0 0 24 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <defs>
        <radialGradient id={lensId} cx=".66" cy=".70" r=".78">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".85" />
          <stop offset=".38" stopColor="#DCEBE3" stopOpacity=".46" />
          <stop offset=".82" stopColor="#8FA89A" stopOpacity=".26" />
          <stop offset="1" stopColor="#6F8A7B" stopOpacity=".48" />
        </radialGradient>
        <radialGradient id={shadowId}>
          <stop offset="0" stopColor="#375145" stopOpacity=".26" />
          <stop offset="1" stopColor="#375145" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="12" cy="24" rx={rx + 2} ry="3.5" fill={`url(#${shadowId})`} />
      <ellipse cx="12" cy="14" rx={rx} ry={ry} fill={`url(#${lensId})`} />
      <ellipse
        cx="12"
        cy="14"
        rx={rx}
        ry={ry}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity=".35"
        strokeWidth=".6"
      />
      <ellipse cx="9.2" cy="10.8" rx="2.4" ry="1.6" fill="#FFFFFF" fillOpacity=".75" />
    </svg>
  );
}
