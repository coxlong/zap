import { LLMRankingService } from '@/services/llmRankingService';
import { Candidate, Plugin } from './types';
import { timestampPlugin } from './timestamp';
import { urlPlugin } from './url';
import { aiPlugin } from './ai-chat';

export const allPlugins: Plugin[] = [timestampPlugin, urlPlugin, aiPlugin];
const llmRankingService = new LLMRankingService();

export function getLocalResults(input: string): Candidate[] {
  return allPlugins
    .map((plugin) => {
      try {
        return plugin.generate(input);
      } catch {
        return null;
      }
    })
    .filter((c): c is Candidate => c !== null)
    .sort((a, b) => b.priority - a.priority);
}

export async function rerank(
  input: string,
  candidates: Candidate[],
): Promise<Candidate[]> {
  return llmRankingService.rankCandidates(input, candidates);
}
