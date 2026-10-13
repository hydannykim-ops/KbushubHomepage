import { notFound } from "next/navigation";
import { VehicleForm } from "@/components/vehicle-form";
import { addPhotoSlot, movePhoto, removePhoto, uploadVehiclePhoto } from "@/lib/actions";
import { getDict, isLocale } from "@/lib/i18n";
import { adminGate } from "@/lib/store";
import { btnSmall, fieldClass } from "@/lib/ui";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const gate = await adminGate();
  if (!gate.ok) return null;
  const vehicle = gate.db.vehicles.find((item) => item.id === id);
  if (!vehicle) notFound();
  const dict = getDict(lang);
  const categories = ["exterior", "interior", "dashboard", "engine", "tires", "defect"] as const;
  return (
    <div className="grid gap-6">
      <div className="border border-line bg-white p-5">
        <h2 className="text-xl font-semibold">{vehicle.id}</h2>
        <div className="mt-5">
          <VehicleForm lang={lang} vehicle={vehicle} />
        </div>
      </div>
      <section className="border border-line bg-white p-5">
        <h2 className="font-semibold">{dict.a11y.gallery}</h2>
        <p className="mt-1 text-xs text-muted">{dict.admin.cover}</p>
        <ul className="mt-4 grid gap-3">
          {vehicle.photos.map((photo) => (
            <li key={photo.id} className="flex flex-wrap items-center justify-between gap-2 border border-line px-3 py-2 text-sm">
              <span>{dict.photo[photo.category]} · {photo.file ? photo.file : dict.common.photoPending}</span>
              <span className="flex gap-2">
                <form action={movePhoto}><input type="hidden" name="id" value={vehicle.id} /><input type="hidden" name="photoId" value={photo.id} /><input type="hidden" name="direction" value="up" /><button className={btnSmall}>{dict.admin.moveUp}</button></form>
                <form action={movePhoto}><input type="hidden" name="id" value={vehicle.id} /><input type="hidden" name="photoId" value={photo.id} /><input type="hidden" name="direction" value="down" /><button className={btnSmall}>{dict.admin.moveDown}</button></form>
                <form action={removePhoto}><input type="hidden" name="id" value={vehicle.id} /><input type="hidden" name="photoId" value={photo.id} /><button className={btnSmall}>{dict.admin.remove}</button></form>
              </span>
            </li>
          ))}
        </ul>
        <form action={addPhotoSlot} className="mt-4 flex flex-wrap gap-2">
          <input type="hidden" name="id" value={vehicle.id} />
          <select name="category" className={fieldClass}>{categories.map((item) => <option key={item} value={item}>{dict.photo[item]}</option>)}</select>
          <button className={btnSmall}>{dict.admin.addSlot}</button>
        </form>
        <form action={uploadVehiclePhoto} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={vehicle.id} />
          <select name="category" className={fieldClass}>{categories.map((item) => <option key={item} value={item}>{dict.photo[item]}</option>)}</select>
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
          <button className={btnSmall}>{dict.admin.upload}</button>
        </form>
      </section>
    </div>
  );
}
