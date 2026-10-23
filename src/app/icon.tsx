import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Compact favicon mark matching the hey! Bus brand colors. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#155eef",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: -0.5,
          }}
        >
          <span style={{ color: "#ffd7c2", fontSize: 16 }}>hey!</span>
          <span style={{ fontSize: 18 }}>Bus</span>
        </div>
      </div>
    ),
    size,
  );
}
