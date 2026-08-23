/** Ramo estático de centella asiática — orvalho apoiado nas margens, sem animação. */
export function CentellaBranch() {
  return (
    <div className="folha pointer-events-none absolute -bottom-[32%] -right-[16%] w-[clamp(360px,44vw,600px)] rotate-[-8deg] select-none opacity-[0.92] max-[760px]:-bottom-[14%] max-[760px]:-right-[30%] max-[760px]:w-[96vw] max-[760px]:opacity-[0.85]">
      <svg viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg" className="block h-auto w-full">
        <defs>
          <radialGradient id="cb-dewLens" cx=".64" cy=".67" r=".76">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity=".85" />
            <stop offset=".38" stopColor="#DCEBE3" stopOpacity=".46" />
            <stop offset=".82" stopColor="#8FA89A" stopOpacity=".26" />
            <stop offset="1" stopColor="#6F8A7B" stopOpacity=".48" />
          </radialGradient>
          <radialGradient id="cb-dewShadow">
            <stop offset="0" stopColor="#375145" stopOpacity=".26" />
            <stop offset="1" stopColor="#375145" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* estolão */}
        <path
          d="M-40 310 C80 300, 140 290, 200 285 C260 280, 320 278, 560 275"
          fill="none"
          stroke="#375145"
          strokeOpacity=".3"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* pecíolos + folhas — escala 1.00 */}
        <g transform="translate(210 290)">
          <path d="M0 0 C-2 28, -4 52, -6 78" fill="none" stroke="#375145" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M-6 78 C-52 62, -78 28, -72 -8 C-66 -38, -38 -58, -4 -54 C28 -50, 52 -24, 48 8 C44 38, 18 58, -6 78 Z"
            fill="#FAF8F4"
          />
          <path
            d="M-6 78 C-52 62, -78 28, -72 -8 C-66 -38, -38 -58, -4 -54 C28 -50, 52 -24, 48 8 C44 38, 18 58, -6 78 Z"
            fill="#375145"
            fillOpacity=".085"
            stroke="#375145"
            strokeOpacity=".32"
            strokeWidth="1.2"
          />
          <path d="M-6 78 L-8 20 M-6 78 L-28 42 M-6 78 L18 38 M-6 78 L-4 10" fill="none" stroke="#375145" strokeOpacity=".2" strokeWidth=".8" />
          <g transform="translate(-38 -18)">
            <ellipse cx="0" cy="14" rx="11" ry="4" fill="url(#cb-dewShadow)" />
            <ellipse cx="0" cy="4" rx="9" ry="8" fill="url(#cb-dewLens)" />
            <ellipse cx="-2.5" cy="1" rx="2.2" ry="1.4" fill="#FFF" fillOpacity=".75" />
          </g>
        </g>

        {/* folha 0.66 */}
        <g transform="translate(248 300) scale(0.66)">
          <path d="M0 0 C1 24, 2 44, 4 66" fill="none" stroke="#375145" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 66 C-28 54, -48 28, -44 -4 C-40 -28, -18 -42, 6 -38 C28 -34, 44 -14, 42 10 C40 32, 22 48, 4 66 Z" fill="#FAF8F4" />
          <path
            d="M4 66 C-28 54, -48 28, -44 -4 C-40 -28, -18 -42, 6 -38 C28 -34, 44 -14, 42 10 C40 32, 22 48, 4 66 Z"
            fill="#375145"
            fillOpacity=".085"
            stroke="#375145"
            strokeOpacity=".32"
            strokeWidth="1.2"
          />
          <g transform="translate(18 -8)">
            <ellipse cx="0" cy="12" rx="9" ry="3.2" fill="url(#cb-dewShadow)" />
            <ellipse cx="0" cy="3" rx="7.5" ry="6.8" fill="url(#cb-dewLens)" />
            <ellipse cx="-2" cy="0.5" rx="1.8" ry="1.2" fill="#FFF" fillOpacity=".75" />
          </g>
        </g>

        {/* folha 0.54 */}
        <g transform="translate(180 305) scale(0.54)">
          <path d="M0 0 C-1 20, -2 38, -3 58" fill="none" stroke="#375145" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
          <path d="M-3 58 C-34 48, -52 26, -48 -2 C-44 -24, -24 -36, -2 -32 C18 -28, 34 -12, 32 8 C30 26, 16 40, -3 58 Z" fill="#FAF8F4" />
          <path
            d="M-3 58 C-34 48, -52 26, -48 -2 C-44 -24, -24 -36, -2 -32 C18 -28, 34 -12, 32 8 C30 26, 16 40, -3 58 Z"
            fill="#375145"
            fillOpacity=".085"
            stroke="#375145"
            strokeOpacity=".32"
            strokeWidth="1.2"
          />
          <g transform="translate(-22 -6)">
            <ellipse cx="0" cy="10" rx="7" ry="2.6" fill="url(#cb-dewShadow)" />
            <ellipse cx="0" cy="2.5" rx="6" ry="5.4" fill="url(#cb-dewLens)" />
          </g>
        </g>

        {/* folha 0.34 — gota pendurada alongada */}
        <g transform="translate(290 312) scale(0.34)">
          <path d="M0 0 C2 18, 4 34, 6 52" fill="none" stroke="#375145" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
          <path d="M6 52 C-18 44, -32 26, -30 2 C-28 -16, -14 -26, 2 -24 C16 -22, 28 -10, 26 6 C24 20, 14 32, 6 52 Z" fill="#FAF8F4" />
          <path
            d="M6 52 C-18 44, -32 26, -30 2 C-28 -16, -14 -26, 2 -24 C16 -22, 28 -10, 26 6 C24 20, 14 32, 6 52 Z"
            fill="#375145"
            fillOpacity=".085"
            stroke="#375145"
            strokeOpacity=".32"
            strokeWidth="1.2"
          />
          <g transform="translate(14 44)">
            <ellipse cx="0" cy="14" rx="8" ry="3" fill="url(#cb-dewShadow)" />
            <ellipse cx="0" cy="4" rx="6" ry="8" fill="url(#cb-dewLens)" />
            <ellipse cx="-1.8" cy="1" rx="1.6" ry="1.1" fill="#FFF" fillOpacity=".75" />
          </g>
        </g>

        {/* gotas nos talos */}
        <g transform="translate(232 318)">
          <ellipse cx="0" cy="8" rx="5" ry="2" fill="url(#cb-dewShadow)" />
          <ellipse cx="0" cy="3" rx="4" ry="3.6" fill="url(#cb-dewLens)" />
        </g>
        <g transform="translate(268 308)">
          <ellipse cx="0" cy="6" rx="3.5" ry="1.4" fill="url(#cb-dewShadow)" />
          <ellipse cx="0" cy="2" rx="2.8" ry="2.5" fill="url(#cb-dewLens)" />
        </g>
      </svg>
    </div>
  );
}
