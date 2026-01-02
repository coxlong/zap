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
  rankingField: string;
}

export class LLMRankingService {
  private llmProvider: ReturnType<typeof createOpenAICompatible> | null = null;

  private async getLLMProvider() {
    if (!this.llmProvider) {
      this.llmProvider = createOpenAICompatible({
        name: 'ipc-proxy',
        baseURL: 'ipc://localhost',
        supportsStructuredOutputs: true,
      });
    }
    return this.llmProvider;
  }

  private static async getConfig() {
    if (typeof window !== 'undefined' && window.desktop.getConfig) {
      try {
        const config = await window.desktop.getConfig();
        return config.ranking;
      } catch {
        return LLMRankingService.getDefaultConfig();
      }
    }
    return LLMRankingService.getDefaultConfig();
  }

  private static getDefaultConfig() {
    return {
      modelName: 'qwen2.5:1.5b',
      systemPrompt:
        '你是一个智能排序助手，负责根据用户查询对功能选项进行相关性排序。请仔细分析每个候选功能的功能描述，返回最符合用户需求的排序结果。',
      temperature: 0.1,
      timeout: 5000,
    };
  }

  async rankCandidates(
    query: string,
    candidates: Candidate[],
  ): Promise<Candidate[]> {
    if (candidates.length <= 1) {
      return candidates;
    }

    try {
      const config = await LLMRankingService.getConfig();
      const ranked = await this.rankWithLLM(query, candidates, config);
      return ranked;
    } catch {
      return LLMRankingService.fallbackRanking(candidates);
    }
  }

  private async rankWithLLM(
    query: string,
    candidates: Candidate[],
    config: any,
  ): Promise<Candidate[]> {
    const llm = await this.getLLMProvider();

    const rankingCandidates: RankingCandidate[] = candidates.map(
      (candidate, index) => ({
        id: index + 1,
        title: candidate.title,
        description: candidate.description,
        detailedDescription: candidate.detailedDescription,
        priority: candidate.priority,
        rankingField: candidate.rankingField,
      }),
    );

    const candidateText = rankingCandidates
      .map((candidate) => {
        return `${candidate.id}: ${candidate.rankingField}`;
      })
      .join('\n');

    const prompt = `请根据用户查询"${query}"，对以下候选功能进行相关性排序。

候选功能信息：
${candidateText}

请返回一个按相关性从高到低排序的候选ID列表。`;

    try {
      const result = await generateText({
        model: llm(config.modelName || 'qwen2.5:1.5b'),
        system: config.systemPrompt,
        output: Output.object({
          schema: z.object({
            rankedIds: z
              .array(z.number())
              .describe('按相关性从高到低排序的候选ID列表'),
          }),
        }),
        prompt,
        temperature: config.temperature || 0.1,
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
