import { getElectionState, resetElection } from "@/actions/db";

export default async function Home() {
  const electionState = await getElectionState();

  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Election Debug UI</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Current Election State:</h2>
        <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-md overflow-auto border border-zinc-200 dark:border-zinc-800">
          {JSON.stringify(electionState, null, 2)}
        </pre>
      </div>

      <form action={resetElection}>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Reset Election
        </button>
      </form>
    </main>
  );
}
