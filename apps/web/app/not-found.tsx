import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] p-6 text-center font-mono lowercase">
      <div className="max-w-md border border-line bg-white p-8 shadow-xs rounded-md">
        <span className="text-xs text-stone-400 font-bold block mb-2">404 error</span>
        <h1 className="text-2xl font-bold font-sans text-stone-900 mb-3">page not found</h1>
        <p className="text-xs text-stone-600 font-sans leading-relaxed mb-6">
          the page or queue slot you are looking for does not exist or has been relocated.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-secondary-border bg-secondary px-4 py-2 text-xs font-bold text-stone-900 hover:bg-[#ebd0a3] transition-colors rounded-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>return home</span>
        </Link>
      </div>
    </div>
  );
}
