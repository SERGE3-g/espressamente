import Link from "next/link";
import { Coffee } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-brand-50 to-white">
      <div className="mb-6 animate-[float_3s_ease-in-out_infinite]">
        <Coffee className="w-16 h-16 text-brand-300" />
      </div>
      <h1 className="font-heading text-7xl font-bold text-brand-900 mb-2">404</h1>
      <h2 className="font-heading text-2xl font-semibold text-brand-700 mb-4">
        Pagina non trovata
      </h2>
      <p className="text-brand-500 max-w-sm mb-10 leading-relaxed">
        La pagina che stai cercando non esiste o è stata spostata.
        Forse una buona tazza di caffè ti aiuterà a ritrovarti.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-7 py-3 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-brand-400/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          Torna alla home
        </Link>
        <Link
          href="/caffe"
          className="px-7 py-3 border border-brand-300 text-brand-900 font-medium rounded-xl hover:bg-brand-50 hover:border-brand-400 transition-all duration-200"
        >
          Scopri i nostri caffè
        </Link>
      </div>
    </div>
  );
}
