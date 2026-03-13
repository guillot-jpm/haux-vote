'use server'

import { Redis } from '@upstash/redis'
import { ElectionState } from '@/types/election'
import { revalidatePath } from 'next/cache'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const REDIS_KEY = 'election_data'

const defaultState: ElectionState = {
  listAName: '',
  listBName: '',
  inscrits: 0,
  votants: 0,
  listAVotes: 0,
  listBVotes: 0,
  blancsNuls: 0,
  history: [],
  status: 'CONFIG',
}

export async function getElectionState(): Promise<ElectionState> {
  try {
    const data = await redis.get<ElectionState>(REDIS_KEY)
    return data ?? defaultState
  } catch (error) {
    console.error('Failed to fetch from Redis:', error)
    return defaultState
  }
}

export async function initElection(listA: string, listB: string, inscrits: number) {
  try {
    const currentState = await getElectionState()
    const newState: ElectionState = {
      ...currentState,
      listAName: listA,
      listBName: listB,
      inscrits: inscrits,
    }
    await redis.set(REDIS_KEY, newState)
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to init election:', error)
  }
}

export async function resetElection() {
  try {
    await redis.del(REDIS_KEY)
    revalidatePath('/')
  } catch (error) {
    console.error('Failed to reset election:', error)
  }
}
