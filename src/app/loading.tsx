export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-[90rem] animate-pulse space-y-6 p-4 sm:p-6 lg:p-8"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Chargement du contenu</span>
      <div className="bg-navy-200/60 h-72 rounded-[1.75rem]" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded-card shadow-card h-48 bg-white" />
        ))}
      </div>
    </div>
  );
}
