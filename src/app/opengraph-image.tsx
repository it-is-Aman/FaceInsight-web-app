import { ImageResponse } from "next/og";

export const alt = "FaceInsight AI: understand your skin from one selfie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #fbfaf7 0%, #e3f1f1 100%)",
          color: "#1d2a33",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#1f7f86", display: "flex" }} />
          FaceInsight AI
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -2, maxWidth: 900 }}>
            Understand your skin from one selfie.
          </div>
          <div style={{ fontSize: 30, color: "#55636d" }}>
            15 concerns · personalised routine · photos never stored
          </div>
        </div>
      </div>
    ),
    size,
  );
}
