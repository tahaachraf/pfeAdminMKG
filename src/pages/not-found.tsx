import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-lg text-gray-600">Page introuvable</p>
        <Link href="/" className="mt-6 inline-block text-violet-600 hover:underline text-sm">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
