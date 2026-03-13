import { getElectionState, resetElection } from "@/actions/db";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const state = await getElectionState();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Election Debug UI</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current State:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(state, null, 2)}
        </pre>
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
