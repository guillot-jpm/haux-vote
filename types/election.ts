export interface ElectionState {
  listAName: string;
  listBName: string;
  inscrits: number;
  votants: number;
  listAVotes: number;
  listBVotes: number;
  blancsNuls: number;
  history: string[];
  status: 'CONFIG' | 'COUNTING' | 'FINISHED';
}
