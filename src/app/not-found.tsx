import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-base-content/70 mb-6">Page not found</p>
      <Link href="/" className="btn btn-primary">
        Go Home
      </Link>
    </div>
  );
}
