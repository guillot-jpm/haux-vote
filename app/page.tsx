import { getElectionState, resetElection } from "@/actions/db";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let state = null;
  let error = null;

  try {
    state = await getElectionState();
  } catch (e) {
    console.error("Failed to fetch election state:", e);
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Election Debug UI</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error connecting to Redis:</p>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current State:</h2>
        {state ? (
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(state, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500 italic">No state available.</p>
        )}
      </div>

      <form action={resetElection}>
        <button
          type="submit"
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Reset Election
        </button>
      </form>
    </div>
  );
}
