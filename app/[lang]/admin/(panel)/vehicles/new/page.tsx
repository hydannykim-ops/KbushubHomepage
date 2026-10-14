import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/vehicle-form";
import { getDict, isLocale } from "@/lib/i18n";

export default async function NewVehiclePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDict(lang);
  return (
    <div className="border border-line bg-white p-5">
      <h2 className="text-xl font-semibold">{dict.admin.newVehicle}</h2>
      <div className="mt-5">
        <VehicleForm lang={lang} />
      </div>
    </div>
  );
}
