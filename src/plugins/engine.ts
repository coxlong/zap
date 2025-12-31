import { sortCandidates } from '@/sorter';
import { Candidate } from './types';
import { timestampPlugin } from './timestamp';
import { urlPlugin } from './url';
import { aiPlugin } from './ai-chat';

const allPlugins = [timestampPlugin, urlPlugin, aiPlugin];

export function processInput(input: string): Candidate[] {
  const results = allPlugins
    .map((plugin) => {
      try {
        return plugin.generate(input);
      } catch {
        return null;
      }
    })
    .filter((c): c is Candidate => c !== null);

  return sortCandidates(input, results);
}
