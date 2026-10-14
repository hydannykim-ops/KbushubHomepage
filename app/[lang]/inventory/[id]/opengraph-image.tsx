import { ImageResponse } from "next/og";
import { vehicleTitle } from "@/lib/domain";
import { publicData } from "@/lib/store";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "K-BUS HUB listing";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { id } = await params;
  const data = await publicData();
  const vehicle = data.ok ? data.vehicles.find((item) => item.id === id && item.status !== "hidden") : null;
  const title = vehicle ? vehicleTitle(vehicle, "en") : "K-BUS HUB";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f4f1eb",
          color: "#14181f",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
        }}
      >
        <div style={{ fontSize: 28, color: "#1a3f8f" }}>K-BUS HUB · SAMPLE</div>
        <div style={{ fontSize: 64, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 28 }}>{vehicle ? vehicle.id : id}</div>
      </div>
    ),
    { ...size },
  );
}
