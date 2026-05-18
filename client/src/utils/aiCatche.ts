import { aiRecommendationService } from '@/services/aiRecommendationService';
import type { AIRecommendationResponse, CustomerProfile } from '@/types/aiRecommendation';

// 缓存大模型的调用结果，有效时长5分钟
const recommendationCache = new Map();

export async function fetchRecommendationsCache(
  customers: CustomerProfile[],
  topN: number
): Promise<AIRecommendationResponse> {
  const cacheKey = JSON.stringify(customers.map(c => c.id));
  const cached = recommendationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }
  const result = await aiRecommendationService.getRecommendations({ customers, topN });
  recommendationCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}