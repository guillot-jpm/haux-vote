'use server';

export async function getElectionState() {
  // Simulating a successful database fetch without importing Redis at all
  return { status: "MOCK_DB_ACTIVE", votes: 0 };
}

export async function resetElection() {
  console.log("Mock reset triggered");
}
