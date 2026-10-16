export default function LoadingVehicles() {
  return (
    <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8" aria-busy="true">
      <div className="h-8 w-40 rounded bg-[#e7edf4]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-72 rounded-lg border border-line bg-white" />
        ))}
      </div>
    </div>
  );
}
