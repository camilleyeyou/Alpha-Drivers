export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
        <div className="mb-4 h-4 w-72 rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="mt-8 h-64 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
