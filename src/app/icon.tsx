import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Compact favicon mark for K-BUS HUB. */
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
          background: "#0e1c2f",
          borderRadius: 14,
          color: "white",
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: -0.5,
        }}
      >
        KB
      </div>
    ),
    size,
  );
}
