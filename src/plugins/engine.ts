import { LLMRankingService } from '@/services/llmRankingService';
import { Candidate, Plugin } from './types';
import { timestampPlugin } from './timestamp';
import { urlPlugin } from './url';
import { aiPlugin } from './ai-chat';

export const allPlugins: Plugin[] = [timestampPlugin, urlPlugin, aiPlugin];
const llmRankingService = new LLMRankingService();

export async function processInput(input: string): Promise<Candidate[]> {
  const results = allPlugins
    .map((plugin) => {
      try {
        return plugin.generate(input);
      } catch {
        return null;
      }
    })
    .filter((c): c is Candidate => c !== null);

  return llmRankingService.rankCandidates(input, results);
}
