import { LLMRankingService } from '@/services/llmRankingService';
import { Candidate, Plugin } from './types';
import { timestampPlugin } from './timestamp';
import { urlPlugin } from './url';
import { aiPlugin } from './ai-chat';

export const allPlugins: Plugin[] = [timestampPlugin, urlPlugin, aiPlugin];
const llmRankingService = new LLMRankingService();

export async function getLocalResults(input: string): Promise<Candidate[]> {
  const results = await Promise.all(
    allPlugins.map(async (plugin) => {
      try {
        return await plugin.generate(input);
      } catch {
        return [];
      }
    })
  );

  return results
    .flat()
    .sort((a, b) => b.priority - a.priority);
}

export async function rerank(
  input: string,
  candidates: Candidate[],
): Promise<Candidate[]> {
  return llmRankingService.rankCandidates(input, candidates);
}
