import { VehicleForm } from "@/components/admin/editors";

export default function NewVehiclePage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">매물 등록</h1>
      <div className="rounded-lg border border-line bg-white p-4">
        <VehicleForm vehicle={null} />
      </div>
    </div>
  );
}
