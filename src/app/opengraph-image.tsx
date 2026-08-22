import { ImageResponse } from "next/og";

export const alt = "Iseul | Skincare coreano com curadoria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAF8F4",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(120% 80% at 50% -10%, #E4EFE9 0%, transparent 62%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            fontSize: 280,
            color: "#8FA89A",
            opacity: 0.12,
            fontFamily: "Georgia",
            fontWeight: 400,
          }}
        >
          Iseul
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 48,
              height: 64,
              marginBottom: 28,
              borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
              background: "linear-gradient(135deg, #A8C4B4 0%, #8FA89A 100%)",
              boxShadow: "0 4px 12px rgba(55, 81, 69, 0.22)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#8FA89A",
              marginBottom: 16,
              fontFamily: "Georgia",
            }}
          >
            Iseul · orvalho
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 64,
              lineHeight: 1.05,
              color: "#1C1A16",
              textAlign: "center",
              fontFamily: "Georgia",
              fontWeight: 400,
            }}
          >
            A pele que acorda{" "}
            <span style={{ fontStyle: "italic", color: "#8FA89A" }}>com orvalho.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 24,
              color: "#6E675C",
              textAlign: "center",
              maxWidth: 680,
              lineHeight: 1.5,
              fontFamily: "Arial",
            }}
          >
            Skincare coreano original, escolhido produto a produto.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
