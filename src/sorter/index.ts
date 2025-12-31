import { Candidate } from '@/plugins/types';

const pluginOrder: Record<string, number> = {
  timestamp: 3,
  url: 2,
  'ai-chat': 1,
};

export function sortCandidates(
  _input: string,
  candidates: Candidate[],
): Candidate[] {
  return candidates
    .map((c) => ({ candidate: c, score: pluginOrder[c.pluginId] || 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.candidate);
}
