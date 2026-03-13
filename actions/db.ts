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
  revalidatePath('/admin');
  return newState;
}

export async function openCounting(votants: number) {
  const currentState = await getElectionState();
  if (currentState.status !== 'CONFIG') {
    throw new Error("L'élection n'est pas en phase de configuration.");
  }

  if (votants > currentState.inscrits) {
    throw new Error("Le nombre de votants ne peut pas être supérieur au nombre d'inscrits.");
  }

  const newState: ElectionState = {
    ...currentState,
    votants,
    status: 'COUNTING',
  };
  const client = await getClient();
  await client.set('election_data', JSON.stringify(newState));
  revalidatePath('/');
  revalidatePath('/admin');
  return newState;
}

export async function resetElection() {
  const client = await getClient();
  await client.del('election_data');
  revalidatePath('/');
  revalidatePath('/admin');
}

// Wrapper actions for FormData
export async function initElectionAction(formData: FormData) {
  const listAName = formData.get('listAName') as string;
  const listBName = formData.get('listBName') as string;
  const inscritsValue = formData.get('inscrits');
  const inscrits = parseInt(inscritsValue as string, 10);

  if (!listAName || !listBName || isNaN(inscrits)) {
    throw new Error('Données invalides');
  }

  await initElection(listAName, listBName, inscrits);
}

export async function openCountingAction(formData: FormData) {
  const votantsValue = formData.get('votants');
  const votants = parseInt(votantsValue as string, 10);

  if (isNaN(votants)) {
    throw new Error('Nombre de votants invalide');
  }

  await openCounting(votants);
}
