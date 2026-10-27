export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10" aria-busy="true">
      <div className="h-9 w-40 animate-pulse bg-[#e8eef8]" />
      <div className="mt-3 h-4 w-64 animate-pulse bg-[#eef2f6]" />
      <div className="mt-8 h-56 animate-pulse border border-line bg-white" />
    </div>
  );
}
