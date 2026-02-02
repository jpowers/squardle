export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-base-300 rounded w-1/3 mb-4"></div>
      <div className="h-6 bg-base-300 rounded w-1/4 mb-8"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-base-300 rounded max-w-md"></div>
        <div className="space-y-4">
          <div className="h-8 bg-base-300 rounded w-1/2"></div>
          <div className="h-32 bg-base-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}
