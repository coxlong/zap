import { generateText, Output } from 'ai';
import { z } from 'zod';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { Candidate } from '../plugins/types';

interface RankingCandidate {
  id: number;
  title: string;
  description: string;
  detailedDescription: string;
  priority: number;
}

export class LLMRankingService {
  private llmProvider: ReturnType<typeof createOpenAICompatible> | null = null;

  private getLLMProvider() {
    if (!this.llmProvider) {
      this.llmProvider = createOpenAICompatible({
        name: 'ipc-proxy',
        baseURL: 'ipc://localhost/v1',
        apiKey: 'dummy',
      });
    }
    return this.llmProvider;
  }

  async rankCandidates(
    query: string,
    candidates: Candidate[],
  ): Promise<Candidate[]> {
    if (candidates.length <= 1) {
      return candidates;
    }

    try {
      const ranked = await this.rankWithLLM(query, candidates);
      return ranked;
    } catch (error) {
      return LLMRankingService.fallbackRanking(candidates);
    }
  }

  private async rankWithLLM(
    query: string,
    candidates: Candidate[],
  ): Promise<Candidate[]> {
    const llm = this.getLLMProvider();

    const rankingCandidates: RankingCandidate[] = candidates.map(
      (candidate, index) => ({
        id: index + 1,
        title: candidate.title,
        description: candidate.description,
        detailedDescription: candidate.detailedDescription,
        priority: candidate.priority,
      }),
    );

    const prompt = `请根据用户查询"${query}"，对以下候选功能进行相关性排序。

候选功能信息：
${JSON.stringify(rankingCandidates, null, 2)}

请返回一个按相关性从高到低排序的候选ID列表。`;

    try {
      const result = await generateText({
        model: llm('qwen2.5:1.5b'),
        system:
          '你是一个智能排序助手，负责根据用户查询对功能选项进行相关性排序。请仔细分析每个候选功能的功能描述，返回最符合用户需求的排序结果。请返回一个按相关性从高到低排序的候选ID列表。',
        output: Output.object({
          schema: z.object({
            rankedIds: z
              .array(z.number())
              .describe('按相关性从高到低排序的候选ID列表'),
          }),
        }),
        prompt,
        temperature: 0.1,
      });

      if (!result || !result.output || !result.output.rankedIds) {
        return LLMRankingService.fallbackRanking(candidates);
      }

      const { rankedIds } = result.output;
      const rankedCandidates = rankedIds
        .map((id) => {
          const originalIndex = rankingCandidates.findIndex(
            (candidate) => candidate.id === id,
          );
          if (originalIndex === -1) {
            return null;
          }
          return candidates[originalIndex];
        })
        .filter((c): c is Candidate => c !== null);

      if (rankedCandidates.length === 0) {
        return LLMRankingService.fallbackRanking(candidates);
      }

      return rankedCandidates;
    } catch {
      return LLMRankingService.fallbackRanking(candidates);
    }
  }

  private static fallbackRanking(candidates: Candidate[]): Candidate[] {
    return [...candidates].sort((a, b) => b.priority - a.priority);
  }
}
