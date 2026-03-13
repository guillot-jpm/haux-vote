'use client';

import { useTransition } from 'react';
import { ElectionState } from '@/types/election';

interface CountingInterfaceProps {
  state: ElectionState;
  addVote: (type: 'A' | 'B' | 'NUL') => Promise<ElectionState>;
  undoLastVote: () => Promise<ElectionState>;
}

export default function CountingInterface({ state, addVote, undoLastVote }: CountingInterfaceProps) {
  const [isPending, startTransition] = useTransition();

  const { listAName, listBName, votants, listAVotes, listBVotes, blancsNuls, history } = state;

  const totalCounted = listAVotes + listBVotes + blancsNuls;
  const validExpected = votants - blancsNuls;

  const calculatePercentage = (votes: number) => {
    if (validExpected <= 0) return '0.0';
    return ((votes / validExpected) * 100).toFixed(1);
  };

  const absolutePctA = calculatePercentage(listAVotes);
  const absolutePctB = calculatePercentage(listBVotes);

  const thresholdToWin = validExpected > 0 ? Math.floor(validExpected / 2) + 1 : 0;
  const isAnyWinner = (validExpected > 0) && (listAVotes >= thresholdToWin || listBVotes >= thresholdToWin);

  const handleAddVote = (type: 'A' | 'B' | 'NUL') => {
    startTransition(async () => {
      try {
        await addVote(type);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Une erreur est survenue');
      }
    });
  };

  const handleUndo = () => {
    startTransition(async () => {
      try {
        await undoLastVote();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Une erreur est survenue');
      }
    });
  };

  const progress = votants > 0 ? (totalCounted / votants) * 100 : 0;
  const isFinished = totalCounted >= votants;

  return (
    <div className="space-y-8">
      {/* Header & Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-gray-800">Dépouillement en cours</h2>
          <span className="text-sm font-medium text-gray-600">
            {totalCounted} / {votants} enveloppes
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      </div>

      {isFinished && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded text-green-700 text-center font-bold">
          Dépouillement terminé. Tous les bulletins ont été saisis.
        </div>
      )}

      {/* Main Counting Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <button
            onClick={() => handleAddVote('A')}
            disabled={isPending || isFinished}
            className="w-full h-32 text-2xl font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-blue-100 text-blue-800 border-2 border-blue-200 hover:bg-blue-200"
          >
            {listAName}
          </button>
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-700">
              {listAVotes} voix ({absolutePctA}%)
            </p>
            {!isAnyWinner && thresholdToWin - listAVotes > 0 && validExpected > 0 && (
              <p className="text-sm italic text-gray-500">
                Plus que {thresholdToWin - listAVotes} voix pour atteindre la majorité absolue.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleAddVote('B')}
            disabled={isPending || isFinished}
            className="w-full h-32 text-2xl font-bold rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-red-100 text-red-800 border-2 border-red-200 hover:bg-red-200"
          >
            {listBName}
          </button>
          <div className="text-center space-y-1">
            <p className="font-semibold text-gray-700">
              {listBVotes} voix ({absolutePctB}%)
            </p>
            {!isAnyWinner && thresholdToWin - listBVotes > 0 && validExpected > 0 && (
              <p className="text-sm italic text-gray-500">
                Plus que {thresholdToWin - listBVotes} voix pour atteindre la majorité absolue.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="w-full max-w-md space-y-2">
          <button
            onClick={() => handleAddVote('NUL')}
            disabled={isPending || isFinished}
            className="w-full h-20 text-xl font-bold rounded-xl shadow transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-gray-100 text-gray-800 border-2 border-gray-200 hover:bg-gray-200"
          >
            Blanc ou nul
          </button>
          <p className="text-center font-semibold text-gray-600">
            {blancsNuls} votes blancs ou nuls
          </p>
        </div>

        <button
          onClick={handleUndo}
          disabled={isPending || history.length === 0}
          className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler le dernier vote
        </button>
      </div>

    </div>
  );
}
