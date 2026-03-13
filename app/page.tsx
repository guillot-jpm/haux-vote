'use client';

import useSWR from 'swr';
import { ElectionState } from '@/types/election';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Home() {
  const { data: state, error, isLoading } = useSWR<ElectionState>('/api/election', fetcher, {
    refreshInterval: 3000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        <p className="mt-4 text-slate-600 font-medium">Chargement des résultats...</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm max-w-md w-full">
          <h2 className="text-lg font-bold mb-2">Erreur de connexion</h2>
          <p>Impossible de récupérer les résultats en direct. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  const isConfig = state.status === 'CONFIG' || (state.votants === 0 && state.inscrits === 0);

  if (isConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 px-8 py-10 rounded-xl shadow-sm max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Élections Municipales 2026</h1>
          <p className="text-slate-600 text-lg">
            Les élections municipales ne sont pas encore ouvertes ou le dépouillement n&apos;a pas commencé.
          </p>
          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-sm text-slate-400">
              Cette page se mettra à jour automatiquement dès le début du dépouillement.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalCounted = state.listAVotes + state.listBVotes + state.blancsNuls;
  const participationRate = state.inscrits > 0 ? (state.votants / state.inscrits) * 100 : 0;
  const progressPercent = state.votants > 0 ? (totalCounted / state.votants) * 100 : 0;

  const validExpected = state.votants - state.blancsNuls;
  const absolutePctA = validExpected > 0 ? (state.listAVotes / validExpected) * 100 : 0;
  const absolutePctB = validExpected > 0 ? (state.listBVotes / validExpected) * 100 : 0;

  const thresholdToWin = validExpected > 0 ? Math.floor(validExpected / 2) + 1 : 0;

  let winnerName = null;
  if (absolutePctA > 50) winnerName = state.listAName;
  if (absolutePctB > 50) winnerName = state.listBName;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {winnerName && (
          <div className="bg-slate-100 border border-slate-200 text-slate-800 p-4 rounded-xl text-center font-semibold shadow-sm">
            La liste {winnerName} remporte l&apos;élection avec la majorité absolue des suffrages.
          </div>
        )}

        {/* Header Section */}
        <header className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
            Élections Municipales 2026 - Résultats en direct
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Inscrits</p>
              <p className="text-2xl font-bold text-slate-900">{state.inscrits.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Votants (Enveloppes)</p>
              <p className="text-2xl font-bold text-slate-900">{state.votants.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Participation</p>
              <p className="text-2xl font-bold text-slate-900">{participationRate.toFixed(2)}%</p>
            </div>
          </div>
        </header>

        {/* Progress Section */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-lg font-semibold text-slate-900">Avancement du dépouillement</h2>
            <p className="text-sm font-medium text-slate-600">
              {totalCounted} / {state.votants} enveloppes
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-right text-sm font-bold text-slate-900">
            {progressPercent.toFixed(1)}%
          </p>
        </section>

        {/* Results Section */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 px-2">Résultats des listes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListResultCard
              name={state.listAName}
              votes={state.listAVotes}
              validExpected={state.votants - state.blancsNuls}
              countedValid={state.listAVotes + state.listBVotes}
              color="blue"
              thresholdToWin={thresholdToWin}
              isAnyWinner={!!winnerName}
            />
            <ListResultCard
              name={state.listBName}
              votes={state.listBVotes}
              validExpected={state.votants - state.blancsNuls}
              countedValid={state.listAVotes + state.listBVotes}
              color="red"
              thresholdToWin={thresholdToWin}
              isAnyWinner={!!winnerName}
            />
          </div>
        </section>

        {/* Blancs/Nuls Section */}
        <section className="bg-slate-100 p-6 rounded-xl border border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Blancs ou nuls</h3>
            <p className="text-sm text-slate-500 font-medium">Enveloppes non exprimées</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-900">{state.blancsNuls}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Votes</p>
          </div>
        </section>

        {state.status === 'FINISHED' && (
          <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg text-center animate-bounce">
            <h2 className="text-2xl font-bold">Dépouillement Terminé</h2>
            <p className="mt-1 opacity-90">Les résultats ci-dessus sont définitifs.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ListResultCard({
  name,
  votes,
  validExpected,
  countedValid,
  color,
  thresholdToWin,
  isAnyWinner,
}: {
  name: string;
  votes: number;
  validExpected: number;
  countedValid: number;
  color: 'blue' | 'red';
  thresholdToWin: number;
  isAnyWinner: boolean;
}) {
  const relativePercent = countedValid > 0 ? (votes / countedValid) * 100 : 0;
  const absolutePercent = validExpected > 0 ? (votes / validExpected) * 100 : 0;

  const votesNeeded = thresholdToWin - votes;

  const colorClasses = {
    blue: 'border-l-blue-600 text-blue-600',
    red: 'border-l-red-600 text-red-600',
  };

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-8 ${colorClasses[color]}`}>
      <h3 className="text-xl font-bold text-slate-900 mb-4 truncate">{name}</h3>

      <div className="flex justify-between items-baseline mb-2">
        <span className="text-4xl font-black text-slate-900">{votes}</span>
        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Suffrages</span>
      </div>

      {!isAnyWinner && votesNeeded > 0 && validExpected > 0 && (
        <p className="text-xs italic text-slate-500 mb-4">
          Plus que {votesNeeded} voix pour atteindre la majorité absolue.
        </p>
      )}

      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">Pourcentage relatif</span>
            <span className="font-bold text-slate-900">{relativePercent.toFixed(2)}%</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Des suffrages exprimés à l&apos;instant T
          </p>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">Pourcentage absolu</span>
            <span className="font-bold text-slate-900">{absolutePercent.toFixed(2)}%</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Du total estimé (Votants - Blancs/Nuls)
          </p>
        </div>
      </div>
    </div>
  );
}
