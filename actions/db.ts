'use server';

import { createClient } from 'redis';
import { ElectionState } from '@/types/election';
import { revalidatePath } from 'next/cache';

const redisClientSingleton = () => {
  if (!process.env.REDIS_URL) {
    console.warn('REDIS_URL is not defined. Redis client will not be able to connect.');
  }
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      connectTimeout: 5000,
    }
  });
  client.on('error', (err) => console.error('Redis Client Error', err));
  return client;
};

declare global {
  var redis: undefined | ReturnType<typeof redisClientSingleton>;
}

const redis = globalThis.redis ?? redisClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.redis = redis;

async function getClient() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

const DEFAULT_STATE: ElectionState = {
  listAName: '',
  listBName: '',
  inscrits: 0,
  votants: 0,
  listAVotes: 0,
  listBVotes: 0,
  blancsNuls: 0,
  history: [],
  status: 'CONFIG',
};

export async function getElectionState(): Promise<ElectionState> {
  const client = await getClient();
  const data = await client.get('election_data');
  if (!data) {
    return DEFAULT_STATE;
  }
  return JSON.parse(data) as ElectionState;
}

export async function initElection(listAName: string, listBName: string, inscrits: number) {
  const currentState = await getElectionState();
  const newState: ElectionState = {
    ...currentState,
    listAName,
    listBName,
    inscrits,
    status: 'CONFIG',
  };
  const client = await getClient();
  await client.set('election_data', JSON.stringify(newState));
  revalidatePath('/');
  return newState;
}

export async function resetElection() {
  const client = await getClient();
  await client.del('election_data');
  revalidatePath('/');
}
