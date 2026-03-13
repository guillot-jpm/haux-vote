import { logout } from '@/actions/auth';
import { getElectionState, initElectionAction, openCountingAction, resetElection } from '@/actions/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const state = await getElectionState();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Administrateur</h1>
          <form action={logout}>
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Se déconnecter
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Condition A: Configuration Initiale */}
          {state.status === 'CONFIG' && state.inscrits === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Formulaire 1 : Configuration Initiale</h2>
              <form action={initElectionAction} className="space-y-4">
                <div>
                  <label htmlFor="listAName" className="block text-sm font-medium text-gray-700">Nom de la Liste A</label>
                  <input
                    type="text"
                    name="listAName"
                    id="listAName"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="listBName" className="block text-sm font-medium text-gray-700">Nom de la Liste B</label>
                  <input
                    type="text"
                    name="listBName"
                    id="listBName"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="inscrits" className="block text-sm font-medium text-gray-700">Nombre d&apos;inscrits</label>
                  <input
                    type="number"
                    name="inscrits"
                    id="inscrits"
                    min="1"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Enregistrer la configuration
                </button>
              </form>
            </div>
          )}

          {/* Condition B: Ouverture du dépouillement */}
          {state.status === 'CONFIG' && state.inscrits > 0 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Résumé de la configuration</h2>
                <div className="bg-gray-100 p-4 rounded-md grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="font-bold">Liste A:</span> {state.listAName}</div>
                  <div><span className="font-bold">Liste B:</span> {state.listBName}</div>
                  <div><span className="font-bold">Inscrits:</span> {state.inscrits}</div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-800">Formulaire 2 : Ouverture du dépouillement</h2>
                <form action={openCountingAction} className="space-y-4">
                  <div>
                    <label htmlFor="votants" className="block text-sm font-medium text-gray-700">
                      Nombre de votants (enveloppes trouvées dans l&apos;urne)
                    </label>
                    <input
                      type="number"
                      name="votants"
                      id="votants"
                      min="1"
                      max={state.inscrits}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Le nombre de votants ne peut pas dépasser le nombre d&apos;inscrits ({state.inscrits}).</p>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Ouvrir le dépouillement
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Condition C: Dépouillement en cours ou terminé */}
          {(state.status === 'COUNTING' || state.status === 'FINISHED') && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-700">
                  Le dépouillement est en cours. L&apos;interface de comptage sera bientôt disponible.
                </p>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">Résumé de la configuration</h2>
                <div className="bg-gray-100 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-bold">Liste A:</span> {state.listAName}</div>
                  <div><span className="font-bold">Liste B:</span> {state.listBName}</div>
                  <div><span className="font-bold">Inscrits:</span> {state.inscrits}</div>
                  <div><span className="font-bold">Votants:</span> {state.votants}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reset Button */}
        <div className="pt-8 border-t flex justify-center">
          <form action={resetElection}>
            <button
              type="submit"
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Réinitialiser l&apos;élection
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
