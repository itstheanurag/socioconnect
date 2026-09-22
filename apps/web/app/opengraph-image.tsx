import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SocioConnect - Multi-Channel Social Studio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#1C1917",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "#FAF7F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "24px",
              color: "#1C1917",
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#FAF7F2",
              letterSpacing: "-0.5px",
            }}
          >
            SocioConnect
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              maxWidth: "1000px",
            }}
          >
            Write once. Broadcast natively across all social channels.
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#A8A29E",
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Autonomous scheduling, tone adaptation, and fault-tolerant multi-platform publishing for modern creators and teams.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "20px",
            color: "#D6D3D1",
            borderTop: "1px solid #292524",
            paddingTop: "24px",
            width: "100%",
          }}
        >
          <span>YouTube</span>
          <span>•</span>
          <span>X / Twitter</span>
          <span>•</span>
          <span>LinkedIn</span>
          <span>•</span>
          <span>Reddit</span>
          <span>•</span>
          <span>Discord</span>
          <span>•</span>
          <span>Instagram</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
