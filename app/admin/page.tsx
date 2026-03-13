import { logout } from '@/actions/auth';

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
        <p className="text-gray-600">Bienvenue dans l&apos;espace d&apos;administration.</p>

        <div className="pt-6">
          <form action={logout}>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
